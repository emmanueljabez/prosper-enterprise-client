<template>
  <div :class="['relative w-full aspect-[155/88] max-w-[560px] max-h-[315px] rounded-3xl overflow-hidden shadow-3xl bg-gray-200 flex items-center justify-center', className]">
    <div class="flex flex-col items-center space-y-4 text-center p-6">
      <svg class="h-12 w-12 text-brand-purple" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
      <p class="text-gray-600 font-medium">Featured video coming soon</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ className?: string }>(), { className: '' })
</script>
