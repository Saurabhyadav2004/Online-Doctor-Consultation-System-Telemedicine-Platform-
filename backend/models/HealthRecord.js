const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['diagnosis', 'lab-result', 'imaging', 'procedure', 'vaccination', 'allergy', 'surgery', 'maternal'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  icdCode: { type: String },
  attachments: [{ name: String, url: String }],
  isConfidential: { type: Boolean, default: false },
  // Maternal health specific
  maternalData: {
    gestationalWeek: { type: Number },
    fetalHeartRate: { type: Number },
    fundalHeight: { type: Number },
    presentation: { type: String },
    nextVisit: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
