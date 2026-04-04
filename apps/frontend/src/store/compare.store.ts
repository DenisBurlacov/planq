import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareStore {
  productIds: string[];
  addProduct: (id: string) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
  hasProduct: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (id: string) => {
        const { productIds } = get();
        if (productIds.length >= 4) return;
        if (productIds.includes(id)) return;
        set({ productIds: [...productIds, id] });
      },
      removeProduct: (id: string) => {
        set(state => ({ productIds: state.productIds.filter(pid => pid !== id) }));
      },
      clearAll: () => set({ productIds: [] }),
      hasProduct: (id: string) => get().productIds.includes(id),
    }),
    { name: 'planq-compare' }
  )
);
