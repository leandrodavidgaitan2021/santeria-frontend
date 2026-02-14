import api from "./api";
import type { Article, ArticleForm } from "../types";

export const articleService = {
  getAll: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>("/article/articles");
    return response.data;
  },

  create: async (data: ArticleForm): Promise<Article> => {
    const formData = new FormData();

    // Agregamos los campos de texto y números
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("unit_price", String(data.unit_price));
    formData.append("profit_margin", String(data.profit_margin));
    formData.append("final_price", String(data.final_price));
    formData.append("stock", String(data.stock));
    formData.append("category_id", String(data.category_id));
    formData.append("provider_id", String(data.provider_id));

    // Si existe una imagen, la adjuntamos como 'file'
    if (data.image) {
      formData.append("file", data.image);
    }

    const response = await api.post<Article>("/article/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: number, data: ArticleForm): Promise<Article> => {
    const formData = new FormData();

    // Mapeamos los campos actuales
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("unit_price", String(data.unit_price));
    formData.append("profit_margin", String(data.profit_margin));
    formData.append("final_price", String(data.final_price));
    formData.append("stock", String(data.stock));
    formData.append("category_id", String(data.category_id));
    formData.append("provider_id", String(data.provider_id));

    if (data.image) {
      formData.append("file", data.image);
    }

    // Nota: Algunos backends de Flask/Python prefieren POST con un campo _method="PUT"
    // pero si tu API soporta PUT con multipart/form-data, este código es correcto:
    const response = await api.put<Article>(
      `/article/articles/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/article/articles/${id}`);
  },
};
