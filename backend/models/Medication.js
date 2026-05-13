const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  route: { type: String, enum: ['oral', 'injection', 'topical', 'inhalation', 'other'], default: 'oral' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  indication: { type: String },
  sideEffects: { type: String },
  instructions: { type: String },
  isActive: { type: Boolean, default: true },
  refillsRemaining: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
