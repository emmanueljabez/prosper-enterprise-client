import { defineStore } from 'pinia';
import { navigation } from '@/navigation/vertical/index';
import type { NavigationItem } from '@/navigation/vertical/navigation';
import { RoleManager } from '@/utils/roleManager';
import { useAuthStore } from '@/store/modules/auth';
import { employeeNavigation } from '@/navigation/vertical/employee';
import { mentorNavigation } from '@/navigation/vertical/mentor';
import { corporateAdminNavigation } from '@/navigation/vertical/corporate-admin';

export interface SidebarState {
  navigation: NavigationItem[];
  togglesidebar: boolean;
  activeoverlay: boolean;
  currentActiveRoute: string;
}

export const useSidebarStore = defineStore('sidebar', {
  state: (): SidebarState => ({
    navigation,
    togglesidebar: true,
    activeoverlay: false,
    currentActiveRoute: '',
  }),
  getters: {
    activeRoute: (state) => state.navigation.find(item => item.isActive),
    
    roleBasedNavigation: (state) => {
      //const authStore = useAuthStore();
      const role = localStorage.getItem("role");
      if (!role) return [];
      
      // Get role-specific navigation based on user's primary role
      let baseNavigation: NavigationItem[] = [];
      
      const cloneNav = (nav: NavigationItem[]) =>
        nav.map(item => ({
          ...item,
          children: item.children?.map(child => ({ ...child })) ?? [],
        }));

      if (role === 'company') {
        baseNavigation = cloneNav(corporateAdminNavigation);
      } else if (role === 'mentor') {
        baseNavigation = cloneNav(mentorNavigation);
      } else if (role === 'mentee') {
        baseNavigation = cloneNav(employeeNavigation);
      } else {
        baseNavigation = cloneNav(employeeNavigation);
      }

      // Set active states based on current route
      baseNavigation.forEach(item => {
        if (item.children) {
          item.children.forEach(subItem => {
            subItem.isActive = subItem.url === state.currentActiveRoute;
          });
        }
      });

      console.log('baseNavigation', baseNavigation);

      return baseNavigation;
      
    },

    // Keep the old filteredNavigation for backward compatibility
    filteredNavigation() {
      return this.roleBasedNavigation;
    },

    roleBasedMenuItems() {
      const authStore = useAuthStore();
      return RoleManager.getMenuItems(authStore.loggedInUser);
    }
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
      this.currentActiveRoute = route;
      
      // Also update the base navigation for compatibility
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