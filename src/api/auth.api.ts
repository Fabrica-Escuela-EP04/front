import { http } from "./httpClient";
import { User } from "../models/User";

export async function login(email: string, password: string): Promise<User> {
  return http<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return http<void>("/auth/logout", {
    method: "POST"
  });
}

