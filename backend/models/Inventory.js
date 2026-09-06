import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Supply', 'Medication'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  unit: {
    type: String,
    required: true,
    default: 'units' // e.g., 'Box', 'Cartridge', 'Roll', 'Piece'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
