<script setup lang="ts">
import { watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/store/modules/sidebar';
import Navbar from '@/layouts/components/navbar.vue';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

const sidebarStore = useSidebarStore();
const route = useRoute();
const router = useRouter();

const navigation = computed(() => sidebarStore.roleBasedNavigation);

// Flatten all navigation groups into a single ordered list
const flatNavigation = computed(() =>
  navigation.value.flatMap(item => item.children || [])
);

const isPosPage = computed(() => route.path.includes('/app/inventory/pos'));

watch(
  () => route.path,
  (newPath) => sidebarStore.setActiveRoute(newPath),
  { immediate: true }
);

router.afterEach((to) => {
  sidebarStore.setActiveRoute(to.path);
});
</script>

<template>
  <div class="layout-container" style="height: 100vh; overflow: hidden; display: flex;">
    <SidebarProvider :style="{ '--sidebar-width': '76px', '--sidebar-width-icon': '76px' }">
      <Sidebar collapsible="none" class="sidebar-mini bg-background border-r z-50">
        <!-- Navigation Items -->
        <SidebarContent class="overflow-y-auto pt-4">
          <SidebarGroup class="px-2">
            <SidebarMenu class="gap-1">
              <SidebarMenuItem v-for="subItem in flatNavigation" :key="subItem.title">
                <NuxtLink
                  :to="subItem.url"
                  class="nav-link"
                  :class="{ 'nav-link-active': subItem.isActive }"
                  @click="() => sidebarStore.setActiveRoute(subItem.url ?? '')"
                >
                  <component :is="subItem.icon" class="size-5 shrink-0" />
                  <span class="nav-label">{{ subItem.title }}</span>
                </NuxtLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset class="flex flex-col h-screen overflow-y-auto">
        <header v-if="!isPosPage" class="sticky top-0 z-10 bg-background shadow-sm border-b">
          <div class="flex items-center h-16 px-4 w-full">
            <Navbar class="flex-1" />
          </div>
        </header>
        <div class="flex-1">
          <NuxtPage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<style scoped>
/* Ensure sidebar width is respected */
/* Lock the whole layout to the viewport so only the inset scrolls */
:deep([data-slot="sidebar-wrapper"]),
:deep([data-sidebar="provider"]) {
  height: 100vh !important;
  overflow: hidden !important;
}

:deep([data-slot="sidebar"]),
:deep([data-sidebar="sidebar"]) {
  width: 76px !important;
  min-width: 76px !important;
  max-width: 76px !important;
  height: 100vh !important;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 8px;
  margin-bottom: 8px;
  width: 100%;
  border-radius: 8px;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.nav-link:hover {
  color: #6b7280;
  background-color: rgba(0, 0, 0, 0.04);
}

.nav-link-active {
  color: #a03b93;
}


.nav-label {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
  white-space: nowrap;
}
</style>
