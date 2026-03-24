<script setup lang="ts">
definePageMeta({
  title: 'Corporate Subscription Plans',
  description: 'Redirecting to corporate subscription settings',
  requiresAuth: true,
  permissions: ['admin:settings'],
})

const route = useRoute()

await navigateTo({
  path: '/app/admin/settings',
  query: {
    ...route.query,
    tab: 'subscription',
  },
}, { replace: true })
</script>

<template>
  <div class="container mx-auto max-w-5xl px-4 py-10">
    <p class="text-sm text-muted-foreground">Redirecting to subscription settings...</p>
  </div>
</template>
