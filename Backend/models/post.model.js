const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Title is required"],
    trim: true,
    maxlength: [300, "Title cannot exceed 300 characters"] 
  },
  content: { 
    type: String, 
    required: [true, "Content is required"],
    maxlength: [10000, "Content cannot exceed 10000 characters"] 
  },
  richContent: { 
    type: Object,
    default: null 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  community: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
    required: [true, "Community is required"] 
  },
  upvotes: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  downvotes: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  voters: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      
    },
    voteType: { 
      type: String, 
      enum: ['up', 'down'],
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  commentCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  media: [{ 
    public_id: { 
      type: String,
      default: null 
    },
    url: { 
      type: String,
      default: null 
    },
    type: { 
      type: String, 
      enum: ['image', 'video', 'gif'],
      default: 'image'
    }
  }],
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true 
  }],
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  // Disable version key to prevent VersionError
  versionKey: false
});

// Text search index
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ upvotes: -1, createdAt: -1 });

// Compound unique index to prevent duplicate votes
postSchema.index({ '_id': 1, 'voters.user': 1 }, { unique: true });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;