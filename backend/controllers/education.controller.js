const EducationalContent = require('../models/EducationalContent');

exports.create = async (req, res) => {
  try {
    const content = await EducationalContent.create({ ...req.body, author: req.user._id });
    await content.populate('author', 'name role');
    res.status(201).json({ success: true, data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];

    const contents = await EducationalContent.find(query)
      .populate('author', 'name role')
      .select('-comments')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await EducationalContent.countDocuments(query);
    res.json({ success: true, data: { contents, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const content = await EducationalContent.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name role')
      .populate('comments.user', 'name');

    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
    res.json({ success: true, data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const content = await EducationalContent.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    const isLiked = content.likes.includes(req.user._id);
    if (isLiked) {
      content.likes = content.likes.filter(l => l.toString() !== req.user._id.toString());
    } else {
      content.likes.push(req.user._id);
    }
    await content.save();
    res.json({ success: true, data: { liked: !isLiked, likesCount: content.likes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const content = await EducationalContent.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    content.comments.push({ user: req.user._id, text });
    await content.save();
    await content.populate('comments.user', 'name');
    const newComment = content.comments[content.comments.length - 1];
    res.status(201).json({ success: true, data: { comment: newComment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const content = await EducationalContent.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    content.comments = content.comments.filter(c => c._id.toString() !== req.params.commentId);
    await content.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const content = await EducationalContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await EducationalContent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
