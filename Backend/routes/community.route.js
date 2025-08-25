const express = require("express");
const communitRoute = express.Router();

const {
  createCommunity, 
  getCommunities,         
  suggestCommunities,      
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  approveJoinRequest,
  promoteModerator,
  addRule,
  searchCommunities,
  updateCommunityImages
} = require("../controllers/community.controller");

const authMiddleware = require("../middleware/auth.middleware");

communitRoute.post("/", authMiddleware, createCommunity);
communitRoute.get("/", authMiddleware, getCommunities);
communitRoute.get("/suggestions", authMiddleware, suggestCommunities);  
communitRoute.get("/search", authMiddleware, searchCommunities);  
communitRoute.get("/:id", authMiddleware, getCommunityById);
communitRoute.put("/:id", authMiddleware, updateCommunity);
communitRoute.delete("/:id", authMiddleware, deleteCommunity);
communitRoute.post("/:id/join", authMiddleware, joinCommunity);
communitRoute.post("/:id/leave", authMiddleware, leaveCommunity);
communitRoute.post("/:communityId/approve/:userId", authMiddleware, approveJoinRequest);
communitRoute.post("/:communityId/promote/:userId", authMiddleware, promoteModerator);
communitRoute.post("/:id/rules", authMiddleware, addRule);
communitRoute.post("/:id/images", authMiddleware, updateCommunityImages);


module.exports = communitRoute;