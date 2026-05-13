const VitalSign = require('../models/VitalSign');

exports.create = async (req, res) => {
  try {
    const { patientId, bloodPressure, heartRate, temperature, respiratoryRate, oxygenSaturation, weight, height, bloodGlucose, notes } = req.body;
    const vital = await VitalSign.create({
      patient: patientId || req.user._id,
      recordedBy: req.user._id,
      bloodPressure, heartRate, temperature, respiratoryRate,
      oxygenSaturation, weight, height, bloodGlucose, notes
    });
    res.status(201).json({ success: true, data: { vital } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { patientId, limit = 20, page = 1 } = req.query;
    const targetPatient = patientId || req.user._id;
    const vitals = await VitalSign.find({ patient: targetPatient })
      .populate('recordedBy', 'name role')
      .sort({ recordedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: { vitals } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatest = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user._id;
    const vital = await VitalSign.findOne({ patient: patientId }).sort({ recordedAt: -1 });
    res.json({ success: true, data: { vital } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await VitalSign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vital sign record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
