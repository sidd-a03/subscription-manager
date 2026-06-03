import { create } from 'zustand'

interface Token {
    token: string | null;
    setToken: (token: string) => void;
    removeToken: () => void;
}

const useAuthStore = create<Token>((set) => ({
    token: null,
    setToken: (token: string) => set({ token }),
    removeToken: () => set({ token: null }),
}))

export default useAuthStore;