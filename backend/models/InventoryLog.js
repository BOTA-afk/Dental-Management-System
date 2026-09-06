import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  type: {
    type: String,
    enum: ['restock', 'usage'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The assistant or dentist who performed the action (or Admin)
    required: false
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.InventoryLog || mongoose.model('InventoryLog', inventoryLogSchema);
