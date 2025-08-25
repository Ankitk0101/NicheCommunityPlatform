const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
 username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 
  },
  avatar: { 
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  displayName: { 
    type: String, 
    trim: true,
    maxlength: 30 
  },
  bio: { 
    type: String, 
    maxlength: 160 
  },
  joinedCommunities: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community' 
  }],
  interests: [{ type: String }],
  karma: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true })


const User = mongoose.model("User", userSchema);
module.exports = User;
