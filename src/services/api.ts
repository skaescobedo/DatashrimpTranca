const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const AUTH_TOKEN_KEY = 'datashrimp_token';

export class APIError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function buildHeaders(body: unknown): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function getErrorMessage(statusText: string, data: unknown): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const detail = record.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join(', ');
    }
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }
  }
  return statusText || 'Error en la solicitud';
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.body),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new APIError(getErrorMessage(response.statusText, data), response.status, data);
  }

  return data as T;
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function del(path: string): Promise<void> {
  return apiRequest<void>(path, { method: 'DELETE' });
}
