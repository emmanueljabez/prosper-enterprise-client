<script setup lang="ts">
const route = useRoute()

await navigateTo({
  path: '/app/admin',
  query: route.query,
}, {
  replace: true,
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <p class="text-sm text-muted-foreground">Redirecting to admin workspace...</p>
  </div>
</template>
