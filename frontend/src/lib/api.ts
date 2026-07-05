const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:7000";

interface ApiEnvelope<T> {
  statusCode?: number;
  data: T;
  msg: string;
  success: boolean;
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: ApiEnvelope<unknown>["errors"] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiOptions = RequestInit & {
  skipRefresh?: boolean;
};

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const payload = (await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response",
    data: null,
    msg: "",
  }))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new ApiClientError(
      payload.message || payload.msg || "Request failed",
      response.status,
      payload.errors,
    );
  }

  return payload;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiEnvelope<T>> {
  const { skipRefresh = false, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (response.status === 401 && !skipRefresh) {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const retryResponse = await fetch(`${API_URL}${path}`, {
        ...requestOptions,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      return parseResponse<T>(retryResponse);
    }
  }

  return parseResponse<T>(response);
}
