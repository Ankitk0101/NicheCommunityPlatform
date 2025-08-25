const express = require("express");
const postRoute = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  searchPosts,
  getUserPosts,
} = require("../controllers/post.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Create a new post
postRoute.post("/", authMiddleware, createPost);

// Get all posts with optional filtering
postRoute.get("/", getPosts);

// Search posts
postRoute.get("/search", searchPosts);

// Get posts by user
postRoute.get("/user/:userId", getUserPosts);

// Get single post by ID
postRoute.get("/:id", getPostById);

// Update a post
postRoute.put("/:id", authMiddleware, updatePost);

// Delete a post
postRoute.delete("/:id", authMiddleware, deletePost);

// Vote on a post - FIXED: This route should work with /:id/vote
postRoute.post("/:id/vote", authMiddleware, votePost);

module.exports = postRoute;