import { useState } from "react";
import { login } from "../api/auth.api";
import { User } from "../models/User";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  async function handleLogin(email: string, password: string) {
    const loggedUser = await login(email, password);
    setUser(loggedUser);
    return loggedUser;
  }

  return { user, handleLogin };
}