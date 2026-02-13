//purchase.ts
export interface ShoppingItem {
  article_id: number;
  title: string;
  units: number;
  unit_price: number;
  profit_margin: number;
  final_price: number;
}

export interface PurchaseData {
  provider_id: string | number;
  items: ShoppingItem[];
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
  details: PurchaseDetail[];
}