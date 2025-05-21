<template>
  <div class="w-full">
    <table class="w-full">
      <thead>
      <tr class="border-b">
        <th class="text-left p-4 font-medium text-sm">ID</th>
        <th class="text-left p-4 font-medium text-sm">Customer</th>
        <th class="text-left p-4 font-medium text-sm">Issue</th>
        <th class="text-left p-4 font-medium text-sm">Status</th>
        <th class="text-left p-4 font-medium text-sm">Priority</th>
        <th class="text-left p-4 font-medium text-sm">Created</th>
        <th class="text-left p-4 font-medium text-sm">Assigned</th>
        <th class="text-right p-4 font-medium text-sm">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="ticket in tickets" :key="ticket.id"
          class="border-b hover:bg-muted/50 transition-colors">
        <td class="p-4 text-sm">{{ ticket.id }}</td>
        <td class="p-4 text-sm">
          <div>{{ ticket.customer.name }}</div>
          <div class="text-xs text-muted-foreground">ID: {{ ticket.customer.id }}</div>
        </td>
        <td class="p-4 text-sm">
          <div class="font-medium">{{ ticket.title }}</div>
          <div class="flex gap-1 mt-1">
            <Badge variant="outline" class="text-xs">{{ ticket.type }}</Badge>
            <Badge v-if="ticket.slaStatus === 'at_risk'" variant="destructive" class="text-xs">SLA at risk</Badge>
          </div>
        </td>
        <td class="p-4 text-sm">
          <Badge :class="{
              'bg-green-100 text-green-800': ticket.status === 'resolved' || ticket.status === 'closed',
              'bg-amber-100 text-amber-800': ticket.status === 'in_progress',
              'bg-red-100 text-red-800': ticket.status === 'escalated',
              'bg-blue-100 text-blue-800': ticket.status === 'open',
              'bg-purple-100 text-purple-800': ticket.status === 'pending_customer',
            }">
            {{ formatStatus(ticket.status) }}
          </Badge>
        </td>
        <td class="p-4 text-sm">
          <Badge :class="{
              'bg-red-100 text-red-800': ticket.priority === 'urgent',
              'bg-amber-100 text-amber-800': ticket.priority === 'high',
              'bg-blue-100 text-blue-800': ticket.priority === 'medium',
              'bg-green-100 text-green-800': ticket.priority === 'low',
            }">
            {{ ticket.priority }}
          </Badge>
        </td>
        <td class="p-4 text-sm">
          <div>{{ formatDate(ticket.createdAt) }}</div>
          <div class="text-xs text-muted-foreground">
            {{ formatTimeAgo(ticket.createdAt) }}
          </div>
        </td>
        <td class="p-4 text-sm">
          <div v-if="ticket.assignedTo">{{ ticket.assignedTo }}</div>
          <div v-else class="text-muted-foreground text-xs">Unassigned</div>
        </td>
        <td class="p-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="$emit('view', ticket)">
                <EyeIcon class="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem v-if="!ticket.assignedTo" @click="$emit('assign', ticket)">
                <UserCheckIcon class="h-4 w-4 mr-2" />
                Assign
              </DropdownMenuItem>
              <DropdownMenuItem v-if="ticket.status !== 'escalated'" @click="$emit('escalate', ticket)">
                <ArrowUpRightIcon class="h-4 w-4 mr-2" />
                Escalate
              </DropdownMenuItem>
              <DropdownMenuItem v-if="ticket.status !== 'resolved'" @click="$emit('resolve', ticket)">
                <CheckIcon class="h-4 w-4 mr-2" />
                Resolve
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="$emit('schedule-visit', ticket)">
                <CalendarIcon class="h-4 w-4 mr-2" />
                Schedule Visit
              </DropdownMenuItem>
              <DropdownMenuItem @click="$emit('customer-callback', ticket)">
                <PhoneIcon class="h-4 w-4 mr-2" />
                Call Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontalIcon,
  EyeIcon,
  UserCheckIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CalendarIcon,
  PhoneIcon
} from 'lucide-vue-next'
import { format, formatDistance } from 'date-fns'

const props = defineProps({
  tickets: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['view', 'assign', 'escalate', 'resolve', 'schedule-visit', 'customer-callback'])

function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatTimeAgo(dateString) {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
}

function formatStatus(status) {
  const statusMap = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'pending_customer': 'Pending Customer',
    'escalated': 'Escalated',
    'resolved': 'Resolved',
    'closed': 'Closed'
  }
  return statusMap[status] || status
}
</script>