import { useState, useEffect, type ReactNode } from "react";
import type { Provider } from "../types";
import { ProvidersContext } from "./ProvidersContext";
import { providerService } from "../services/providersService";

export const ProvidersProvider = ({ children }: { children: ReactNode }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await providerService.getAll();
      setProviders(data);
    } catch (error) {
      console.error("Error al traer proveedores", error);
    } finally {
      setLoading(false);
    }
  };

  const addProvider = async (data: Partial<Provider>) => {
    try {
      const newProv = await providerService.create(
        data as { name: string; contact_info?: string },
      );
      setProviders((prev) => [...prev, newProv]);
      return newProv;
    } catch (error) {
      console.error("Error al agregar proveedor", error);
      throw error; // <--- VITAL para que AdminProviders muestre el error
    }
  };

  const updateProvider = async (id: number, data: Partial<Provider>) => {
    try {
      const updatedProv = await providerService.update(id, data);
      setProviders((prev) => prev.map((p) => (p.id === id ? updatedProv : p)));
      return updatedProv;
    } catch (error) {
      console.error("Error al actualizar proveedor", error);
      throw error; // <--- VITAL para que AdminProviders muestre el error
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        fetchProviders,
        addProvider,
        updateProvider,
        loading,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
};
