import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Category } from "../types";
import { CategoryContext } from "./CategoryContext";
import { categoryService } from "../services/categoryService"; // Importamos el servicio

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error al traer categorías", error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const newCat = await categoryService.create(name);
      setCategories((prev) => [...prev, newCat]);
    } catch (error) {
      console.error("Error al agregar", error);
      throw error; // <--- ¡ESTO ES LO QUE FALTA!
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      const updatedCat = await categoryService.update(id, name);
      setCategories((prev) => prev.map((c) => (c.id === id ? updatedCat : c)));
    } catch (error) {
      console.error("Error al actualizar", error);
      throw error; // <--- ¡ESTO ES LO QUE FALTA!
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        fetchCategories,
        addCategory,
        updateCategory,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
