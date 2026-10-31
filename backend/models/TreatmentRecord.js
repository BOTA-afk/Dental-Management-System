import mongoose from 'mongoose';

const treatmentRecordSchema = new mongoose.Schema({
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
  treatmentName: {
    type: String,
    required: true,
    trim: true
  },
  drugs: {
    type: String,
    default: '',
    trim: true
  },
  treatmentsDone: {
    type: String,
    default: '',
    trim: true
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Set automatically when the record is added
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

treatmentRecordSchema.index({ patient: 1, date: -1 });

export default mongoose.models.TreatmentRecord || mongoose.model('TreatmentRecord', treatmentRecordSchema);
