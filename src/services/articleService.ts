import api from "./api";
import type { Article } from "../types";

export const articleService = {
  getAll: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>("/article/articles");
    return response.data;
  },
  create: async (data: Partial<Article>): Promise<Article> => {
    const response = await api.post<Article>("/article/articles", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Article>): Promise<Article> => {
    const response = await api.put<Article>(`/article/articles/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/article/articles/${id}`);
  },
};
