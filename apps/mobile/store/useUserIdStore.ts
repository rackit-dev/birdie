import { create } from "zustand";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  setUser: (user: { id: string; name: string; email: string | null }) => void;
  clearUser: () => void;
}

export const useUserIdStore = create<UserState>((set) => ({
  id: null,
  name: null,
  email: null,
  setUser: (user) =>
    set((state) => ({
      id: user.id ?? state.id,
      name: user.name ?? state.name,
      email: user.email ?? state.email,
    })),
  clearUser: () => set(() => ({ id: null, name: null, email: null })),
}));
