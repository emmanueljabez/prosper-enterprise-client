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
      const userStr = localStorage.getItem("loggedInUser");
      if (!userStr) return [];
      
      const user = JSON.parse(userStr);
      const role = user.user_metadata.role;
      
      if (!user) return [];
      
      // Get role-specific navigation based on user's primary role
      let baseNavigation: NavigationItem[] = [];
      
      if (role === 'corporateAdmin') {
        baseNavigation = JSON.parse(JSON.stringify(corporateAdminNavigation));
      } else if (role === 'mentor') {
        baseNavigation = JSON.parse(JSON.stringify(mentorNavigation));
      } else if (role === 'mentee') {
        baseNavigation = JSON.parse(JSON.stringify(employeeNavigation));
      } else {
        // Fallback to employee navigation for users without specific roles
        baseNavigation = JSON.parse(JSON.stringify(employeeNavigation));
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