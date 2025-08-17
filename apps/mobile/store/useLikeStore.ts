import { create } from "zustand";

type Product = {
  id: string;
  image: any; // number | { uri: string } 모두 허용하려면 any 또는 정확히 정의
  brand: string;
  name: string;
  priceSell: number;
  priceOriginal: number;
  discount: number;
};

type LikeStore = {
  likedItems: Product[];
  toggleLike: (item: Product) => void;
};

const useLikeStore = create<LikeStore>((set) => ({
  likedItems: [],
  toggleLike: (item) =>
    set((state) => {
      const isLiked = state.likedItems.some((liked) => liked.id === item.id);
      return {
        likedItems: isLiked
          ? state.likedItems.filter((liked) => liked.id !== item.id)
          : [...state.likedItems, item],
      };
    }),
}));

export default useLikeStore;
