import { Server } from 'socket.io';
import Message from './models/Message.js';

let io;
const userSockets = new Map(); // userId -> socket.id

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.join(userId);
        console.log(`👤 User registered: ${userId} to socket ${socket.id}`);
      }
    });

    socket.on('sendMessage', async (data) => {
      const { senderId, senderModel, receiverId, receiverModel, message } = data;
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

        // Send to receiver room/socket
        io.to(receiverId).emit('newMessage', populatedMessage);
        // Echo to sender
        io.to(senderId).emit('newMessage', populatedMessage);
      } catch (err) {
        console.error('❌ Error sending message:', err);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`🔌 User disconnected: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
