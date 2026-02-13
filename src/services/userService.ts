import api from "./api";
import type { User } from "../types";

// Definimos un tipo para la creación que no requiera ID ni created_at
export interface CreateUserDTO {
  username: string;
  email: string;
  password?: string;
}

export const userService = {
  // Obtener todos los vendedores (Retorna un array de User)
  getVendedores: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/user/vendedores");
    return response.data;
  },

  // Registrar un nuevo vendedor
  registerVendedor: async (userData: CreateUserDTO) => {
    // Forzamos el rol a 'user' para que coincida con el db.String(5) de Flask
    const response = await api.post("/user/register-vendedor", userData);
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
