import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Admin from '../models/Admin.js';
import Message from '../models/Message.js';
import { getIO } from '../socket.js';

export const getContacts = async (req, res) => {
  const currentUserId = req.user.id;
  const currentUserRole = req.user.role;

  try {
    let contacts = [];

    if (currentUserRole === 'patient') {
      // Patients can message doctors (dentist), assistants, and admins
      const staff = await User.find({}, 'fullName email role phoneNumber');
      const admins = await Admin.find({}, 'fullName email role');
      
      contacts = [
        ...staff.map(s => ({ id: s._id, name: s.fullName, email: s.email, role: s.role, model: 'User' })),
        ...admins.map(a => ({ id: a._id, name: a.fullName, email: a.email, role: a.role, model: 'Admin' }))
      ];
    } else {
      // Dentist, Assistant, or Admin can message patients, and other staff/admins
      const patients = await Patient.find({}, 'name email phoneNumber homeAddress');
      const staff = await User.find({ _id: { $ne: currentUserId } }, 'fullName email role phoneNumber');
      const admins = await Admin.find({ _id: { $ne: currentUserId } }, 'fullName email role');

      contacts = [
        ...patients.map(p => ({ id: p._id, name: p.name, email: p.email, role: 'patient', model: 'Patient' })),
        ...staff.map(s => ({ id: s._id, name: s.fullName, email: s.email, role: s.role, model: 'User' })),
        ...admins.map(a => ({ id: a._id, name: a.fullName, email: a.email, role: a.role, model: 'Admin' }))
      ];
    }

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts", error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  const currentUserId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId')
    .populate('receiverId');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error: error.message });
  }
};

export const sendMessageRest = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, receiverModel, message } = req.body;

  // Determine sender model
  let senderModel = 'User';
  if (req.user.role === 'patient') {
    senderModel = 'Patient';
  } else if (req.user.role === 'system_admin' || req.user.role === 'admin') {
    senderModel = 'Admin';
  }

  try {
    const newMessage = await Message.create({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      message
    });

    const populatedMessage = await Message.findById(newMessage._id).populate([
      { path: 'senderId', select: 'fullName name email role' },
      { path: 'receiverId', select: 'fullName name email role' }
    ]);

    // Emit via Socket.io if initialized
    try {
      const io = getIO();
      io.to(receiverId).emit('newMessage', populatedMessage);
      io.to(senderId).emit('newMessage', populatedMessage);
    } catch (socketErr) {
      console.log("Socket server error (message sent via HTTP only):", socketErr.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};
