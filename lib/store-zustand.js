import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Active selected order for inspector / modal
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),

  // Node modal state
  isNodeModalOpen: false,
  setNodeModalOpen: (isOpen) => set({ isNodeModalOpen: isOpen }),

  // Filter tabs for payments
  activeFilter: "All",
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // Search query for invoices
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
