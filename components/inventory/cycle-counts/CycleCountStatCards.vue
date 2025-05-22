<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Scheduled</span>
      <span class="text-2xl font-bold">{{ stats.scheduled }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">In Progress</span>
      <span class="text-2xl font-bold">{{ stats.inProgress }}</span>
    </div>
    <div class="rounded-lg border bg-card p-4 flex flex-col items-center">
      <span class="text-sm text-muted-foreground">Pending Approval</span>
      <span class="text-2xl font-bold">{{ stats.pendingApproval }}</span>
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