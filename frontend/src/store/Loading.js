// store/loaderStore.js
import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));