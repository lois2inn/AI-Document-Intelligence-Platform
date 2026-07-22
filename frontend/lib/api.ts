// frontend/lib/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  isFormData?: boolean;
};

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  
  const { method = "GET", body, isFormData = false } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("Fetching:", url);

  const response = await fetch(url, {
    method,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    headers: isFormData
      ? undefined // VERY IMPORTANT: let browser set multipart headers
      : {
          "Content-Type": "application/json",
        },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("API error:", text);
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}