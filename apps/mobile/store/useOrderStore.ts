import { create } from "zustand";

type Product = {
  id: number;
  name: string;
  option: string;
  quantity: number;
  price: number;
  image: string;
  brand: string;
};

type Address = {
  id: number;
  zipcode: string;
  line1: string;
  line2?: string;
  name: string;
  phone: string;
  isDefault?: boolean;
};

type OrderState = {
  products: Product[];
  selectedAddress: Address | null;
  paymentMethod: "tosspay" | "kakaopay" | "card" | "phone";
  point: number;
  orderMemo: string;

  // actions
  setProducts: (products: Product[]) => void;
  setSelectedAddress: (addr: Address) => void;
  setPaymentMethod: (method: OrderState["paymentMethod"]) => void;
  setPoint: (point: number) => void;
  setOrderMemo: (memo: string) => void;
  resetOrder: () => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  products: [],
  selectedAddress: null,
  paymentMethod: "tosspay",
  point: 0,
  orderMemo: "",

  setProducts: (products) => set({ products }),
  setSelectedAddress: (addr) => set({ selectedAddress: addr }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPoint: (point) => set({ point }),
  setOrderMemo: (memo) => set({ orderMemo: memo }),
  resetOrder: () =>
    set({
      products: [],
      selectedAddress: null,
      paymentMethod: "tosspay",
      point: 0,
      orderMemo: "",
    }),
}));
