import api from "./api";
import type { AuthResponse } from "../types";

// Interfaz para el cambio de clave
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    // Esto conecta con tu ruta @app.route('/login') en Flask
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Nueva implementación
  changePassword: async (
    data: ChangePasswordData,
  ): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
      "/auth/change-password",
      data,
    );
    return response.data;
  },
};
