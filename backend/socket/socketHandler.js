import Message from "../models/Message.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log("User online:", userId);
    }

    socket.on("sendMessage", async (data) => {
      const { sender, receiver, content } = data;

      try {
        const newMessage = await Message.create({ sender, receiver, content });
        io.emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("User offline:", userId);
      }
    });
  });
};