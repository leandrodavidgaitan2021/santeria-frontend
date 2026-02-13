import api from "./api";
import type {
  CashMovementResponse,
  ExtractionData,
  CashBalanceResponse,
} from "../types/cash";

export const cashService = {
  /**
   * Registra una extracción manual (envía amount, reason y person)
   */
  saveExtraction: async (
    data: ExtractionData,
  ): Promise<{ message: string }> => {
    const response = await api.post("/cash/extraction", data);
    return response.data;
  },

  /**
   * Obtiene todos los movimientos de caja
   */
  getMovements: async (fromDate?: string): Promise<CashMovementResponse[]> => {
    const response = await api.get("/cash/movements", {
      params: { from_date: fromDate },
    });
    return response.data;
  },

  /**
   * Obtiene el saldo total actual de la caja
   */
  getBalance: async (): Promise<CashBalanceResponse> => {
    const response = await api.get("/cash/balance");
    return response.data;
  },
};
