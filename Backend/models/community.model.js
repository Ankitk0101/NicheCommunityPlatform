const mongoose = require("mongoose");
const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50 
  },
  description: { type: String, maxlength: 300 },
  creator: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  moderators: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  members: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  memberCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  category: { 
    type: String, 
    enum: ['technology', 'health', 'entertainment', 'science', 'arts', 'sports', 'other'],
    default: 'other'
  },
  
  privacy: { 
    type: String, 
    enum: ['public', 'private'],
    default: 'public'
  },
  joinRequests: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  bannerImage: { 
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  icon: { 
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
   
  rules: [{ 
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;