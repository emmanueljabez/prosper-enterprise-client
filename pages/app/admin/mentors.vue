<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  title: 'Mentors (Admin)',
  description: 'Redirecting to mentors directory',
  requiresAuth: true,
  permissions: ['admin:mentors']
})

const router = useRouter()

onMounted(() => {
  router.replace('/app/mentors')
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    Redirecting to mentors...
  </div>
</template>

<style scoped>
.container { max-width: 1200px; }
</style>



