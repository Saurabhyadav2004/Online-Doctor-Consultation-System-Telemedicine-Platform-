const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'telemedicine'], default: 'telemedicine' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  reason: { type: String, required: true },
  notes: { type: String },
  meetingLink: { type: String },
  duration: { type: Number, default: 30 }, // minutes
  prescription: { type: String },
  followUpDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
