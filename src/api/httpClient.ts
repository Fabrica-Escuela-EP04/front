export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = res.headers.get("Content-Type");

  if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
    return undefined as T; 
  }

  return res.json();
}