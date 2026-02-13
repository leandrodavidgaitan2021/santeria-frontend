import type { Article } from "./article";

export interface Category {
  id: number;
  name: string;

  // Relación opcional: Una categoría puede traer su lista de artículos
  articles?: Article[]; // Relación de vuelta
}
