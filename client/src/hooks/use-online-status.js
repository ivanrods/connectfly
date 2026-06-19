import { useEffect, useState } from "react";
import { useSocket } from "../context/socket-context";

export function useOnlineStatus() {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: isOnline }));
    };

    socket.on("userStatus", handleUserStatus);
    return () => socket.off("userStatus", handleUserStatus);
  }, [socket]);

  const isOnline = (userId) => !!onlineUsers[userId];

  return { onlineUsers, isOnline };
}
