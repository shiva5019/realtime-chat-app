import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  socket.auth = { userId };
  socket.connect();
};

export default socket;