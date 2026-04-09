import { io } from "socket.io-client";

let socketInstance = null;

function getSocketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

export function getChatSocket(token) {
  if (!socketInstance) {
    socketInstance = io(getSocketBaseUrl(), {
      autoConnect: false,
      auth: {
        token
      }
    });
  } else {
    socketInstance.auth = {
      token
    };
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectChatSocket() {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
}
