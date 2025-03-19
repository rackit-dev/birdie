import { create } from "zustand";

type Product = {
  id: string;
  image: number;
  brand: string;
  name: string;
  price: string;
};

type LikeStore = {
  likedItems: Product[];
  toggleLike: (item: Product) => void;
};

const useLikeStore = create<LikeStore>((set) => ({
  likedItems: [],
  toggleLike: (item) =>
    set((state) => {
      const isLiked = state.likedItems.some(
        (liked) => liked.name === item.name
      );
      return {
        likedItems: isLiked
          ? state.likedItems.filter((liked) => liked.name !== item.name)
          : [...state.likedItems, item],
      };
    }),
}));

export default useLikeStore;
