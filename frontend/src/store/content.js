import { create } from "zustand";

export const useContentStore = create((set) => ({
  contentType: "movie",
  setContentType: (type) => set({ contentType: type }),
}));
// Default type is movie and it changes between movie and tv show
