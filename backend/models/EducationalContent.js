const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const educationalContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: {
    type: String,
    enum: ['disease-management', 'maternal-health', 'nutrition', 'mental-health', 'fitness', 'medication', 'prevention', 'general'],
    required: true
  },
  type: { type: String, enum: ['article', 'video', 'infographic', 'guide'], default: 'article' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  imageUrl: { type: String },
  videoUrl: { type: String },
  readTime: { type: Number }, // minutes
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  language: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('EducationalContent', educationalContentSchema);
