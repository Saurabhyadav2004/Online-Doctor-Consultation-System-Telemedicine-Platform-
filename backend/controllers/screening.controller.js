const ScreeningEvent = require('../models/ScreeningEvent');

exports.create = async (req, res) => {
  try {
    const event = await ScreeningEvent.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { event } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { screeningType, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (screeningType) query.screeningType = screeningType;
    if (status) query.status = status;

    const events = await ScreeningEvent.find(query)
      .populate('organizer', 'name specialization')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ScreeningEvent.countDocuments(query);
    res.json({ success: true, data: { events, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const event = await ScreeningEvent.findById(req.params.id)
      .populate('organizer', 'name specialization')
      .populate('registeredParticipants', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: { event } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const event = await ScreeningEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.registeredParticipants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }
    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.registeredParticipants.push(req.user._id);
    await event.save();
    res.json({ success: true, message: 'Registered for screening event' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unregister = async (req, res) => {
  try {
    const event = await ScreeningEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.registeredParticipants = event.registeredParticipants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    await event.save();
    res.json({ success: true, message: 'Unregistered from event' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const event = await ScreeningEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { event } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await ScreeningEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Screening event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
