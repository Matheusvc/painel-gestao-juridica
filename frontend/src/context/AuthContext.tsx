import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BASE } from "@/lib/api";

export interface User {
  nome: string;
  sobrenome: string;
  email: string;
  perfil: string;
  cargo: string;
  fotoUrl: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "castro_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser({
        nome: data.nome ?? "",
        sobrenome: data.sobrenome ?? "",
        email: data.email ?? "",
        perfil: data.perfil ?? "",
        cargo: data.cargo ?? "",
        fotoUrl: data.fotoUrl ?? "",
      }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erro ao fazer login");
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser({
      nome: data.nome,
      sobrenome: data.sobrenome ?? "",
      email: data.email,
      perfil: data.perfil,
      cargo: data.cargo ?? "",
      fotoUrl: data.fotoUrl ?? "",
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${BASE}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar perfil");
    const updated = await res.json();
    setUser((prev) => prev ? { ...prev, ...updated } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
