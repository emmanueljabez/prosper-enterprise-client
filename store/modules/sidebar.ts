import { defineStore } from 'pinia';
import { navigation } from '@/navigation/vertical/index';
import type { NavigationItem } from '@/navigation/vertical/navigation';

export interface SidebarState {
  navigation: NavigationItem[];
  togglesidebar: boolean;
  activeoverlay: boolean;
}

export const useSidebarStore = defineStore('sidebar', {
  state: (): SidebarState => ({
    navigation,
    togglesidebar: true,
    activeoverlay: false,
  }),
  getters: {
    activeRoute: (state) => state.navigation.find(item => item.isActive),
  },
  actions: {
    opensidebar() {
      this.togglesidebar = !this.togglesidebar;
      this.activeoverlay = window.innerWidth < 991;
    },
    resizetoggle() {
      this.togglesidebar = window.innerWidth >= 1007;
    },
    setActiveRoute(route: string) {
      this.navigation.forEach(item => {
        if (item.children) {
          item.children.forEach(subItem => {
            subItem.isActive = subItem.url === route;
          });
        }
      });
    },
  },
});