// src/hooks/useNotify.ts
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotify debe usarse dentro de un NotificationProvider");
  }
  return context;
};