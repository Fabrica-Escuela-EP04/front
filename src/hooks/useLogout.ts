import { logout } from "../api/auth.api";

export function useLogout() {

  async function handleLogout() {
    await logout();
    return;
  }

  return { handleLogout };
}