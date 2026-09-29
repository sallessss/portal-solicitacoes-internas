import { apiFetch } from "./api";
import type { LoginResponse, UsuarioResponse } from "@/types/api";

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ username, password }),
  });
}

export function getAuthenticatedUser() {
  return apiFetch<UsuarioResponse>("/auth/me");
}
