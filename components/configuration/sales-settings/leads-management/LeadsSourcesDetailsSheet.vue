<template>
  <SheetContent class="sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Lead Source Details</SheetTitle>
      <SheetDescription>
        View lead source information
      </SheetDescription>
    </SheetHeader>

    <div v-if="leadSource" class="py-6 space-y-6">
      <!-- Lead Source Header -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-lg">{{ leadSource.name }}</h3>
          <Badge :variant="getStatusVariant(leadSource.status)">
            {{ formatStatus(leadSource.status) }}
          </Badge>
        </div>

        <div v-if="leadSource.description" class="space-y-2">
          <p class="text-sm text-muted-foreground">Description</p>
          <p>{{ leadSource.description }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p class="text-sm text-muted-foreground">Created Date</p>
            <p>{{ formatDate(leadSource.created) }}</p>
          </div>
          <div v-if="leadSource.updated">
            <p class="text-sm text-muted-foreground">Last Updated</p>
            <p>{{ formatDate(leadSource.updated) }}</p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Statistics (if available) -->
      <div class="space-y-3" v-if="hasStatistics">
        <h3 class="font-medium">Statistics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Total Leads</p>
            <p class="font-medium">{{ leadSource.totalLeads || 0 }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Conversion Rate</p>
            <p class="font-medium">{{ leadSource.conversionRate || 0 }}%</p>
          </div>
        </div>
      </div>

      <!-- Additional Information (if any) -->
      <div v-if="leadSource.notes" class="space-y-3">
        <Separator />
        <h3 class="font-medium">Notes</h3>
        <p class="text-sm">{{ leadSource.notes }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 mt-6">
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button variant="default" @click="$emit('edit-leadSource', leadSource)">
        <EditIcon class="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EditIcon } from 'lucide-vue-next'

const props = defineProps({
  leadSource: {
    type: Object,
    default: null
  }
})

defineEmits(['edit-leadSource', 'close'])

// Check if the lead source has statistics data
const hasStatistics = computed(() => {
  return props.leadSource &&
    (props.leadSource.totalLeads !== undefined ||
      props.leadSource.conversionRate !== undefined)
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function getStatusVariant(status) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'NOT_ACTIVE') return 'warning'
  if (status === 'PLANNED') return 'warning'
  return 'default'
}

function formatStatus(status) {
  if (!status) return ''

  // Replace underscores with spaces and capitalize
  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}
</script>