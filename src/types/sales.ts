export interface SaleDetail {
  id: number;
  article_title: string;
  units: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleItem {
  article_id: number;
  title: string;
  units: number;
  unit_price: number; // Precio de venta final
}

export interface SaleData {
  client_name?: string;
  payment_method: "EFECTIVO" | "TRANSFERENCIA"; // Tipado más estricto para evitar errores
  items: SaleItem[];
}

export interface SaleResponse {
  id: number;
  date: string;
  client_name?: string; // Opcional si permites ventas "Consumidor Final"
  total: number;
  user_id: number; // <--- AGREGA ESTA LÍNEA
  seller_name: string; // <--- Agrega esto
  payment_method: "EFECTIVO" | "TRANSFERENCIA";
  details: SaleDetail[];
}
