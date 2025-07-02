<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/store/modules/sidebar';
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
const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);

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
              <div class="flex items-center justify-start group-data-[collapsible=expanded]:justify-start">
                <!-- Full logo when expanded -->
                <img 
                  src="/images/ispbox_logo.png" 
                  alt="ISPBox Logo" 
                  class="h-7 w-auto group-data-[collapsible=icon]:hidden transition-all duration-200" 
                />
                <!-- Favicon when collapsed -->
                <img 
                  src="/images/favicon-32x32.png" 
                  alt="ISPBox" 
                  class="hidden group-data-[collapsible=icon]:block h-6 w-6 transition-all duration-200" 
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent class="sidebar-scrollable flex-1" style="overflow-y: auto;">
          <SidebarGroup class="h-full">
            <!-- Expanded view: Show full hierarchy -->
            <SidebarMenu class="group-data-[collapsible=icon]:hidden">
              <template v-for="(item, index) in sidebarStore.navigation" :key="item.title">
                <SidebarMenuItem>
                  <SidebarMenuButton :tooltip="item.title" class="font-bold">
                    <!-- Never show parent icons -->
                    <span class="text-[16px]">{{ item.title }}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub v-if="item.children">
                    <SidebarMenuSubItem v-for="subItem in item.children" :key="subItem.title">
                      <SidebarMenuSubButton as-child :class="{ 'text-white': subItem.isActive }"
                        :style="{ background: subItem.isActive ? 'linear-gradient(90deg, #7453a4, #7453a4)' : '' }"
                        :tooltip="subItem.title">
                        <NuxtLink :to="subItem.url" class="text-sm font-normal">
                          <component :is="subItem.icon" class="mr-2 size-4" />
                          <span class="text-[14px]">{{ subItem.title }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <div v-if="index < sidebarStore.navigation.length - 1" class="my-2"></div>
              </template>
            </SidebarMenu>
            <!-- Collapsed view: Show only child icons -->
            <SidebarMenu class="hidden group-data-[collapsible=icon]:block space-y-1">
              <template v-for="item in sidebarStore.navigation" :key="`collapsed-${item.title}`">
                <template v-for="subItem in item.children" :key="`collapsed-${subItem.title}`">
                  <SidebarMenuItem>
                    <SidebarMenuButton as-child :tooltip="subItem.title" :class="{ 'text-white': subItem.isActive }"
                      :style="{ background: subItem.isActive ? 'linear-gradient(90deg, #7453a4, #7453a4)' : '' }">
                      <NuxtLink :to="subItem.url" class="flex items-center justify-center p-2">
                        <component :is="subItem.icon" class="size-4" />
                      </NuxtLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </template>
              </template>
            </SidebarMenu>
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
        <header class="sticky top-0 z-10 bg-background shadow-lg border-b">
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
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.bg-gray-200 {
  background-color: #e2e8f0;
  /* Tailwind CSS gray-200 */
}
</style>