export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      msg = (data as any)?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: any) => request<T>(url, { method: "POST", body: JSON.stringify(body || {}) }),
  postForm: <T>(url: string, form: FormData) => request<T>(url, { method: "POST", body: form }),
};
