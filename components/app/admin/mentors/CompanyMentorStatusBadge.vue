<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  status?: string | boolean | null
  type?: 'invitation' | 'delivery' | 'membership' | 'bookability' | 'approval' | 'visibility'
}>()

const normalizedStatus = computed(() => {
  if (typeof props.status === 'boolean') {
    return props.status ? 'COMPANY_BOOKABLE' : 'NOT_BOOKABLE'
  }
  return String(props.status || 'UNKNOWN').toUpperCase()
})

const label = computed(() => {
  const labels: Record<string, string> = {
    NOT_ATTEMPTED: 'Not attempted',
    SENT: 'Sent',
    FAILED: 'Failed',
    DELIVERED: 'Delivered',
    DRAFT: 'Draft',
    ACCEPTED: 'Accepted',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
    FAILED_DELIVERY: 'Delivery failed',
    PENDING_INVITE: 'Pending invite',
    ACTIVE: 'Active',
    REMOVED: 'Removed',
    SUSPENDED: 'Suspended',
    COMPANY_BOOKABLE: 'Company-bookable',
    NOT_BOOKABLE: 'Not bookable',
    NOT_REQUESTED: 'Not requested',
    REQUESTED: 'Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPANY_PRIVATE: 'Company private',
    PROGRAM_RESTRICTED: 'Program restricted',
    PUBLIC_REQUESTED: 'Public requested',
    PUBLIC_APPROVED: 'Public approved',
  }

  return labels[normalizedStatus.value] || normalizedStatus.value.replaceAll('_', ' ').toLowerCase()
})

const variant = computed(() => {
  const status = normalizedStatus.value
  if (['FAILED', 'FAILED_DELIVERY', 'REMOVED', 'SUSPENDED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(status)) {
    return 'destructive'
  }
  if (['ACTIVE', 'ACCEPTED', 'APPROVED', 'PUBLIC_APPROVED', 'COMPANY_BOOKABLE', 'DELIVERED'].includes(status)) {
    return 'success'
  }
  if (['REQUESTED', 'PUBLIC_REQUESTED', 'SENT'].includes(status)) {
    return 'info'
  }
  if (['PROGRAM_RESTRICTED', 'PENDING_INVITE'].includes(status)) {
    return 'warning'
  }
  return props.type === 'visibility' ? 'secondary' : 'outline'
})
</script>

<template>
  <Badge :variant="variant">
    {{ label }}
  </Badge>
</template>
