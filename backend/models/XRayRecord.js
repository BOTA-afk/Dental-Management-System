import mongoose from 'mongoose';

const xRayRecordSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['Panoramic', 'Bitewing', 'Periapical', 'Cephalometric', 'CBCT 3D', 'Other'],
    default: 'Panoramic'
  },
  imageUrl: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  findings: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  }
}, { timestamps: true });

export default mongoose.models.XRayRecord || mongoose.model('XRayRecord', xRayRecordSchema);
