"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  menuId: string;
  cookId: string;
  name: string;
  price: number;
  quantity: number;
  photoUrl?: string | null;
}

interface CartState {
  items: CartItem[];
  cookId: string | null;
  menuId: string | null;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cookId: null,
      menuId: null,
      isOpen: false,

      addItem: (item) => {
        const state = get();

        // Only allow items from one cook at a time
        if (state.cookId && state.cookId !== item.cookId) {
          set({
            items: [{ ...item, quantity: 1 }],
            cookId: item.cookId,
            menuId: item.menuId,
          });
          return;
        }

        const existing = state.items.find(
          (i) => i.menuItemId === item.menuItemId
        );
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, { ...item, quantity: 1 }],
            cookId: item.cookId,
            menuId: item.menuId,
          });
        }
      },

      removeItem: (menuItemId) => {
        const newItems = get().items.filter(
          (i) => i.menuItemId !== menuItemId
        );
        if (newItems.length === 0) {
          set({ items: [], cookId: null, menuId: null });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () =>
        set({ items: [], cookId: null, menuId: null }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setOpen: (open) => set({ isOpen: open }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "homeplate-cart",
      partialize: (state) => ({
        items: state.items,
        cookId: state.cookId,
        menuId: state.menuId,
      }),
    }
  )
);
