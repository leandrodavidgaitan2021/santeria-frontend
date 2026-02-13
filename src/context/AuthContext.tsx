import { createContext } from "react";
import type { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => AuthResponse;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean; // Agregar esta línea
  role: string | null; // Agregar esta línea
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
