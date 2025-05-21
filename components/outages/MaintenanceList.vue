<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold" v-if="title">{{ title }}</h3>

      <Button v-if="showViewAll" size="sm" variant="ghost" @click="$emit('view-all')">
        View all
        <ChevronRightIcon class="ml-1 h-4 w-4" />
      </Button>
    </div>

    <div class="space-y-2" v-if="maintenanceEvents.length > 0">
      <div
          v-for="maintenance in sortedMaintenanceEvents"
          :key="maintenance.id"
          class="p-3 rounded-md border cursor-pointer hover:bg-accent/30 transition-colors"
          @click="$emit('select', maintenance)"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-2">
            <div class="mt-1">
              <WrenchIcon v-if="maintenance.maintenanceType === 'planned'" class="h-4 w-4 text-blue-500" />
              <AlertTriangleIcon v-else class="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div class="font-medium">{{ maintenance.title }}</div>
              <div class="text-sm text-muted-foreground mt-0.5 line-clamp-1">{{ maintenance.description }}</div>
              <div class="flex items-center gap-1 mt-1">
                <Badge
                    :variant="getMaintenanceStatusVariant(maintenance.status)"
                    class="text-xs"
                >
                  {{ formatMaintenanceStatus(maintenance.status) }}
                </Badge>
                <Badge variant="outline" class="text-xs">
                  {{ formatServiceType(maintenance.serviceType) }}
                </Badge>
              </div>
            </div>
          </div>
          <div class="text-xs text-muted-foreground text-right">
            <div>{{ formatDate(maintenance.scheduledStart) }}</div>
            <div>{{ formatTime(maintenance.scheduledStart) }}</div>
            <div class="mt-1">{{ formatMaintenanceDuration(maintenance) }}</div>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-1" v-if="maintenance.affectedAreas && maintenance.affectedAreas.length">
          <Badge
              v-for="area in maintenance.affectedAreas.slice(0, 2)"
              :key="area"
              variant="outline"
              class="text-xs"
          >
            {{ area }}
          </Badge>
          <Badge
              v-if="maintenance.affectedAreas.length > 2"
              variant="outline"
              class="text-xs"
          >
            +{{ maintenance.affectedAreas.length - 2 }} more
          </Badge>
        </div>
      </div>
    </div>

    <div v-else class="p-6 text-center text-muted-foreground">
      <CalendarX2Icon class="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>{{ emptyMessage || 'No maintenance events scheduled' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, differenceInMinutes } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WrenchIcon, AlertTriangleIcon, ChevronRightIcon, CalendarX2Icon } from 'lucide-vue-next'

const props = defineProps({
  maintenanceEvents: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showViewAll: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 5
  },
  emptyMessage: {
    type: String,
    default: 'No maintenance events scheduled'
  }
})

defineEmits(['select', 'view-all'])

const sortedMaintenanceEvents = computed(() => {
  return props.maintenanceEvents
      .sort((a, b) => {
        // Sort by status and then by scheduled start date
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
        if (a.status !== 'cancelled' && b.status === 'cancelled') return -1

        // Then sort by date (soonest first for upcoming, most recent first for completed)
        if (a.status === 'completed' && b.status === 'completed') {
          return new Date(b.completedAt || b.scheduledEnd) - new Date(a.completedAt || a.scheduledEnd)
        } else {
          return new Date(a.scheduledStart) - new Date(b.scheduledStart)
        }
      })
      .slice(0, props.limit)
})

function formatDate(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'MMM dd, yyyy')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'h:mm a')
}

function formatMaintenanceDuration(maintenance) {
  if (!maintenance.scheduledStart || !maintenance.scheduledEnd) return ''

  const start = new Date(maintenance.scheduledStart)
  const end = new Date(maintenance.scheduledEnd)
  const minutes = differenceInMinutes(end, start)

  if (minutes < 60) {
    return `${minutes} minutes`
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr` : ''}`
  }
}

function formatMaintenanceStatus(status) {
  const statusMap = {
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'delayed': 'Delayed',
    'extended': 'Extended',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

function formatServiceType(type) {
  const typeMap = {
    'fiber': 'Fiber',
    'wireless': 'Wireless',
    'backbone': 'Backbone',
    'data_center': 'Data Center'
  }
  return typeMap[type] || type
}

function getMaintenanceStatusVariant(status) {
  const variantMap = {
    'scheduled': 'secondary',
    'in_progress': 'primary',
    'delayed': 'warning',
    'extended': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }
  return variantMap[status] || 'secondary'
}
</script>