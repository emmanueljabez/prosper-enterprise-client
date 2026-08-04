import { defineStore } from 'pinia';
import { navigation } from '@/navigation/vertical/index';
import type { NavigationItem } from '@/navigation/vertical/navigation';
import { RoleManager } from '@/utils/roleManager';
import { useAuthStore } from '@/store/modules/auth';
import { employeeNavigation } from '@/navigation/vertical/employee';
import { mentorNavigation } from '@/navigation/vertical/mentor';
import { corporateAdminNavigation } from '@/navigation/vertical/corporate-admin';

type SidebarRole = 'company' | 'mentor' | 'employee';

const CORPORATE_ROLE_NAMES = new Set(['company', 'company_admin', 'corporate_admin']);
const MENTOR_ROLE_NAMES = new Set(['mentor', 'advisor']);
const EMPLOYEE_ROLE_NAMES = new Set(['employee', 'mentee', 'advisee']);

const parseStoredJson = (key: string): any | null => {
  if (typeof window === 'undefined') return null;

  const rawValue = localStorage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const normalizeRoleName = (role: unknown): string => {
  if (typeof role === 'object' && role !== null) {
    const roleObject = role as { name?: unknown; id?: unknown };
    return String(roleObject.name || roleObject.id || '').trim().toLowerCase();
  }

  return String(role || '').trim().toLowerCase();
};

const resolveSidebarRoleFromRoleNames = (roleNames: unknown[]): SidebarRole | null => {
  const normalizedRoles = roleNames.map(normalizeRoleName).filter(Boolean);

  if (normalizedRoles.some(role => CORPORATE_ROLE_NAMES.has(role))) {
    return 'company';
  }

  if (normalizedRoles.some(role => MENTOR_ROLE_NAMES.has(role))) {
    return 'mentor';
  }

  if (normalizedRoles.some(role => EMPLOYEE_ROLE_NAMES.has(role))) {
    return 'employee';
  }

  return null;
};

const resolveStoredSidebarRoleNames = (): unknown[] => {
  if (typeof window === 'undefined') return [];

  const parsedProfile = parseStoredJson('profile');
  const parsedUser = parseStoredJson('loggedInUser');

  return [
    parsedProfile?.role,
    ...(Array.isArray(parsedUser?.roles) ? parsedUser.roles : []),
    localStorage.getItem('role'),
  ];
};

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
      const authStore = useAuthStore();
      const role = resolveSidebarRoleFromRoleNames([
        ...(authStore.loggedInUser?.roles || []),
        ...resolveStoredSidebarRoleNames(),
      ]);
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
      } else if (role === 'employee') {
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
