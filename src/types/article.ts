import type { Category } from "./category";
import type { Provider } from "./provider";

export interface Article {
  id: number;
  title: string;
  content: string;

  // En tu modelo son Integers (centavos o unidades enteras)
  unit_price: number;
  profit_margin: number; // Porcentaje (ej: 20)
  final_price: number; // Precio calculado
  stock: number;

  // En el JSON de la API, las fechas suelen venir como strings (ISO 8601)
  created_at: string;

  // Foreign Keys (Relaciones)
  category_id: number;
  provider_id: number;

  // Campos opcionales para cuando carguemos los objetos relacionados (Eager Loading)
  category?: Category;
  provider?: Provider;
}
