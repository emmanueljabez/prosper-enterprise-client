<template>
  <div class="flex flex-wrap gap-2 my-2">
    <template v-for="(value, key) in filters" :key="key">
      <span
        v-if="value && value !== 'all'"
        class="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
      >
        <span class="capitalize">{{ key }}:</span>
        <span class="ml-1">{{ value }}</span>
        <button
          class="ml-2 text-muted-foreground hover:text-destructive"
          @click="$emit(`clear-${key}`)"
          aria-label="Clear filter"
        >
          <XIcon class="h-3 w-3" />
        </button>
      </span>
    </template>
    <button
      v-if="Object.values(filters).some(v => v && v !== 'all')"
      class="ml-2 text-xs underline text-muted-foreground hover:text-destructive"
      @click="$emit('clear-all')"
    >
      Clear All
    </button>
  </div>
</template>

<script setup>
import { XIcon } from 'lucide-vue-next'
defineProps({
  filters: { type: Object, required: true }
})
defineEmits(['clear-type', 'clear-time', 'clear-item', 'clear-location', 'clear-all'])
</script>