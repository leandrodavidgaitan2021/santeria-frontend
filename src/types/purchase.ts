export interface ShoppingItem {
  article_id: number;
  title: string;
  units: number;
  unit_price: number; // El nuevo costo pagado al proveedor
  profit_margin: number; // Margen de ganancia para recalcular PVP
  final_price: number; // Precio de venta final sugerido/recalculado
}

export interface PurchaseData {
  provider_id: string | number;
  payment_method: "EFECTIVO" | "TRANSFERENCIA"; // Tipado estricto
  items: ShoppingItem[];
  date: string; // <--- AGREGA ESTA LÍNEA
}

export interface PurchaseDetail {
  id: number;
  article_title: string;
  units: number;
  unit_price: number;
  subtotal: number;
}

export interface PurchaseResponse {
  id: number;
  date: string;
  provider_name: string;
  total: number;
  payment_method: "EFECTIVO" | "TRANSFERENCIA"; // Tipado estricto
  details: PurchaseDetail[];
}
