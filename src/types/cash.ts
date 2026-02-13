// Define el tipo de movimiento para mayor seguridad
export type CashMovementType =
  | "VENTA"
  | "COMPRA"
  | "EXTRACCION"
  | "INGRESO_MANUAL";

export interface CashMovementResponse {
  id: number;
  date: string; // ISO String con 'Z'
  type: CashMovementType;
  amount: number;
  description: string;
  sale_id: number | null;
  purchase_id: number | null;
}

export interface ExtractionData {
  amount: number;
  reason: string;
  person: string;
}

export interface CashBalanceResponse {
  balance: number;
}
