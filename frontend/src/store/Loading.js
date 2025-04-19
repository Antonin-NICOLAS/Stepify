// store/loaderStore.js
import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  isLoading: true,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));