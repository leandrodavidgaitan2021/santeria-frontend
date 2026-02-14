export type UserRole = "admin" | "vendedor" ;

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  active: boolean; // <--- Agregar esta línea
  // Nota: Nunca incluimos password_hash en el frontend por seguridad
}

export interface RegisterUserData {
  username: string;
  email: string;
  password?: string; // Opcional si el backend permite omitirlo en ciertos casos
  role: UserRole;
}

// Interfaz para la respuesta del servidor
export interface RegisterResponse {
  msg: string;
}
