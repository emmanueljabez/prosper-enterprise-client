<template>
  <div>
    <Sidebar />
    <div class="content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/layouts/components/sidebar.vue';
</script>