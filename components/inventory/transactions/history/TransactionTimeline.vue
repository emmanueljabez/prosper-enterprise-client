<template>
  <div>
    <div v-if="transactions.length === 0" class="text-center text-muted-foreground py-8">
      No transactions to display.
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="(transaction, idx) in transactions"
        :key="transaction.id"
        class="rounded-lg border bg-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
      >
        <div>
          <div class="font-semibold text-base">
            {{ transaction.referenceNumber || transaction.id }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ transaction.type }} &mdash; {{ transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '' }}
          </div>
          <div class="text-xs text-muted-foreground" v-if="transaction.locationId && locationsMap[transaction.locationId]">
            Location: {{ locationsMap[transaction.locationId].name }}
          </div>
        </div>
        <div class="flex gap-2 mt-2 md:mt-0">
          <button
            class="inline-flex items-center px-3 py-1.5 rounded bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/80 transition"
            @click="$emit('view-transaction', transaction)"
          >
            View
          </button>
          <button
            v-if="canLoadMore && idx === transactions.length - 1"
            class="inline-flex items-center px-3 py-1.5 rounded border text-xs font-medium"
            :disabled="isLoadingMore"
            @click="$emit('load-more')"
          >
            <span v-if="isLoadingMore" class="animate-spin mr-2">⏳</span>
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  transactions: { type: Array, required: true },
  locations: { type: Array, default: () => [] },
  isLoadingMore: { type: Boolean, default: false },
  canLoadMore: { type: Boolean, default: false }
})

const locationsMap = computed(() => {
  const map = {}
  for (const loc of props.locations) {
    map[loc.id] = loc
  }
  return map
})
defineEmits(['view-transaction', 'load-more'])
</script>