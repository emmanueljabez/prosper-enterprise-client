<template>
  <div class="divide-y">
    <div v-for="ticket in tickets" :key="ticket.id"
         class="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
         @click="$emit('view', ticket)">
      <div class="flex justify-between items-start">
        <div class="font-medium">{{ ticket.title }}</div>
        <Badge variant="destructive">{{ ticket.priority }}</Badge>
      </div>
      <div class="text-sm text-muted-foreground mt-1">
        <span>{{ ticket.customer.name }}</span> •
        <span>{{ formatTimeAgo(ticket.createdAt) }}</span>
      </div>
      <div class="text-sm mt-2 truncate">{{ ticket.description }}</div>
      <div class="mt-2 flex justify-between items-center">
        <Badge variant="outline">{{ ticket.type }}</Badge>
        <div class="text-xs text-muted-foreground">
          {{ ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : 'Unassigned' }}
        </div>
      </div>
    </div>
    <div v-if="tickets.length === 0" class="p-6 text-center text-muted-foreground">
      No urgent tickets at the moment
    </div>
  </div>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'
import { formatDistance } from 'date-fns'

defineProps({
  tickets: {
    type: Array,
    required: true,
    default: () => []
  }
})

defineEmits(['view'])

function formatTimeAgo(dateString) {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
}
</script>