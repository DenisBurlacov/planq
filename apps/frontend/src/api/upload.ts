import { useAuthStore } from '@store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL as string;

async function uploadFetch<T>(path: string, body: FormData): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Upload failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const uploadApi = {
  avatar: async (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    const profile = await uploadFetch<{ avatar: string | null }>('/api/v1/profile/avatar', form);
    return { url: profile.avatar ?? '' };
  },

  productImages: async (productId: string, files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    const product = await uploadFetch<{ images: string[] }>(
      `/api/v1/admin/products/${productId}/images`,
      form
    );
    return { urls: product.images };
  },
};
