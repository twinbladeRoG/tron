import { create } from 'zustand';

import type { IUser } from '@/types';

interface UserState {
  user: IUser | null;
  updateUser: (value: IUser) => void;
  removeUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  updateUser: (value: IUser) => set(() => ({ user: value })),
  removeUser: () => set(() => ({ user: null })),
}));
