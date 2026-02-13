import api from "./api";
import type { Category } from "../types";

export const categoryService = {
  getAll: async () => {
    const res = await api.get<Category[]>("/category/categories");
    return res.data;
  },

  create: async (name: string) => {
    const res = await api.post<Category>("/category/categories", { name });
    return res.data;
  },

  update: async (id: number, name: string) => {
    const res = await api.put<Category>(`/category/categories/${id}`, { name });
    return res.data;
  },

};