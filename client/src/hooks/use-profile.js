import { useEffect, useState, useCallback } from "react";

export function useProfile() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  helper auth
  const getAuthData = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      return null;
    }

    return {
      token,
      parsedUser: JSON.parse(storedUser),
    };
  };

  // helper request
  const request = async (url, options = {}) => {
    const res = await fetch(url, options);

    if (!res.ok) {
      let errorMessage = "Erro na requisição";
      try {
        const data = await res.json();
        errorMessage = data.error || data.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return res.json();
  };

  // buscar usuário
  const fetchUser = useCallback(async () => {
    const auth = getAuthData();

    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await request(`${apiUrl}/api/user/${auth.parsedUser.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null);
      setError(err.message);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // update
  const updateUser = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const { token, parsedUser } = getAuthData();

      const data = await request(`${apiUrl}/api/user/${parsedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //  delete
  const deleteUser = useCallback(async () => {
    try {
      setLoading(true);

      const { token, parsedUser } = getAuthData();

      const data = await request(`${apiUrl}/api/user/${parsedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.clear();
      setUser(null);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // upload avatar
  const uploadAvatar = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);

      if (!file) throw new Error("Nenhuma imagem selecionada");

      const { token, parsedUser } = getAuthData();

      const formData = new FormData();
      formData.append("avatar", file);

      const data = await request(`${apiUrl}/api/user/${parsedUser.id}/avatar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUser((prev) => {
        const updatedUser = { ...prev, avatar: data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetchUser: fetchUser,
    setUser,
    updateUser,
    deleteUser,
    uploadAvatar,
  };
}
