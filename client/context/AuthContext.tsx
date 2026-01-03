import React, { createContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "ACCOUNTANT" | "VIEWER";
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage or session
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: Replace with actual API call
    // For now, using mock authentication
    const mockUser: AuthUser = {
      id: "user-1",
      email,
      name: email.split("@")[0],
      role: "ACCOUNTANT",
    };
    setUser(mockUser);
    localStorage.setItem("authUser", JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authUser");
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      // TODO: Replace with actual API call
      const mockUser: AuthUser = {
        id: "user-" + Date.now(),
        email,
        name,
        role: "ACCOUNTANT",
      };
      setUser(mockUser);
      localStorage.setItem("authUser", JSON.stringify(mockUser));
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
