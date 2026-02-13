export type UserRole = "admin" | "vendedor" | "user";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  active: boolean; // <--- Agregar esta línea
  // Nota: Nunca incluimos password_hash en el frontend por seguridad
}
