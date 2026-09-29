import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, setToken } from "@/services/api";
import { getAuthenticatedUser, login } from "@/services/auth.service";
import type { UsuarioResponse } from "@/types/api";

type AuthContextValue = {
  user: UsuarioResponse | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const authenticatedUser = await getAuthenticatedUser();
    setUser(authenticatedUser);
  }

  useEffect(() => {
    let active = true;

    getAuthenticatedUser()
      .then((authenticatedUser) => {
        if (active) setUser(authenticatedUser);
      })
      .catch(() => {
        clearToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(username, password) {
        const response = await login(username, password);
        setToken(response.token);
        setUser(response.user);
      },
      signOut() {
        clearToken();
        setUser(null);
      },
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
