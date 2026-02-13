import { useState, useEffect, type ReactNode } from "react";
import type { Article } from "../types";
import { ArticleContext } from "./ArticleContext"; // Importamos el contexto desde su archivo
import { articleService } from "../services/articleService";

export const ArticleProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleService.getAll();
      setArticles(data);
    } catch (error) {
      console.error("Error al traer artículos", error);
    } finally {
      setLoading(false);
    }
  };

  const addArticle = async (data: Partial<Article>) => {
    try {
      const newArt = await articleService.create(data);
      setArticles((prev) => [...prev, newArt]);
      return newArt;
    } catch (error) {
      console.error("Error al agregar artículo", error);
      throw error;
    }
  };

  const updateArticle = async (id: number, data: Partial<Article>) => {
    try {
      const updatedArt = await articleService.update(id, data);
      setArticles((prev) => prev.map((a) => (a.id === id ? updatedArt : a)));
      return updatedArt;
    } catch (error) {
      console.error("Error al actualizar artículo", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <ArticleContext.Provider
      value={{
        articles,
        addArticle,
        updateArticle,
        loading,
        fetchArticles,
      }}
    >
      {!loading && children}
    </ArticleContext.Provider>
  );
};
