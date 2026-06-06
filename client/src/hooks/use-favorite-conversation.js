import { useCallback, useState } from "react";

export function useFavoriteConversation() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFavorite = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${apiUrl}/api/conversations/${conversationId}/favorite`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao favoritar conversa");
      }
      return res.json();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  return { toggleFavorite, error, loading };
}
