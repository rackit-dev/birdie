import { create } from "zustand";
import axios from "axios";
import { useUserIdStore } from "./useUserIdStore";
import { API_URL, IMAGE_URL } from "@env";

export type Product = {
  id: string;
  image: any;
  brand: string;
  name: string;
  priceSell?: number;
  priceOriginal?: number;
  discount?: number;
  product_like_id?: string;
  isActive: boolean;
};

type LikeStore = {
  likedItems: Product[];
  fetchLikedItems: () => Promise<void>;
  toggleLike: (item: Product) => Promise<void>;
};

const useLikeStore = create<LikeStore>((set, get) => ({
  likedItems: [],

  fetchLikedItems: async () => {
    const userId = useUserIdStore.getState().id;
    if (!userId) return;

    try {
      const res = await axios.get(`${API_URL}/products/like`, {
        params: { user_id: userId },
      });
      const productsArray = res.data?.products || [];
      const likeIds = res.data?.product_like_ids || [];

      const items: Product[] = productsArray.map((p: any, index: number) => ({
        id: p.id,
        name: p.name,
        brand: p.category_sub,
        priceSell: p.price_sell,
        priceOriginal: p.price_whole,
        discount: p.discount_rate,
        image: {
          uri: `${IMAGE_URL}/products/${p.name}/thumbnail.jpg`,
        },
        product_like_id: likeIds[index],
      }));

      set({ likedItems: items });
    } catch (err) {
      console.error("좋아요 목록 불러오기 실패:", err);
    }
  },

  toggleLike: async (item) => {
    const userId = useUserIdStore.getState().id;
    if (!userId) {
      console.error("userId가 없음");
      return;
    }

    const isLiked = get().likedItems.some((liked) => liked.id === item.id);

    try {
      if (isLiked) {
        const target = get().likedItems.find((liked) => liked.id === item.id);
        if (!target?.product_like_id) return;

        await axios.delete(`${API_URL}/products/like`, {
          params: { product_like_id: target.product_like_id },
        });

        set({
          likedItems: get().likedItems.filter((liked) => liked.id !== item.id),
        });
      } else {
        console.log("좋아요 요청 바디", {
          user_id: userId,
          product_id: item.id,
        });

        const res = await axios.post(
          `${API_URL}/products/like`,
          {
            user_id: userId,
            product_id: item.id,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("좋아요 응답:", res.data);

        set({
          likedItems: [
            ...get().likedItems,
            { ...item, product_like_id: res.data.id },
          ],
        });
      }
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
    }
  },
}));

export default useLikeStore;
