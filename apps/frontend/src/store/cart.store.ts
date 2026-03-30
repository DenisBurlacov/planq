import { create } from 'zustand';

interface CartState {
  itemCount: number;
  setItemCount: (count: number) => void;
  increment: (by?: number) => void;
  decrement: (by?: number) => void;
}

export const useCartStore = create<CartState>()(set => ({
  itemCount: 0,
  setItemCount: count => set({ itemCount: count }),
  increment: (by = 1) => set(state => ({ itemCount: state.itemCount + by })),
  decrement: (by = 1) => set(state => ({ itemCount: Math.max(0, state.itemCount - by) })),
}));
