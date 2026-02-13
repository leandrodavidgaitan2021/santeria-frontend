import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse } from "../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Error cargando sesión:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (data: AuthResponse) => {
    console.log("Login exitoso. Datos recibidos:", data); // <--- Verifica si data.user tiene el id
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // --- LÓGICA DE ROLES CENTRALIZADA ---
  // Extraemos el rol del objeto user de forma segura
  const role = user?.role || null;
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
        isAdmin, // Booleano para verificaciones rápidas
        role, // El string del rol ("admin", "vendedor", etc.)
      }}
    >
      {/* Es vital no renderizar los hijos hasta que loading sea false,
         así evitamos que el Dashboard parpadee o de errores de permisos
         mientras recupera los datos del localStorage.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
