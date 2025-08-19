import { create } from "zustand";
import axios from "axios";

export type Product = {
  id: string;
  image: any;
  brand: string;
  name: string;
  priceSell?: number;
  priceOriginal?: number;
  discount?: number;
  product_like_id?: string;
};

type LikeStore = {
  likedItems: Product[];
  fetchLikedItems: (userId: string) => Promise<void>;
  toggleLike: (userId: string, item: Product) => Promise<void>;
};

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const useLikeStore = create<LikeStore>((set, get) => ({
  likedItems: [],

  fetchLikedItems: async (userId) => {
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
          uri: `${process.env.EXPO_PUBLIC_API_IMAGE_URL}/products/${p.name}/thumbnail.jpg`,
        },
        product_like_id: likeIds[index],
      }));

      set({ likedItems: items });
    } catch (err) {
      console.error("좋아요 목록 불러오기 실패:", err);
    }
  },

  toggleLike: async (userId, item) => {
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
        const res = await axios.post(`${API_URL}/products/like`, {
          user_id: userId,
          product_id: item.id,
        });
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
