<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Pending Approval</span>
      <span class="text-2xl font-bold">{{ stats.pending }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">In Transit</span>
      <span class="text-2xl font-bold">{{ stats.inTransit }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Awaiting Receipt</span>
      <span class="text-2xl font-bold">{{ stats.awaitingReceipt }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Completed This Month</span>
      <span class="text-2xl font-bold">{{ stats.completedThisMonth }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true }
})
</script>