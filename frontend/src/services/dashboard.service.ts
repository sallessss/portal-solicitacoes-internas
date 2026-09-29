import { apiFetch } from "./api";
import type { DashboardResponse } from "@/types/api";

export function getDashboard() {
  return apiFetch<DashboardResponse>("/dashboard");
}
