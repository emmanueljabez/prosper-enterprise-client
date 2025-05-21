<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/toast'
import { useAuthStore } from '@/store/modules/auth';
import { onMounted } from 'vue';

onMounted(() => {
  const authStore = useAuthStore();
  authStore.initializeFromStorage();
});
</script>


<style>
.success-toast {
  background-color: hsl(142, 76%, 36%);
  color: white;
  border-left: 4px solid hsl(142, 76%, 26%);
}

.warning-toast {
  background-color: hsl(48, 96%, 53%);
  color: hsl(20, 6%, 19%);
  border-left: 4px solid hsl(48, 96%, 43%);
}
</style>