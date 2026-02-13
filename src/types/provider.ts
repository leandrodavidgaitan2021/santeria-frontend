// src/types/provider.ts
import type { Article } from './article';

export interface Provider {
  id: number;
  name: string;
  contact_info?: string;
  created_at: string;
  articles?: Article[]; // Relación de vuelta
}