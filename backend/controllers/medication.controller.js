const Medication = require('../models/Medication');

exports.create = async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, route, startDate, endDate, indication, instructions, refillsRemaining } = req.body;
    const medication = await Medication.create({
      patient: patientId || req.user._id,
      prescribedBy: req.user._id,
      name, dosage, frequency, route, startDate, endDate, indication, instructions, refillsRemaining
    });
    await medication.populate('prescribedBy', 'name specialization');
    res.status(201).json({ success: true, data: { medication } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { patientId, isActive } = req.query;
    const query = { patient: patientId || req.user._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const medications = await Medication.find(query)
      .populate('prescribedBy', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { medications } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('prescribedBy', 'name specialization');
    if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.json({ success: true, data: { medication } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
