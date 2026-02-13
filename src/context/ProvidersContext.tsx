import { createContext } from "react";
import type { Provider } from "../types";

interface ProvidersContextType {
  providers: Provider[];
  fetchProviders: () => Promise<void>;
  addProvider: (data: Partial<Provider>) => Promise<Provider>;
  updateProvider: (id: number, data: Partial<Provider>) => Promise<Provider>;
  loading: boolean;
}

export const ProvidersContext = createContext<ProvidersContextType | undefined>(
  undefined,
);
