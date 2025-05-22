<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Total Transactions</span>
      <span class="text-2xl font-bold">{{ stats.total }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Received</span>
      <span class="text-2xl font-bold">{{ stats.received }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Issued</span>
      <span class="text-2xl font-bold">{{ stats.issued }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Total Value</span>
      <span class="text-2xl font-bold">${{ stats.value.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true }
})
</script>