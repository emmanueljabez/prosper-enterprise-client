<template>
  <div class="space-y-4">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="min-w-[200px]">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="h-24 text-center">
              <div class="flex items-center justify-center">
                <Loader2Icon class="h-6 w-6 animate-spin" />
                <span class="ml-2">Loading cycle counts...</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="cycleCounts.length === 0">
            <TableCell colspan="6" class="h-24 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClipboardListIcon class="h-10 w-10 text-muted-foreground" />
                <h3 class="mt-2 text-lg font-medium">No cycle counts found</h3>
                <p class="text-sm text-muted-foreground">
                  No cycle counts match your current filters.
                </p>
                <Button 
                  variant="outline" 
                  class="mt-4"
                  @click="$emit('refresh')"
                >
                  <RefreshCwIcon class="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="count in cycleCounts" :key="count.id">
            <TableCell>
              <div class="font-medium">{{ count.name }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-[200px]">
                {{ count.description || 'No description' }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(count.status)">
                {{ formatStatus(count.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <span v-if="getLocationName(count.locationId)">
                {{ getLocationName(count.locationId) }}
              </span>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <div>{{ formatDate(count.startDate) }}</div>
              <div v-if="count.completedAt" class="text-xs text-muted-foreground">
                Completed: {{ formatDate(count.completedAt) }}
              </div>
            </TableCell>
            <TableCell>
              <Badge v-if="count.isRecurring" variant="outline">
                {{ formatRecurrence(count.recurrencePattern) }}
              </Badge>
              <span v-else class="text-muted-foreground">One-time</span>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      @click="$emit('view-count', count)"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Details</TooltipContent>
                </Tooltip>
                
                <Tooltip v-if="count.status === 'scheduled'">
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      @click="$emit('start-count', count)"
                    >
                      <PlayIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start Count</TooltipContent>
                </Tooltip>
                
                <Tooltip v-if="count.status === 'in_progress'">
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      @click="$emit('continue-count', count)"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue Count</TooltipContent>
                </Tooltip>
                
                <Tooltip v-if="count.status === 'pending_approval'">
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      @click="$emit('review-variances', count)"
                    >
                      <CheckCircleIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Review Variances</TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVerticalIcon class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="$emit('view-count', count)">
                      <EyeIcon class="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="count.status === 'scheduled'"
                      @click="$emit('start-count', count)"
                    >
                      <PlayIcon class="h-4 w-4 mr-2" />
                      Start Count
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="count.status === 'in_progress'"
                      @click="$emit('continue-count', count)"
                    >
                      <PencilIcon class="h-4 w-4 mr-2" />
                      Continue Count
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="count.status === 'pending_approval'"
                      @click="$emit('review-variances', count)"
                    >
                      <CheckCircleIcon class="h-4 w-4 mr-2" />
                      Review Variances
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      v-if="count.status === 'pending_approval'"
                      @click="$emit('approve-count', count)"
                    >
                      <CheckIcon class="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem @click="$emit('print-count', count)">
                      <PrinterIcon class="h-4 w-4 mr-2" />
                      Print Count Sheet
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      v-if="['scheduled', 'in_progress'].includes(count.status)"
                      @click="$emit('cancel-count', count)"
                      class="text-destructive focus:text-destructive"
                    >
                      <BanIcon class="h-4 w-4 mr-2" />
                      Cancel Count
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import {
  BanIcon,
  CheckIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  EyeIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PencilIcon,
  PlayIcon,
  PrinterIcon,
  RefreshCwIcon
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

const props = defineProps({
  cycleCounts: { type: Array, required: true },
  locations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'view-count',
  'start-count',
  'continue-count',
  'review-variances',
  'approve-count',
  'cancel-count',
  'print-count',
  'refresh'
])

function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatStatus(status) {
  if (!status) return '—'
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusVariant(status) {
  switch (status) {
    case 'scheduled': return 'outline'
    case 'in_progress': return 'secondary'
    case 'pending_approval': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function formatRecurrence(pattern) {
  switch (pattern) {
    case 'daily': return 'Daily'
    case 'weekly': return 'Weekly'
    case 'biweekly': return 'Bi-weekly'
    case 'monthly': return 'Monthly'
    case 'quarterly': return 'Quarterly'
    case 'yearly': return 'Yearly'
    default: return pattern || 'Custom'
  }
}
</script>