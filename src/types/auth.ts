import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}
