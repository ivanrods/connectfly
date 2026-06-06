import { useCallback, useEffect, useRef, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const fetchMessages = useCallback(async (pageNumber = 1) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${apiUrl}/api/conversations/${conversationId}/messages?page=${pageNumber}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) throw new Error("Erro ao buscar mensagens");

      const data = await res.json();

      if (pageNumber === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = data.messages.filter((m) => !existingIds.has(m.id));
          return [...uniqueNew, ...prev];
        });
      }

      setHasMore(pageNumber < data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [conversationId]);

  // carregar quando muda conversa
  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadingRef.current = false;

    fetchMessages(1);
  }, [conversationId, fetchMessages]);

  // carregar mais mensagens antigas
  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingRef.current) return;
    loadingRef.current = true;
    fetchMessages(page + 1);
  }, [hasMore, loading, fetchMessages, page]);

  return {
    messages,
    setMessages,
    loading,
    error,
    loadMore,
    hasMore,
  };
}

export function useSendMessage(conversationId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async ({ content = "", image = null }) => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${apiUrl}/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao enviar mensagem");
      }

      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  return { sendMessage, loading, error };
}
