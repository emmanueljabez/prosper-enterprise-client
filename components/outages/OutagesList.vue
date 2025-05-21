<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold" v-if="title">{{ title }}</h3>

      <Button v-if="showViewAll" size="sm" variant="ghost" @click="$emit('view-all')">
        View all
        <ChevronRightIcon class="ml-1 h-4 w-4" />
      </Button>
    </div>

    <div class="space-y-2" v-if="outages.length > 0">
      <div
          v-for="outage in sortedOutages"
          :key="outage.id"
          class="p-3 rounded-md border cursor-pointer hover:bg-accent/30 transition-colors"
          @click="$emit('select', outage)"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-2">
            <div class="mt-1">
              <div class="h-2 w-2 rounded-full" :class="{
                'bg-red-500': outage.severity === 'critical',
                'bg-amber-500': outage.severity === 'major',
                'bg-blue-500': outage.severity === 'minor',
                'bg-purple-500': outage.severity === 'degraded'
              }"></div>
            </div>
            <div>
              <div class="font-medium">{{ outage.title }}</div>
              <div class="text-sm text-muted-foreground mt-0.5 line-clamp-1">{{ outage.description }}</div>
              <div class="flex items-center gap-1 mt-1">
                <Badge
                    :variant="getStatusVariant(outage.status)"
                    class="text-xs"
                >
                  {{ formatStatus(outage.status) }}
                </Badge>
                <Badge variant="outline" class="text-xs">
                  {{ formatServiceType(outage.serviceType) }}
                </Badge>
              </div>
            </div>
          </div>
          <div class="text-xs text-muted-foreground text-right">
            <div>{{ formatDate(outage.startedAt) }}</div>
            <div>{{ formatTime(outage.startedAt) }}</div>
            <div class="mt-1">{{ formatDuration(outage) }}</div>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-1" v-if="outage.affectedAreas && outage.affectedAreas.length">
          <Badge
              v-for="area in outage.affectedAreas.slice(0, 2)"
              :key="area"
              variant="outline"
              class="text-xs"
          >
            {{ area }}
          </Badge>
          <Badge
              v-if="outage.affectedAreas.length > 2"
              variant="outline"
              class="text-xs"
          >
            +{{ outage.affectedAreas.length - 2 }} more
          </Badge>
        </div>
      </div>
    </div>

    <div v-else class="p-6 text-center text-muted-foreground">
      <AlertCircleIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>{{ emptyMessage || 'No outages found' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, formatDistance } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircleIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps({
  outages: {
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
    default: 'No active outages'
  }
})

defineEmits(['select', 'view-all'])

const sortedOutages = computed(() => {
  return props.outages
      .sort((a, b) => {
        // Sort by status (active first) then by severity (critical first) then by date (newest first)
        if (a.status === 'resolved' && b.status !== 'resolved') return 1
        if (a.status !== 'resolved' && b.status === 'resolved') return -1

        const severityOrder = { 'critical': 0, 'major': 1, 'minor': 2, 'degraded': 3 }
        if (a.status !== 'resolved' && b.status !== 'resolved') {
          if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity]
          }
        }

        return new Date(b.startedAt) - new Date(a.startedAt)
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

function formatDuration(outage) {
  const start = new Date(outage.startedAt)
  const end = outage.resolvedAt ? new Date(outage.resolvedAt) : new Date()

  return outage.resolvedAt ?
      formatDistance(start, end) :
      formatDistance(start, end) + ' (ongoing)'
}

function formatStatus(status) {
  const statusMap = {
    'investigating': 'Investigating',
    'identified': 'Identified',
    'monitoring': 'Monitoring',
    'in_progress': 'In Progress',
    'mitigated': 'Mitigated',
    'resolved': 'Resolved'
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

function getStatusVariant(status) {
  const variantMap = {
    'investigating': 'secondary',
    'identified': 'warning',
    'monitoring': 'info',
    'in_progress': 'primary',
    'mitigated': 'info',
    'resolved': 'success'
  }
  return variantMap[status] || 'secondary'
}
</script>