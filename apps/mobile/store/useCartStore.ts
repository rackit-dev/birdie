import { create } from "zustand";
import axios from "axios";
import { useUserIdStore } from "./useUserIdStore";

type CartState = {
  count: number;
  loading: boolean;
  error?: string;
  fetchCount: () => Promise<void>;
  setCount: (n: number) => void;
  invalidate: () => Promise<void>;
};

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  loading: false,
  error: undefined,

  async fetchCount() {
    const userId = useUserIdStore.getState().id;
    if (!userId) return;

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
  async invalidate() {
    await useCartStore.getState().fetchCount();
  },
}));
