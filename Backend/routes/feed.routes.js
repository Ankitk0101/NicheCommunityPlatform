const express = require('express');
const feedRoute = express.Router();
const Post = require('../models/post.model');
const Community = require('../models/community.model');
const User = require('../models/auth.model');
const authMiddleware = require('../middleware/auth.middleware');

feedRoute.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'new';
    const skip = (page - 1) * limit;

    // Check if user exists and get joined communities
    const user = userId ? await User.findById(userId).select('joinedCommunities') : null;
    
    let joinedCommunityIds = [];
    if (user) {
      joinedCommunityIds = user.joinedCommunities || [];
    }

    if (joinedCommunityIds.length === 0) {
      const suggestedPosts = await getSuggestedPosts(limit);
      return res.json({
        posts: suggestedPosts,
        currentPage: page,
        totalPages: 1,
        totalPosts: suggestedPosts.length,
        hasMore: false
      });
    }

    // Build the base query
    let query = Post.find({
      community: { $in: joinedCommunityIds },
      isDeleted: { $ne: true }
    })
      .populate('author', 'username avatar displayName')
      .populate('community', 'name icon members memberCount');

    // Apply sorting based on sortBy parameter
    switch (sortBy) {
      case 'hot':
        // For "hot", we'll use a combination of score and recency
        query = query.sort({ 
          score: -1, 
          createdAt: -1 
        });
        break;
      case 'top':
        // For "top", sort by upvotes (score)
        query = query.sort({ upvotes: -1 });
        break;
      case 'controversial':
        // For "controversial", we need to use aggregation
        // We'll handle this case separately
        const controversialPosts = await getControversialPosts(joinedCommunityIds, limit, skip);
        const postsWithVoteStatus = await addVoteStatusToPosts(controversialPosts, userId);
        
        const totalPosts = await Post.countDocuments({
          community: { $in: joinedCommunityIds },
          isDeleted: { $ne: true }
        });

        return res.json({
          posts: postsWithVoteStatus,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasMore: page * limit < totalPosts
        });
      case 'new':
      default:
        query = query.sort({ createdAt: -1 });
        break;
    }

    // For non-controversial sorting, execute the query
    const posts = await query
      .skip(skip)
      .limit(limit)
      .lean();

    const postsWithVoteStatus = await Promise.all(
      posts.map(async (post) => {
        const voteStatus = userId ? await getVoteStatus(post._id, userId) : null;
        return {
          ...post,
          userVote: voteStatus,
          score: post.upvotes - post.downvotes
        };
      })
    );

    const totalPosts = await Post.countDocuments({
      community: { $in: joinedCommunityIds },
      isDeleted: { $ne: true }
    });

    res.json({
      posts: postsWithVoteStatus,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

feedRoute.get('/explore', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userId = req.user?.id; // Use optional chaining

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // For trending posts, use a combination of score and comment count
    const trendingPosts = await Post.find({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: { $ne: true }
    })
      .populate('author', 'username avatar displayName')
      .populate('community', 'name icon members memberCount')
      .sort({ 
        // Calculate a simple trending score: (upvotes - downvotes) + (comments * 0.5)
        // This is an approximation since we can't use aggregation in regular queries
        upvotes: -1,
        commentCount: -1,
        createdAt: -1
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Check if user is authenticated and has an ID
    const postsWithVoteStatus = await Promise.all(
      trendingPosts.map(async (post) => {
        const voteStatus = userId ? await getVoteStatus(post._id, userId) : null;
        return {
          ...post,
          userVote: voteStatus,
          score: post.upvotes - post.downvotes
        };
      })
    );

    const totalPosts = await Post.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: { $ne: true }
    });

    res.json({
      posts: postsWithVoteStatus,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts
    });

  } catch (error) {
    console.error('Explore feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

feedRoute.get('/communities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id; // Use optional chaining
    const limit = parseInt(req.query.limit) || 10;

    const user = userId ? await User.findById(userId).select('joinedCommunities interests') : null;
    
    let joinedCommunities = [];
    if (user) {
      joinedCommunities = user.joinedCommunities || [];
    }

    const recommendedCommunities = await Community.find({
      _id: { $nin: joinedCommunities },
      privacy: 'public'
    })
      .select('name description icon bannerImage memberCount category')
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(limit);

    res.json(recommendedCommunities);

  } catch (error) {
    console.error('Communities feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

feedRoute.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, community, sortBy = 'relevance', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user?.id; // Use optional chaining

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    let searchQuery = {
      $text: { $search: q },
      isDeleted: { $ne: true }
    };

    if (community) {
      searchQuery.community = community;
    }

    let sortCriteria = {};
    switch (sortBy) {
      case 'new':
        sortCriteria = { createdAt: -1 };
        break;
      case 'top':
        sortCriteria = { upvotes: -1 };
        break;
      case 'comments':
        sortCriteria = { commentCount: -1 };
        break;
      case 'relevance':
      default:
        sortCriteria = { score: { $meta: 'textScore' } };
        break;
    }

    const searchOptions = {
      ...(sortBy === 'relevance' ? { score: { $meta: 'textScore' } } : {}),
      ...sortCriteria
    };

    const posts = await Post.find(searchQuery, sortBy === 'relevance' ? { score: { $meta: 'textScore' } } : {})
      .populate('author', 'username avatar displayName')
      .populate('community', 'name icon')
      .sort(searchOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const postsWithVoteStatus = await Promise.all(
      posts.map(async (post) => {
        const voteStatus = userId ? await getVoteStatus(post._id, userId) : null;
        return {
          ...post,
          userVote: voteStatus,
          score: post.upvotes - post.downvotes
        };
      })
    );

    const totalPosts = await Post.countDocuments(searchQuery);

    res.json({
      posts: postsWithVoteStatus,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
      query: q
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get controversial posts using aggregation
async function getControversialPosts(communityIds, limit, skip) {
  return await Post.aggregate([
    {
      $match: {
        community: { $in: communityIds },
        isDeleted: { $ne: true }
      }
    },
    {
      $addFields: {
        // Calculate controversy score: comments + absolute difference between upvotes and downvotes
        controversyScore: {
          $add: [
            { $size: '$comments' },
            { $abs: { $subtract: ['$upvotes', '$downvotes'] } }
          ]
        }
      }
    },
    { $sort: { controversyScore: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    {
      $lookup: {
        from: 'communities',
        localField: 'community',
        foreignField: '_id',
        as: 'community'
      }
    },
    { $unwind: '$community' },
    {
      $project: {
        'author.password': 0,
        'author.email': 0,
        'community.members': 0
      }
    }
  ]);
}

// Helper function to add vote status to posts
async function addVoteStatusToPosts(posts, userId) {
  return await Promise.all(
    posts.map(async (post) => {
      const voteStatus = userId ? await getVoteStatus(post._id, userId) : null;
      return {
        ...post,
        userVote: voteStatus,
        score: post.upvotes - post.downvotes
      };
    })
  );
}

// Fixed getVoteStatus function with proper error handling
async function getVoteStatus(postId, userId) {
  // Check if userId is valid
  if (!userId) return null;
  
  try {
    const post = await Post.findById(postId).select('voters');
    if (!post || !post.voters) return null;
    
    // Convert both IDs to string for comparison
    const userIdStr = userId.toString();
    const userVote = post.voters.find(vote => {
      // Handle cases where vote.user might be ObjectId or string
      if (!vote || !vote.user) return false;
      
      const voteUserId = vote.user?.toString?.() || vote.user;
      return voteUserId === userIdStr;
    });
    
    return userVote ? userVote.voteType : null;
  } catch (error) {
    console.error('Error getting vote status:', error);
    return null;
  }
}
  

async function getSuggestedPosts(limit) {
  // For suggested posts, use a simple combination of score and recency
  const suggestedPosts = await Post.find({
    isDeleted: { $ne: true }
  })
    .populate('author', 'username avatar displayName')
    .populate('community', 'name icon members memberCount')
    .sort({ 
      upvotes: -1,
      commentCount: -1,
      createdAt: -1 
    })
    .limit(limit)
    .lean();

  return suggestedPosts.map(post => ({
    ...post,
    userVote: null,
    score: post.upvotes - post.downvotes
  }));
}

module.exports = feedRoute;