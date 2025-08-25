const Community = require("../models/community.model");
const User = require("../models/auth.model");
const cloudinary = require("cloudinary").v2;

// Cloudinary upload function
const uploadToCloudinary = async (file, folder) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `communities/${folder}`,
      resource_type: "auto",
    });
    return {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  } catch (error) {
    throw new Error(`Failed to upload ${folder}: ${error.message}`);
  }
};

 
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, tags, privacy } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: "Name, description, and category are required" });
    }

    const existing = await Community.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    let bannerImage = { public_id: "", url: "" };
    let icon = { public_id: "", url: "" };

    // Handle banner image upload during creation
    if (req.files && req.files.bannerImage) {
      bannerImage = await uploadToCloudinary(req.files.bannerImage, "banners");
    }

    // Handle icon upload during creation
    if (req.files && req.files.icon) {
      icon = await uploadToCloudinary(req.files.icon, "icons");
    }

    const community = await Community.create({
      name,
      description,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      privacy: privacy || 'public',
      bannerImage,
      icon,
      creator: userId,
      moderators: [userId],
      members: [userId],
      memberCount: 1,
    });

    
    await community.populate("creator", "username email");
    await community.populate("moderators", "username");
    await community.populate("members", "username");

    res.status(201).json({ message: "Community created successfully", community });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Community name already exists" });
    }
    res.status(500).json({ message: "Failed to create community", error: err.message });
  }
};



const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creator", "username email")
      .populate("moderators", "username")
      .populate("members", "username");
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch communities", error: err.message });
  }
};

const suggestCommunities = async (req, res) => {
  try {
    const userId = req.user.id;  
    const user = await User.findById(userId);

    if (!user) {
      return res.status(200).json({ message: "User not found", communities: [] });
    }

    // Check if user has interests field, if not return all communities
    if (!user.interests || user.interests.length === 0) {
      const allCommunities = await Community.find().limit(10);
      return res.status(200).json({
        message: "Popular communities",
        communities: allCommunities
      });
    }

    const suggestions = await Community.find({
      tags: { $in: user.interests }
    }).limit(10);

    return res.status(200).json({
      message: "Community suggestions based on your interests",
      communities: suggestions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions", error: error.message });
  }
};

const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id)
      .populate("creator", "username email")
      .populate("moderators", "username")
      .populate("members", "username")
      .populate("joinRequests", "username email");
    if (!community) return res.status(404).json({ message: "Community not found" });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: "Error fetching community", error: err.message });
  }
};

const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const isModerator = community.moderators.some(mod => mod.toString() === userId.toString());
    if (community.creator.toString() !== userId.toString() && !isModerator) {
      return res.status(403).json({ message: "Only moderators can update community" });
    }

    Object.assign(community, updates);
    await community.save();

    await community.populate("creator", "username email");
    await community.populate("moderators", "username");
    await community.populate("members", "username");

    res.json({ message: "Community updated", community });
  } catch (err) {
    res.status(500).json({ message: "Failed to update community", error: err.message });
  }
};




const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // from auth middleware

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // ✅ Check if user is already a member
    const isMember = community.members.some(
      (member) => member.toString() === userId.toString()
    );
    if (isMember) {
      return res
        .status(400)
        .json({ message: "Already a member of this community" });
    }

    // ✅ Private community → add to joinRequests
    if (community.privacy === "private") {
      const alreadyRequested = community.joinRequests.some(
        (reqId) => reqId.toString() === userId.toString()
      );

      if (!alreadyRequested) {
        community.joinRequests.push(userId);
        await community.save();
        return res.json({
          message: "Join request sent (pending approval)",
          community,
        });
      }

      return res.status(400).json({ message: "Join request already sent" });
    }

    
    community.members.push(userId);
    community.memberCount = community.members.length; 
    await community.save();

    res.json({ message: "Joined community", community });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to join community", error: err.message });
  }
};


const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: "Not a member of this community" });
    }

    community.members = community.members.filter((m) => m.toString() !== userId.toString());
    community.moderators = community.moderators.filter((m) => m.toString() !== userId.toString());
    community.memberCount = community.members.length;

    await community.save();
    res.json({ message: "Left community", community });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave community", error: err.message });
  }
};

const approveJoinRequest = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const moderatorId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (!community.moderators.includes(moderatorId)) {
      return res.status(403).json({ message: "Only moderators can approve requests" });
    }

    if (community.joinRequests.some(id => id.toString() === userId.toString())) {
  community.joinRequests = community.joinRequests.filter(
    id => id.toString() !== userId.toString()
  );

  if (!community.members.some(id => id.toString() === userId.toString())) {
    community.members.push(userId);
  }

  community.memberCount = community.members.length;

  await community.save();
  return res.json({ message: "Join request approved", community });
}

    res.status(404).json({ message: "Join request not found" });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve join request", error: err.message });
  }
};

const promoteModerator = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const adminId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.creator.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Only creator can promote moderators" });
    }

    // Check if user is already a moderator
    if (community.moderators.includes(userId)) {
      return res.status(400).json({ message: "User is already a moderator" });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member of this community" });
    }

    community.moderators.push(userId);
    await community.save();

    res.json({ message: "User promoted to moderator", community });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote moderator", error: err.message });
  }
};

const addRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body; // Changed to accept both title and description
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (!community.moderators.includes(userId)) {
      return res.status(403).json({ message: "Only moderators can add rules" });
    }

    community.rules.push({ title, description });
    await community.save();

    res.json({ message: "Rule added", community });
  } catch (err) {
    res.status(500).json({ message: "Failed to add rule", error: err.message });
  }
};

const searchCommunities = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const communities = await Community.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    });

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};


const updateCommunityImages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (!community.moderators.includes(userId)) {
      return res.status(403).json({ message: "Only moderators can update community images" });
    }

    // Handle banner image update
    if (req.files && req.files.bannerImage) {
      // Delete old banner image if exists
      if (community.bannerImage.public_id) {
        await cloudinary.uploader.destroy(community.bannerImage.public_id);
      }
      community.bannerImage = await uploadToCloudinary(req.files.bannerImage, "banners");
    }

    // Handle icon update
    if (req.files && req.files.icon) {
      // Delete old icon if exists
      if (community.icon.public_id) {
        await cloudinary.uploader.destroy(community.icon.public_id);
      }
      community.icon = await uploadToCloudinary(req.files.icon, "icons");
    }

    await community.save();
    res.json({ message: "Community images updated", community });
  } catch (err) {
    res.status(500).json({ message: "Failed to update images", error: err.message });
  }
};


const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

     
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can delete this community" });
    }

   
    if (community.bannerImage.public_id) {
      await cloudinary.uploader.destroy(community.bannerImage.public_id);
    }
    if (community.icon.public_id) {
      await cloudinary.uploader.destroy(community.icon.public_id);
    }

   
    await Community.findByIdAndDelete(id);

    res.json({ message: "Community deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete community", error: err.message });
  }
};


module.exports = {
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
};