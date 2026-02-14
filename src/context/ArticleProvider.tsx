import { useState, useEffect, type ReactNode } from "react";
import type { Article, ArticleForm } from "../types";
import { ArticleContext } from "./ArticleContext";
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

  // 1. Cambiamos Partial<Article> por ArticleForm para que TS sepa que vienen todos los campos
  const addArticle = async (data: ArticleForm) => {
    try {
      const newArt = await articleService.create(data);
      setArticles((prev) => [...prev, newArt]);
      return newArt;
    } catch (error) {
      console.error("Error al agregar artículo", error);
      throw error;
    }
  };

  // 2. Para el update, como no siempre enviamos todo, usamos el casteo 'as ArticleForm'
  const updateArticle = async (id: number, data: Partial<Article>) => {
    try {
      // Usamos 'as ArticleForm' para calmar al compilador si el servicio es estricto
      const updatedArt = await articleService.update(id, data as ArticleForm);
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
      {/* Cuidado aquí: si ocultas los children mientras carga, 
         la app puede parpadear en blanco. Es mejor dejar que los children 
         manejen sus propios estados de carga o mostrar un spinner global.
      */}
      {children}
    </ArticleContext.Provider>
  );
};
