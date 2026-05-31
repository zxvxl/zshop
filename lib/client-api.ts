/**
 * Unified client-side API fetch helper.
 * Handles the {code, data, message} envelope automatically.
 * Throws on error (code !== 0 or HTTP error).
 */
export async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  // Envelope format: {code, data, message}
  if (json.code !== undefined) {
    if (json.code !== 0) {
      throw new Error(json.message || "Request failed");
    }
    return json.data as T;
  }

  // Legacy format (direct data)
  if (!res.ok) {
    throw new Error(json.error || json.message || `HTTP ${res.status}`);
  }

  return json as T;
}

/**
 * POST helper with JSON body
 */
export async function apiPost<T = any>(url: string, body: any): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
