import { useEffect, useState } from "react";
import { useSocket } from "../context/socket-context";

export function useOnlineStatus(currentUserId) {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: isOnline }));
    };

    socket.on("userStatus", handleUserStatus);

    if (currentUserId) {
      socket.emit("joinUser", currentUserId);
    }

    return () => socket.off("userStatus", handleUserStatus);
  }, [socket, currentUserId]);

  const isOnline = (userId) => !!onlineUsers[userId];

  return { onlineUsers, isOnline };
}
