<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <img
      src="/images/pcash_logo.png"
      alt="Logo"
      class="w-48 h-48 mb-8 animate-pulse object-contain"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'nuxt/app'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/auth/login')
  }, 3000) // Redirect after 3 seconds
})
</script>

<style scoped>
.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>