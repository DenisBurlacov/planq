import type { ApiError } from '@appTypes/api';
import { useAuthStore } from '@store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAuth, logout, user } = useAuthStore.getState();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  if (!user) {
    logout();
    return null;
  }
  setAuth(data.accessToken, data.refreshToken, user);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expired — try refresh once
  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ApiException(
      err.error ?? 'UNKNOWN_ERROR',
      err.message ?? 'An error occurred',
      res.status
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
