<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Active Rules</span>
      <span class="text-2xl font-bold">{{ stats.activeRules }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Low Stock Items</span>
      <span class="text-2xl font-bold">{{ stats.lowStockItems }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Pending Reorders</span>
      <span class="text-2xl font-bold">{{ stats.pendingReorders }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Reordered This Month</span>
      <span class="text-2xl font-bold">{{ stats.reorderedLastMonth }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true }
})
</script>