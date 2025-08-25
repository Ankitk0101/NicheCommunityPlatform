const Post = require("../models/post.model");
const Community = require("../models/community.model");
const cloudinary = require("cloudinary").v2;

// Cloudinary config (should be in config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Create a new post
 */
const createPost = async (req, res) => {
  try {
    const { title, content, communityId, tags, richContent } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !content || !communityId) {
      return res.status(400).json({ message: "Title, content, and community ID are required" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is a member of the community
    if (!community.members.includes(userId)) {
      return res.status(403).json({ message: "You must be a member of this community to post" });
    }

    let uploadedMedia = [];

    // Handle file uploads - FIXED: Check if files exist and handle properly
    if (req.files && (req.files.media || req.files.file)) {
      const files = req.files.media || req.files.file;
      const fileArray = Array.isArray(files) ? files : [files];

      for (let file of fileArray) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "posts",
            resource_type: "auto",
          });

          uploadedMedia.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            type: uploadResult.resource_type === "video" ? "video" : "image",
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({ message: "Failed to upload media", error: uploadError.message });
        }
      }
    }

    const newPost = await Post.create({
      title,
      content,
      richContent: richContent ? JSON.parse(richContent) : null,
      author: userId,
      community: communityId,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase())) : [],
      media: uploadedMedia,
    });

    // Populate author and community details
    await newPost.populate("author", "username email profilePicture");
    await newPost.populate("community", "name icon");

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
};

/**
 * Get all posts with pagination and filtering
 */
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, communityId, sort = "new" } = req.query;
    
    let query = {};
    if (communityId) {
      query.community = communityId;
    }

    let sortOptions = {};
    switch (sort) {
      case "new":
        sortOptions = { createdAt: -1 };
        break;
      case "hot":
        sortOptions = { upvotes: -1, createdAt: -1 };
        break;
      case "top":
        sortOptions = { upvotes: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate("author", "username email profilePicture")
      .populate("community", "name icon")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
};

/**
 * Get single post by ID
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author", "username email profilePicture")
      .populate("community", "name icon")
      .populate({
        path: "comments",
        populate: { 
          path: "author", 
          select: "username profilePicture" 
        },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.viewCount++;
    post.lastActivity = new Date();
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
};

/**
 * Update post
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, tags, richContent } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
   // console.log(post.author==userId )
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own posts" });
    }

    // Update fields if provided
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (richContent) post.richContent = richContent;
    
    post.isEdited = true;
    post.editedAt = new Date();
    post.lastActivity = new Date();
    await post.save();

    // Repopulate before sending response
    await post.populate("author", "username email profilePicture");
    await post.populate("community", "name icon");

    res.json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ message: "Failed to update post", error: err.message });
  }
};

/**
 * Delete post
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Allow post author or community moderators to delete
    const isAuthor = post.author.toString() === userId.toString();
    const community = await Community.findById(post.community);
    const isModerator = community.moderators.includes(userId);

    if (!isAuthor && !isModerator) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete media from cloudinary
    if (post.media && post.media.length > 0) {
      for (let media of post.media) {
        if (media.public_id) {
          try {
            await cloudinary.uploader.destroy(media.public_id, {
              resource_type: media.type === "video" ? "video" : "image",
            });
          } catch (cloudinaryError) {
            console.error("Cloudinary delete error:", cloudinaryError);
          }
        }
      }
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
};


// pvote or Downvote - FIXED VERSION
const votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!voteType || !["up", "down"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Use aggregation pipeline for update (MongoDB 4.2+)
    const updatePipeline = [
      {
        $set: {
          lastActivity: new Date(),
          voters: {
            $cond: {
              if: { $in: [userId, "$voters.user"] },
              then: {
                $map: {
                  input: "$voters",
                  as: "voter",
                  in: {
                    $cond: {
                      if: { $eq: ["$$voter.user", userId] },
                      then: {
                        $mergeObjects: [
                          "$$voter",
                          { voteType: voteType, votedAt: new Date() }
                        ]
                      },
                      else: "$$voter"
                    }
                  }
                }
              },
              else: {
                $concatArrays: [
                  "$voters",
                  [{ user: userId, voteType: voteType, votedAt: new Date() }]
                ]
              }
            }
          }
        }
      },
      {
        $set: {
          upvotes: { $size: { $filter: { input: "$voters", as: "v", cond: { $eq: ["$$v.voteType", "up"] } } } },
          downvotes: { $size: { $filter: { input: "$voters", as: "v", cond: { $eq: ["$$v.voteType", "down"] } } } }
        }
      }
    ];

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updatePipeline,
      { 
        new: true,
        runValidators: false
      }
    ).populate('author', 'username displayName');

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check user's current vote status
    const userVote = updatedPost.voters.find(v => v.user.toString() === userId.toString());
    const userVoteStatus = userVote ? userVote.voteType : null;

    res.status(200).json({
      message: "Vote processed successfully",
      upvotes: updatedPost.upvotes,
      downvotes: updatedPost.downvotes,
      userVote: userVoteStatus,
      post: updatedPost
    });

  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * Search posts
 */
const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .populate("author", "username profilePicture")
    .populate("community", "name")
    .sort({ score: { $meta: "textScore" } })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments({ $text: { $search: q } });

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
      query: q
    });
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

/**
 * Get posts by user
 */
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePicture")
      .populate("community", "name icon")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments({ author: userId });

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user posts", error: err.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  searchPosts,
  getUserPosts,
};