import { create } from "zustand";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  provider: string | null;
  setUser: (user: {
    id: string;
    name: string;
    email: string;
    provider: string;
  }) => void;
  clearUser: () => void;
}

export const useUserIdStore = create<UserState>((set) => ({
  id: null,
  name: null,
  email: null,
  provider: null,
  setUser: (user) => set(() => ({ ...user })),
  clearUser: () =>
    set(() => ({ id: null, name: null, email: null, provider: null })),
}));
