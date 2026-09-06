import mongoose from 'mongoose';

const treatmentPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  diagnosis: {
    type: String,
    default: '',
    trim: true
  },
  treatmentPlan: {
    type: String,
    required: true,
    trim: true
  },
  treatmentDone: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'In Progress'
  },
  estimatedCost: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: '',
    trim: true
  }
}, { timestamps: true });

export default mongoose.models.TreatmentPlan || mongoose.model('TreatmentPlan', treatmentPlanSchema);
