<script setup lang="ts">
definePageMeta({
  title: 'Finance',
  description: 'Redirecting to finance invoices',
  requiresAuth: true,
  permissions: ['admin:billing'],
})

const route = useRoute()

await navigateTo({
  path: '/app/admin/billing',
  query: {
    ...route.query,
    tab: 'invoices',
  },
}, { replace: true })
</script>

<template>
  <div class="container mx-auto max-w-5xl px-4 py-10">
    <p class="text-sm text-muted-foreground">Redirecting to finance...</p>
  </div>
</template>
