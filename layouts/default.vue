<template>
  <div class="layout-container" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Conditionally show the sidebar based on route path -->
    <Sidebar v-if="shouldShowSidebar" class="sidebar" @collapse="isCollapsed = true" @expand="isCollapsed = false" />
    <main class="content-area">
      <NuxtPage v-if="!shouldShowSidebar && isNuxtPageRendered" />
      <div v-else-if="!isNuxtPageRendered"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from '#app';
import Sidebar from '@/layouts/components/sidebar.vue';

const route = useRoute();
const isNuxtPageRendered = ref(false);
const isCollapsed = ref(false);

// Define logic for when to show the sidebar
const shouldShowSidebar = computed(() => {
  const hiddenRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/onboarding',
    '/auth/email-verification',
    '/',
    '/auth/about',
    '/auth/account-setup',
    '/auth/employees',
    '/auth/password',
    '/auth/complete-signup',
    '/forgot-password',
    '/reset-password',
  ];
  // Also hide sidebar for session review pages (dynamic routes)
  const isSessionReviewPage = route.path.startsWith('/app/sessions/review/');
  return !hiddenRoutes.includes(route.path) && !isSessionReviewPage;
});

onMounted(() => {
  isNuxtPageRendered.value = true;
});
</script>
