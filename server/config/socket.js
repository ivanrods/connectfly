import { Server } from "socket.io";
import "dotenv/config";
import { Op } from "sequelize";
import { Message, Conversation, User } from "../models/index.js";

let io;

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinUser", (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on("markConversationRead", async ({ conversationId, userId }) => {
      try {
        const conversation = await Conversation.findOne({
          where: { id: conversationId },
          include: {
            model: User,
            where: { id: userId },
          },
        });

        if (!conversation) return;

        const unreadMessages = await Message.findAll({
          where: {
            conversationId,
            senderId: { [Op.ne]: userId },
            isRead: false,
          },
          attributes: ["id", "senderId"],
        });

        if (unreadMessages.length === 0) return;

        const unreadIds = unreadMessages.map((m) => m.id);

        await Message.update(
          { isRead: true },
          { where: { id: { [Op.in]: unreadIds } } },
        );

        io.to(`conversation_${conversationId}`).emit("messagesRead", {
          conversationId,
          messageIds: unreadIds,
          readBy: userId,
        });

        const senderIds = [...new Set(unreadMessages.map((m) => m.senderId))];
        senderIds.forEach((senderId) => {
          io.to(`user_${senderId}`).emit("messagesRead", {
            conversationId,
            messageIds: unreadMessages
              .filter((m) => m.senderId === senderId)
              .map((m) => m.id),
            readBy: userId,
          });
        });
      } catch (err) {
        console.error("Erro ao marcar mensagens como lidas:", err);
      }
    });

    socket.on("disconnect", () => {});
  });
}

export function getIO() {
  if (!io) throw new Error("Socket não inicializado");
  return io;
}
