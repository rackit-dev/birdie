import { create } from "zustand";
import axios from "axios";

type CartState = {
  count: number;
  loading: boolean;
  error?: string;
  fetchCount: (userId: string) => Promise<void>;
  setCount: (n: number) => void;
  invalidate: (userId: string) => Promise<void>;
};

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  loading: false,
  error: undefined,
  async fetchCount(userId: string) {
    try {
      set({ loading: true, error: undefined });
      const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}`;
      const res = await axios.get(`${API_URL}/cartitems`, {
        params: { user_id: userId },
      });
      set({ count: res.data.total_count ?? 0, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "failed" });
    }
  },
  setCount(n) {
    set({ count: n });
  },
  async invalidate(userId: string) {
    await useCartStore.getState().fetchCount(userId);
  },
}));
