import mongoose from 'mongoose';

const supplierOrderSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: false
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Supply', 'Medication'],
    default: 'Supply'
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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  supplierEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  deliveryDeadlineDays: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['Requested', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Requested'
  },
  notes: {
    type: String,
    default: ''
  },
  receivedDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.models.SupplierOrder || mongoose.model('SupplierOrder', supplierOrderSchema);
