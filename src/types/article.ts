import type { Category } from "./category";
import type { Provider } from "./provider";

export interface Article {
  id: number;
  title: string;
  content: string;
  unit_price: number;
  profit_margin: number;
  final_price: number;
  stock: number;
  created_at: string;
  category_id: number;
  provider_id: number;
  // Nueva propiedad para la URL que devuelve el servidor
  image_url?: string;
  category?: Category;
  provider?: Provider;
}

// Interfaz para el estado del formulario en el componente
export interface ArticleForm {
  title: string;
  content: string;
  unit_price: number;
  profit_margin: number;
  final_price: number;
  stock: number;
  category_id: number | "";
  provider_id: number | "";
  // El archivo binario antes de subirse
  image?: File | null;
}
