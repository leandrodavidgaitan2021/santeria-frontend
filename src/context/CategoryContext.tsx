import { createContext } from "react";

import type { Category } from "../types/category";

interface CategoryContextType {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void | Category>;
  updateCategory: (id: number, name: string) => Promise<void | Category>;
  loading: boolean;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);
