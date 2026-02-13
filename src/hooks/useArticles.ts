import { useContext } from "react";
import { ArticleContext } from "../context/ArticleContext";

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) throw new Error("useArticles debe usarse dentro de ArticleProvider");
  return context;
};