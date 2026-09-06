import mongoose from 'mongoose';

const supplyRequestSchema = new mongoose.Schema({
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model with role 'dentist'
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    default: 'units'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.SupplyRequest || mongoose.model('SupplyRequest', supplyRequestSchema);
