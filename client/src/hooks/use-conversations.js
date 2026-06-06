import { useEffect, useState, useCallback } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar conversas");
      }

      const data = await res.json();

      const formatted = data.map((conv) => ({
        ...conv,
        unreadCount: conv.unreadCount || 0,
        favorite:
          conv.favorite ?? conv.conversation_users?.[0]?.favorite ?? false,
      }));

      setConversations(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // CREATE conversation
  const createConversation = useCallback(async (email) => {
    try {
      setError(null);

      const res = await fetch(`${apiUrl}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao criar conversa");
      }

      const conversation = data;

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      return conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateConversation = useCallback((newMessage) => {
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === newMessage.conversationId
          ? {
              ...conv,
              messages: [newMessage],
              updatedAt: newMessage.createdAt,
              unreadCount: conv.unreadCount ?? 0,
            }
          : conv,
      );

      return updated.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    });
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      setError(null);

      const res = await fetch(`${apiUrl}/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao deletar conversa");
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateFavorite = useCallback(({ conversationId, favorite }) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              favorite,
            }
          : conv,
      ),
    );
  }, []);

  const incrementUnread = useCallback((conversationId) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conversationId);

      if (!exists) return prev;

      return prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
          : conv,
      );
    });
  }, []);

  const clearUnread = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
      ),
    );
  }, []);

  return {
    conversations,
    setConversations,
    updateFavorite,
    deleteConversation,
    incrementUnread,
    clearUnread,
    loading,
    error,
    createConversation,
    refetch: fetchConversations,
    updateConversation,
  };
}
