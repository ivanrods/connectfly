import { useState, useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export function useUsers(shouldFetch = false) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  return { users, loading };
}
