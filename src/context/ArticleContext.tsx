import { createContext } from "react";
import type { Article } from "../types";

interface ArticleContextType {
  articles: Article[];
  addArticle: (data: Partial<Article>) => Promise<Article>;
  updateArticle: (id: number, data: Partial<Article>) => Promise<Article>;
  loading: boolean;
  fetchArticles: () => Promise<void>;
}

export const ArticleContext = createContext<ArticleContextType | undefined>(
  undefined,
);
