const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number }
  },
  heartRate: { type: Number },
  temperature: { type: Number }, // Celsius
  respiratoryRate: { type: Number },
  oxygenSaturation: { type: Number },
  weight: { type: Number }, // kg
  height: { type: Number }, // cm
  bmi: { type: Number },
  bloodGlucose: { type: Number },
  notes: { type: String },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-calculate BMI
vitalSignSchema.pre('save', function (next) {
  if (this.weight && this.height) {
    const heightM = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(1));
  }
  next();
});

module.exports = mongoose.model('VitalSign', vitalSignSchema);
