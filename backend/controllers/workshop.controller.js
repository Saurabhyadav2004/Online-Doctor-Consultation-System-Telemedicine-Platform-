const Workshop = require('../models/Workshop');

exports.create = async (req, res) => {
  try {
    const workshop = await Workshop.create({ ...req.body, createdBy: req.user._id });
    await workshop.populate('instructor', 'name specialization');
    res.status(201).json({ success: true, data: { workshop } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const workshops = await Workshop.find(query)
      .populate('instructor', 'name specialization')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Workshop.countDocuments(query);
    res.json({ success: true, data: { workshops, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('instructor', 'name specialization')
      .populate('registeredParticipants', 'name email');
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    res.json({ success: true, data: { workshop } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });

    const isRegistered = workshop.registeredParticipants.includes(req.user._id);
    if (isRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }
    if (workshop.registeredParticipants.length >= workshop.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Workshop is full' });
    }

    workshop.registeredParticipants.push(req.user._id);
    await workshop.save();
    res.json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unregister = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });

    workshop.registeredParticipants = workshop.registeredParticipants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    await workshop.save();
    res.json({ success: true, message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { workshop } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
