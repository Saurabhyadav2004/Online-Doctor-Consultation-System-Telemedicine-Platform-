const Appointment = require('../models/Appointment');

exports.create = async (req, res) => {
  try {
    const { doctor, date, time, type, reason, notes, meetingLink } = req.body;
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor, date, time, type, reason, notes, meetingLink
    });
    await appointment.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, data: { appointment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    // Patients see only their appointments; doctors see their patients' appointments
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);
    res.json({ success: true, data: { appointments, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth')
      .populate('doctor', 'name email specialization');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: { appointment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { status, notes, prescription, followUpDate, meetingLink } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, prescription, followUpDate, meetingLink },
      { new: true }
    ).populate('patient', 'name email').populate('doctor', 'name email');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: { appointment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: { appointment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
