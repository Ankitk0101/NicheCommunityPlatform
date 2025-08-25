const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 5000 
  },
  richContent: { type: Object },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  post: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  parentComment: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  },
  replies: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  voters: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    voteType: { type: String, enum: ['up', 'down'] }
  }],
  media: [{ 
    public_id: { type: String },
    url: { type: String },
    type: { type: String, enum: ['image', 'video', 'gif'] }
  }],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;