import { useState, useEffect, useCallback, useRef } from "react";

const apiUrl = import.meta.env.VITE_API_URL;
const PAGE_LIMIT = 50;

export function useUsers(shouldFetch = false, search = "") {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchUsers = useCallback(
    async (pageNum, append) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageNum,
          limit: PAGE_LIMIT,
        });
        if (search) params.set("search", search);

        const res = await fetch(`${apiUrl}/api/user?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data = await res.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }
        setHasMore(data.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    if (!shouldFetch) return;

    pageRef.current = 1;
    setUsers([]);
    setHasMore(true);
    fetchUsers(1, false);
  }, [shouldFetch, fetchUsers]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchUsers(nextPage, true);
  }, [loading, hasMore, fetchUsers]);

  return { users, loading, hasMore, loadMore };
}
