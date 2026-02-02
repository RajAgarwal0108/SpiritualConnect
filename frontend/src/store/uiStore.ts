import { create } from "zustand";

interface ChatTarget {
  id: number;
  name: string;
  avatar?: string;
}

interface UIState {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isChatExpanded: boolean;
  chatTarget: ChatTarget | null;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
  toggleChatExpanded: () => void;
  setChatExpanded: (expanded: boolean) => void;
  openChatWith: (target: ChatTarget) => void;
  clearChatTarget: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLeftSidebarOpen: true,
  isRightSidebarOpen: false,
  isChatExpanded: false,
  chatTarget: null,
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  setLeftSidebar: (open) => set({ isLeftSidebarOpen: open }),
  setRightSidebar: (open) => set((state) => ({ 
    isRightSidebarOpen: open, 
    isChatExpanded: open ? state.isChatExpanded : false 
  })),
  toggleChatExpanded: () => set((state) => ({ isChatExpanded: !state.isChatExpanded })),
  setChatExpanded: (expanded) => set({ isChatExpanded: expanded }),
  openChatWith: (target) => set({ isRightSidebarOpen: true, chatTarget: target }),
  clearChatTarget: () => set({ chatTarget: null }),
}));
