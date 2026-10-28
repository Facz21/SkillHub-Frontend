const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (!host || host === "") return "http://localhost:5076/api/v1";
    return `http://${host}:5076/api/v1`;
  }
  return "http://localhost:5076/api/v1";
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("skillhub_token") ||
      sessionStorage.getItem("skillhub_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Binary response (PDF download)
  if (response.headers.get("content-type")?.includes("application/pdf")) {
    if (!response.ok) {
      throw new ApiError("Error al generar el certificado PDF.", response.status);
    }
    return (await response.blob()) as unknown as T;
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("skillhub_token");
      localStorage.removeItem("skillhub_user");
      sessionStorage.removeItem("skillhub_token");
      sessionStorage.removeItem("skillhub_user");
      window.dispatchEvent(new CustomEvent("skillhub:auth-changed"));
    }
    throw new ApiError("Sesión expirada. Por favor ingresa nuevamente.", 401);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.detail ||
      data?.title ||
      data?.message ||
      (typeof data === "string" ? data : "Error en el servidor");
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}
