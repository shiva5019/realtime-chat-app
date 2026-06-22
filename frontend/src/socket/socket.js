import { io } from "socket.io-client";

const socket = io("https://realtime-chat-app-production-67a2.up.railway.app", {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  socket.auth = { userId };
  socket.connect();
};

export default socket;