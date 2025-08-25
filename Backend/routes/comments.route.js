const express = require("express");
const commentRoute = express.Router();
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  voteComment,
  getCommentReplies,
} = require("../controllers/comments.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Create a new comment
commentRoute.post("/", authMiddleware, createComment);

// Get comments for a post with pagination
commentRoute.get("/post/:postId", authMiddleware, getCommentsByPost);

// Get replies for a comment
commentRoute.get("/:commentId/replies", authMiddleware, getCommentReplies);

// Update a comment
commentRoute.put("/:commentId", authMiddleware, updateComment);

// Delete a comment
commentRoute.delete("/:commentId", authMiddleware, deleteComment);

// Vote on a comment
commentRoute.post("/:commentId/vote", authMiddleware, voteComment);

module.exports = commentRoute;