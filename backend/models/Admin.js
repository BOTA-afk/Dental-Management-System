import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

// Corrected Middleware: Removed 'next'
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;