const mongoose = require('mongoose');

const screeningEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  screeningType: {
    type: String,
    enum: ['blood-pressure', 'diabetes', 'cancer', 'vision', 'hearing', 'dental', 'mental-health', 'general', 'maternal'],
    required: true
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number, default: 100 },
  isFree: { type: Boolean, default: true },
  cost: { type: Number, default: 0 },
  requirements: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ScreeningEvent', screeningEventSchema);
