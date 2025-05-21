<template>
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to
        <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span> of
        <span class="font-medium">{{ totalItems }}</span> users
      </div>
  
      <div class="flex items-center space-x-2">
        <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="$emit('update:currentPage', currentPage - 1)"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
  
        <div v-for="page in totalPages" :key="page" class="pagination-link" :class="{ active: currentPage === page }">
          <button
              @click="$emit('update:currentPage', page)"
          >
            {{ page }}
          </button>
        </div>
  
        <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="$emit('update:currentPage', currentPage + 1)"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  
  defineProps({
    currentPage: {type: Number, default: 1},
    totalPages: {type: Number, default: 1},
    pageSize: {type: Number, default: 1},
    totalItems: {type: Number, default: 0}
  });
  
  defineEmits(['update:currentPage']);
  </script>
  
  <style scoped>
  .pagination-link {
    @apply inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium;
  }
  
  .pagination-link.active {
    @apply bg-primary text-primary-foreground;
  }
  
  .pagination-link:not(.active) {
    @apply text-foreground hover:bg-muted;
  }
  </style>