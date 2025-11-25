export const API_URL = import.meta.env.VITE_API_URL ?? "https://fabrica-escuela-2025-2-back.onrender.com/api/v1";

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
  console.log(contentType);

  if (res.status === 204 || !contentType ) {
    return undefined as T; 
  }

  console.log("returning the json object or exception");
  return res.json();
}