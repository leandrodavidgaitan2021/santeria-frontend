import api from "./api";
import type { User, RegisterUserData, RegisterResponse } from "../types";

export const userService = {
  // Obtener todos los vendedores (Retorna un array de User)
  getVendedores: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/user/vendedores");
    return response.data;
  },

  // Registro con la interfaz que definiste
  registerUser: async (
    userData: RegisterUserData,
  ): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(
      "/user/register-user",
      userData,
    );
    return response.data;
  },

  // ACCIÓN A: Bloquear / Desbloquear (Cambia el flag 'active')
  toggleBlock: async (id: number) => {
    const response = await api.put(`/user/vendedor/toggle-block/${id}`);
    return response.data;
  },

  // ACCIÓN B: Resetear Password (Cambia clave a '12345678')
  resetPassword: async (id: number) => {
    const response = await api.put(`/user/vendedor/reset-password/${id}`);
    return response.data;
  },
};
