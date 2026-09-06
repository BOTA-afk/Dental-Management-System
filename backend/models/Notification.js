import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  recipientRole: {
    type: String,
    enum: ['admin', 'assistant', 'dentist', 'patient', 'all'],
    required: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'reschedule', 'cancel', 'billing', 'general', 'low_stock', 'task'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.post('save', async function(doc) {
  try {
    const { sendRealTimeNotification } = await import('../socket.js');
    sendRealTimeNotification(doc);
  } catch (err) {
    console.error("Error sending real-time notification in post-save:", err);
  }
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
