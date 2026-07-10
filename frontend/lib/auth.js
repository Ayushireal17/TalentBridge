"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    const saved = localStorage.getItem("tb_user");

    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }

    if (token) {
      authAPI.me()
        .then(r => {
          setUser(r.data.data);
          localStorage.setItem("tb_user", JSON.stringify(r.data.data));
        })
        .catch(() => {
          localStorage.removeItem("tb_token");
          localStorage.removeItem("tb_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await authAPI.login({ email, password, role });
    const { token, user } = res.data.data;
    localStorage.setItem("tb_token", token);
    localStorage.setItem("tb_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const adminLogin = async (email, password) => {
    const res = await authAPI.adminLogin({ email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("tb_token", token);
    localStorage.setItem("tb_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user } = res.data.data;
    localStorage.setItem("tb_token", token);
    localStorage.setItem("tb_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, adminLogin, register, logout,
      isCandidate:     user?.role === "candidate",
      isRecruiter:     user?.role === "recruiter",
      isAdmin:         user?.role === "admin",
      isAuthenticated: !!user,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};