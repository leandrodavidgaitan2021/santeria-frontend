import api from "./api";
import type { SaleData, SaleResponse } from "../types/sales";

export const saleService = {
  /**
   * Registra una nueva venta (descuenta stock en el backend)
   */
  saveSale: async (data: SaleData) => {
    // Usamos la instancia 'api' para que el token se envíe automáticamente
    const response = await api.post("/sale/sales", data);
    return response.data;
  },

  /**
   * Obtiene el historial completo de ventas
   */
  getAll: async (): Promise<SaleResponse[]> => {
    const response = await api.get("/sale/sales");
    return response.data;
  },

  /**
   * Obtener detalle de una venta específica (opcional)
   */
  getById: async (id: number): Promise<SaleResponse> => {
    const response = await api.get(`/sale/sales/${id}`);
    return response.data;
  },
};
