<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
    
    <!-- Global Session Warning Modal -->
    <ClientOnly>
      <SessionWarning />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/toast'
import { useAuthStore } from '@/store/modules/auth';
import { onMounted } from 'vue';
import SessionWarning from '@/components/ui/session/SessionWarning.vue'

onMounted(() => {
  const authStore = useAuthStore();
  console.log('🔍 App.vue: Initializing auth store from storage...');
  const result = authStore.initializeFromStorage();
  console.log('🔍 App.vue: Auth initialization result:', result);
  console.log('🔍 App.vue: LoggedInUser after init:', authStore.loggedInUser);
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