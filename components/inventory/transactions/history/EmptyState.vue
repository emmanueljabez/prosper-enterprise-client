<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="mb-4">
      <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 48 48" stroke="currentColor">
        <circle cx="24" cy="24" r="22" stroke-width="2" class="opacity-20"/>
        <path d="M16 24h16M24 16v16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 class="text-xl font-semibold mb-2">{{ title }}</h2>
    <p class="text-muted-foreground mb-4" v-if="description">{{ description }}</p>
    <button
      v-if="$attrs['onClear-filters'] || $attrs['onClearFilters']"
      class="inline-flex items-center px-3 py-1.5 rounded bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition"
      @click="$emit('clear-filters')"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
defineEmits(['clear-filters'])
</script>