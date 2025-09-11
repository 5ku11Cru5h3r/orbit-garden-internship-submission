import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = { id: string; role: "patient" | "admin"; name?: string; email?: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: "patient" | "admin" }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<User>("/api/me");
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api.post<User & { name: string; email: string }>("/auth/login", { email, password });
    setUser({ id: u.id, role: (u as any).role, name: u.name, email: u.email });
  };

  const register = async (data: { name: string; email: string; password: string; role?: "patient" | "admin" }) => {
    const u = await api.post<User & { name: string; email: string }>("/auth/register", data);
    setUser({ id: u.id, role: (u as any).role, name: u.name, email: u.email });
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
