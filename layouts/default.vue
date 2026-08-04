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
    '/auth/signup',
    '/auth/confirm-email',
    '/auth/register',
    '/auth/onboarding',
    '/auth/email-verification',
    '/',
    '/auth/about',
    '/auth/account-setup',
    '/auth/employees',
    '/auth/password',
    '/auth/complete-signup',
    '/app/admin/onboarding',
    '/app/admin/activate',
    '/forgot-password',
    '/reset-password',
    '/landing',
    '/pricing',
  ];
  // Also hide sidebar for public session workflow pages (dynamic routes)
  const isSessionReviewPage = route.path.startsWith('/app/sessions/review/');
  const isSessionProposalPage = route.path.startsWith('/app/sessions/proposals/');
  return !hiddenRoutes.includes(route.path) && !isSessionReviewPage && !isSessionProposalPage;
});

onMounted(() => {
  isNuxtPageRendered.value = true;
});
</script>
