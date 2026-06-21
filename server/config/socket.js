import { Server } from "socket.io";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { Message, Conversation, User, ConversationUser } from "../models/index.js";

let io;

const onlineUsers = new Map();

export function getOnlineUsers() {
  return onlineUsers;
}

async function getPartnerIds(userId) {
  const participations = await ConversationUser.findAll({
    where: { userId },
    attributes: ["conversationId"],
  });

  if (participations.length === 0) return [];

  const conversationIds = participations.map((p) => p.conversationId);

  const partners = await ConversationUser.findAll({
    where: {
      conversationId: { [Op.in]: conversationIds },
      userId: { [Op.ne]: userId },
    },
    attributes: ["userId"],
  });

  return [...new Set(partners.map((p) => p.userId))];
}

async function emitUserStatus(userId, isOnline) {
  const partnerIds = await getPartnerIds(userId);

  partnerIds.forEach((partnerId) => {
    io.to(`user_${partnerId}`).emit("userStatus", { userId, isOnline });
  });
}

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    let userId;

    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.disconnect();
        return;
      }
      const decoded = jwt.verify(token, process.env.SECRET);
      userId = decoded.id;
    } catch {
      socket.disconnect();
      return;
    }

    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    socket.join(`user_${userId}`);

    try {
      const partnerIds = await getPartnerIds(userId);

      partnerIds.forEach((partnerId) => {
        io.to(`user_${partnerId}`).emit("userStatus", { userId, isOnline: true });
      });

      partnerIds.forEach((partnerId) => {
        if (onlineUsers.has(partnerId)) {
          io.to(`user_${userId}`).emit("userStatus", {
            userId: partnerId,
            isOnline: true,
          });
        }
      });
    } catch (err) {
      console.error("Erro ao emitir status online:", err);
    }

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

    socket.on("disconnect", async () => {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          try {
            await emitUserStatus(socket.userId, false);
          } catch (err) {
            console.error("Erro ao emitir status offline:", err);
          }
        }
      }
    });
  });
}

export function getIO() {
  if (!io) throw new Error("Socket não inicializado");
  return io;
}
