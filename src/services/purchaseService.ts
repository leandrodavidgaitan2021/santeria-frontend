//purchaseService.ts
import api from "./api";
import type { PurchaseData } from "../types";

export const purchaseService = {
  /**
   * Registra la compra masiva usando la instancia configurada de Axios
   */
  savePurchase: async (data: PurchaseData) => {
    // Axios ya sabe que la base es API_URL y ya pone el Token
    const response = await api.post("/purchase/purchases", data);
    return response.data;
  },

  /**
   * Obtener historial (opcional)
   */
  getAll: async () => {
    const response = await api.get("/purchase/purchases");
    return response.data;
  },
};
