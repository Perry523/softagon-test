import { defineStore } from "pinia";
import type { User } from "better-auth/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isLoggedIn(): boolean {
      return !!this.user?.id;
    },
  },
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
    logout() {
      this.clearUser();
    },
  },
  persist: true,
});
