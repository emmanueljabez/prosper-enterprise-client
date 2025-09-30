<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/store/modules/sidebar';
import { useAuthStore } from '@/store/modules/auth';
import { RoleManager } from '@/utils/roleManager';
import Navbar from '@/layouts/components/navbar.vue';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarInset,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { ChevronsUpDown, Plus } from 'lucide-vue-next';

const sidebarStore = useSidebarStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);

// Get user's primary role for display
const userRole = computed(() => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return 'Guest';

  console.log("Check user role", user);
  
  if (RoleManager.isCorporateAdmin(user)) return 'Corporate Admin';
  if (RoleManager.isMentor(user)) return 'External Mentor';
  if (RoleManager.isEmployee(user)) return 'Employee';
  return 'User';
});

// Get role-based navigation
const navigation = computed(() => {
  const navItems = sidebarStore.roleBasedNavigation;
  console.log("Nav items ..... ")
  console.log(navItems)
  return navItems;
});

// Check if we're on the POS page to conditionally hide navbar
const isPosPage = computed(() => {
  return route.path.includes('/app/inventory/pos')
});

// Watch for route path changes to update the active route in the store
watch(
  () => route.path,
  (newPath) => {
    console.log('New path:', newPath);
    sidebarStore.setActiveRoute(newPath);
  },
  { immediate: true }
);

router.afterEach((to) => {
  console.log('Route changed to:', to.path);
  sidebarStore.setActiveRoute(to.path);
});

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: 'GalleryVerticalEnd',
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: 'AudioWaveform',
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: 'Command',
      plan: 'Free',
    },
  ],
};

const activeTeam = ref(data.teams[0]);

function setActiveTeam(team: typeof data.teams[number]) {
  activeTeam.value = team;
}
</script>

<template>
  <div class="layout-container" :class="{ 'sidebar-collapsed': isCollapsed }">
    <SidebarProvider>
      <Sidebar collapsible="icon" @collapse="isCollapsed = true" @expand="isCollapsed = false"
        class="bg-background shadow-2xl z-50">
        <SidebarHeader class="p-4 flex-shrink-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-start group-data-[collapsible=expanded]:justify-start">
                  <!-- Full logo when expanded -->
                  <img 
                    src="/images/prosper_mentor_logo.png"
                    alt="Prosper Mentor Logo"
                    class="h-16 w-auto group-data-[collapsible=icon]:hidden transition-all duration-200"
                  />
                  <!-- Favicon when collapsed -->
                  <img 
                    src="/images/favicon-32x32.png" 
                    alt="Prosper Mentor" 
                    class="hidden group-data-[collapsible=icon]:block h-6 w-6 transition-all duration-200" 
                  />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent class="sidebar-scrollable flex-1" style="overflow-y: auto;">
          <SidebarGroup class="h-full">
            <!-- Expanded view: Show full hierarchy -->
            <SidebarMenu class="group-data-[collapsible=icon]:hidden">
              <template v-for="(item, index) in navigation" :key="item.title">
                <SidebarMenuItem>
                  <SidebarMenuButton :tooltip="item.title" class="font-bold">
                    <!-- Never show parent icons -->
                    <span class="text-[16px]">{{ item.title }}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub v-if="item.children">
                    <SidebarMenuSubItem v-for="subItem in item.children" :key="subItem.title">
                      <SidebarMenuSubButton as-child :class="{ 'text-white': subItem.isActive }"
                        :style="{ background: subItem.isActive ? '#a03b93' : '' }"
                        :tooltip="subItem.title">
                        <NuxtLink :to="subItem.url" class="text-sm font-normal" @click="() => sidebarStore.setActiveRoute(subItem.url)">
                          <component :is="subItem.icon" class="mr-2 size-4" />
                          <span class="text-[14px]">{{ subItem.title }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <div v-if="index < navigation.length - 1" class="my-2"></div>
              </template>
            </SidebarMenu>
            
            <!-- Collapsed view: Show only child icons -->
            <div class="hidden group-data-[collapsible=icon]:block">
              <SidebarMenu class="space-y-1">
                <template v-for="item in navigation" :key="`collapsed-${item.title}`">
                  <template v-for="subItem in item.children" :key="`collapsed-${subItem.title}`">
                    <SidebarMenuItem>
                      <SidebarMenuButton as-child :tooltip="subItem.title" :class="{ 'text-white': subItem.isActive }"
                        :style="{ background: subItem.isActive ? '#a03b93' : '' }">
                        <NuxtLink :to="subItem.url" class="flex items-center justify-center p-2" @click="() => sidebarStore.setActiveRoute(subItem.url)">
                          <component :is="subItem.icon" class="size-4" />
                        </NuxtLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </template>
                </template>
              </SidebarMenu>
            </div>
          </SidebarGroup>
        </SidebarContent>
        <!-- <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuButton size="lg">
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">User Menu</span>
                    </div>
                    <ChevronsUpDown class="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" side="bottom" :side-offset="4">
                  <DropdownMenuLabel class="text-xs text-muted-foreground">User Options</DropdownMenuLabel>
                  <DropdownMenuItem class="gap-2 p-2">
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-2 p-2">
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="gap-2 p-2">
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter> -->
        <SidebarRail />
      </Sidebar>
      <SidebarInset class="sidebar-inset">
        <header v-if="!isPosPage" class="sticky top-0 z-10 bg-background shadow-lg border-b">
          <div class="flex items-center h-16 px-4 w-full max-w-[calc(100vw-var(--sidebar-width))]">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mx-2 h-4" />
            <Navbar class="flex-1" />
          </div>
        </header>
        
        <div class="content-area">
          <NuxtPage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<style scoped>
.sidebar-inset {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sidebar-scrollable {
  overflow-y: auto;
  flex: 1;
  /* Remove max-height to allow full expansion */
}

/* Enhanced scrollbar for collapsed state */
.sidebar-scrollable::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* Ensure proper height for the sidebar */
.group[data-side="left"] {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Remove bottom whitespace by ensuring content fills available space */
.sidebar-scrollable .space-y-1 {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* equivalent to space-y-1 */
}

/* Ensure collapsed menu is properly hidden in expanded state */
.group[data-collapsible="expanded"] .group-data-\[collapsible\=icon\]\:block {
  display: none !important;
}

/* Ensure expanded menu is properly hidden in collapsed state */
.group[data-collapsible="icon"] .group-data-\[collapsible\=icon\]\:hidden {
  display: none !important;
}

.bg-gray-200 {
  background-color: #e2e8f0;
  /* Tailwind CSS gray-200 */
}
</style>