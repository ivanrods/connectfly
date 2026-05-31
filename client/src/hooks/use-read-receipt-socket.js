import { useEffect } from "react";
import { useSocket } from "../context/socket-context";

export function useReadReceiptSocket(conversationId, onMessagesRead) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (data.conversationId === conversationId) {
        onMessagesRead(data);
      }
    };

    socket.on("messagesRead", handler);

    return () => {
      socket.off("messagesRead", handler);
    };
  }, [socket, conversationId, onMessagesRead]);
}
