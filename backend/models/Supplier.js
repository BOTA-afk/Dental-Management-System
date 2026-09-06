import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  categories: [{
    type: String,
    default: 'Supply'
  }],
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
