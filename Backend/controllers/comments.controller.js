const Comment = require("../models/Comment.model");
const Post = require("../models/post.model");
const cloudinary = require("cloudinary").v2;

const createComment = async (req, res) => {
  try {
    const { content, postId, parentComment } = req.body;
    const userId = req.user.id;

    if (!content || !postId) {
      return res.status(400).json({ message: "Content and Post ID required" });
    }

    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let media = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "comments",
        });
        media.push({
          public_id: uploadRes.public_id,
          url: uploadRes.secure_url,
          type: uploadRes.resource_type,
        });
      }
    }

    const newComment = await Comment.create({
      content,
      author: userId,
      post: postId,
      parentComment: parentComment || null,
      media,
    });

    
    await newComment.populate("author", "username email");

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: newComment._id },
      });
    }

  
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    
    if (req.io) {
      req.io.to(postId).emit("newComment", newComment);
    }

    res.status(201).json({ message: "Comment created", comment: newComment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, sort = "newest" } = req.query;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

  
    let sortOptions = {};
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "popular":
        sortOptions = { upvotes: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("author", "username email profilePicture")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username email profilePicture"
        }
      })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalComments = await Comment.countDocuments({ post: postId, parentComment: null });

    res.json({
      comments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      totalComments
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.content = content || comment.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate("author", "username email");

   
    if (req.io) {
      req.io.to(comment.post.toString()).emit("updateComment", comment);
    }

    res.json({ message: "Comment updated", comment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

     
    const isAuthor = comment.author.toString() === userId.toString();
     

    if (!isAuthor) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();

     
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 },
    });

     
    if (req.io) {
      req.io.to(comment.post.toString()).emit("deleteComment", commentId);
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    if (!["up", "down"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    
    const existingVote = comment.voters.find(v => v.userId.toString() === userId);

    if (existingVote) {
       
      if (existingVote.voteType === "up") comment.upvotes -= 1;
      if (existingVote.voteType === "down") comment.downvotes -= 1;

      
      comment.voters = comment.voters.filter(v => v.userId.toString() !== userId);

      // If same vote type, just remove the vote (toggle)
      if (existingVote.voteType === voteType) {
        await comment.save();
        
        if (req.io) {
          req.io.to(comment.post.toString()).emit("voteComment", {
            commentId,
            upvotes: comment.upvotes,
            downvotes: comment.downvotes,
          });
        }

        return res.json({ message: "Vote removed", comment });
      }
    }

    // Add new vote
    if (voteType === "up") comment.upvotes += 1;
    if (voteType === "down") comment.downvotes += 1;

    comment.voters.push({ userId, voteType });
    await comment.save();

    // Emit socket event
    if (req.io) {
      req.io.to(comment.post.toString()).emit("voteComment", {
        commentId,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
      });
    }

    res.json({ message: "Vote added", comment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId)
      .populate("author", "username email profilePicture")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username email profilePicture"
        }
      });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(comment.replies);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  voteComment,
  getCommentReplies,
};