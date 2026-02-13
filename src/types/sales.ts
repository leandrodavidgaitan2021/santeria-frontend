export interface SaleDetail {
  id: number;
  article_title: string;
  units: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleResponse {
  id: number;
  date: string;
  client_name?: string; // Opcional si permites ventas "Consumidor Final"
  total: number;
  user_id: number; // <--- AGREGA ESTA LÍNEA
  seller_name: string; // <--- Agrega esto
  details: SaleDetail[];
}

export interface SaleItem {
  article_id: number;
  title: string;
  units: number;
  unit_price: number; // Precio de venta final
}

export interface SaleData {
  client_name?: string;
  items: SaleItem[];
}
