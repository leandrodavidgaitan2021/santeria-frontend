import api from "./api";
import type { Provider } from "../types";

export const providerService = {
  // Obtener todos los proveedores
  getAll: async (): Promise<Provider[]> => {
    const response = await api.get<Provider[]>("/provider/providers");
    return response.data;
  },

  // Crear un nuevo proveedor
  create: async (data: {
    name: string;
    contact_info?: string;
  }): Promise<Provider> => {
    const response = await api.post<Provider>("/provider/providers", data);
    return response.data;
  },

  // Actualizar uno existente
  update: async (
    id: number,
    data: { name?: string; contact_info?: string },
  ): Promise<Provider> => {
    const response = await api.put<Provider>(`/provider/providers/${id}`, data);
    return response.data;
  },

  // Eliminar un proveedor
  delete: async (id: number): Promise<void> => {
    await api.delete(`/provider/providers/${id}`);
  },
};
