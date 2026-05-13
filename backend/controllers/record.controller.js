const HealthRecord = require('../models/HealthRecord');

exports.create = async (req, res) => {
  try {
    const { patientId, type, title, description, date, icdCode, isConfidential, maternalData } = req.body;
    const record = await HealthRecord.create({
      patient: patientId || req.user._id,
      doctor: req.user.role === 'doctor' ? req.user._id : undefined,
      type, title, description, date, icdCode, isConfidential, maternalData
    });
    await record.populate('doctor', 'name specialization');
    res.status(201).json({ success: true, data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { patientId, type, page = 1, limit = 20 } = req.query;
    const query = { patient: patientId || req.user._id };
    if (type) query.type = type;

    const records = await HealthRecord.find(query)
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await HealthRecord.countDocuments(query);
    res.json({ success: true, data: { records, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name dateOfBirth');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
