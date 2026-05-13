const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['rehabilitation', 'maternal', 'disease-management', 'mental-health', 'nutrition', 'fitness', 'general'],
    required: true
  },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // minutes
  location: { type: String },
  isOnline: { type: Boolean, default: false },
  meetingLink: { type: String },
  maxParticipants: { type: Number, default: 50 },
  registeredParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

workshopSchema.virtual('availableSlots').get(function () {
  return this.maxParticipants - this.registeredParticipants.length;
});

module.exports = mongoose.model('Workshop', workshopSchema);
