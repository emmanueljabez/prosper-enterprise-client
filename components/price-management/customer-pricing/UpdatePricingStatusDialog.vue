<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Update Price Rule Status</DialogTitle>
      <DialogDescription>
        Change the status of the price rule for {{ pricingRule.customerName }}
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Current Status -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium">Current Status</h3>
          <p class="text-sm text-muted-foreground">
            The price rule is currently <span class="font-medium">{{ pricingRule.status }}</span>
          </p>
        </div>
        <Badge :variant="getStatusBadgeVariant(pricingRule.status)">
          {{ pricingRule.status }}
        </Badge>
      </div>

      <!-- Status Selection -->
      <div class="space-y-4">
        <Label class="text-base">New Status</Label>
        <RadioGroup v-model="selectedStatus" class="space-y-2">
          <div class="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="active" id="status-active" />
            <Label for="status-active" class="font-normal cursor-pointer">
              <div class="flex items-center">
                <Badge variant="success" class="mr-2">Active</Badge>
                <span>Price rule is applied to customer</span>
              </div>
            </Label>
          </div>
          <div class="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="inactive" id="status-inactive" />
            <Label for="status-inactive" class="font-normal cursor-pointer">
              <div class="flex items-center">
                <Badge variant="secondary" class="mr-2">Inactive</Badge>
                <span>Price rule is not applied to customer</span>
              </div>
            </Label>
          </div>
          <div class="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="scheduled" id="status-scheduled" />
            <Label for="status-scheduled" class="font-normal cursor-pointer">
              <div class="flex items-center">
                <Badge variant="warning" class="mr-2">Scheduled</Badge>
                <span>Will become active based on start/end dates</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <!-- Reason for change -->
      <div>
        <Label for="reason">Reason for Change (Optional)</Label>
        <Textarea
          id="reason"
          v-model="reason"
          placeholder="Enter a reason for this status change"
          rows="3"
        />
        <p class="text-xs text-muted-foreground mt-1">
          This information will be logged for audit purposes.
        </p>
      </div>

      <!-- Activity Impact -->
      <div 
        class="p-3 rounded-md"
        :class="{
          'bg-success/10 border border-success/20': selectedStatus === 'active',
          'bg-secondary/10 border border-secondary/20': selectedStatus === 'inactive',
          'bg-warning/10 border border-warning/20': selectedStatus === 'scheduled'
        }"
      >
        <div class="flex items-start">
          <InfoIcon class="h-5 w-5 mr-2 mt-0.5" :class="{
            'text-success': selectedStatus === 'active',
            'text-secondary': selectedStatus === 'inactive',
            'text-warning': selectedStatus === 'scheduled'
          }" />
          <div>
            <p class="text-sm font-medium">{{ statusChangeMessage }}</p>
            <p class="text-xs mt-1">{{ statusChangeDescription }}</p>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="updateStatus"
        :disabled="!isValid || isSubmitting"
        :class="{ 'opacity-50 cursor-not-allowed': !isValid || isSubmitting }"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <CheckIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Updating...' : 'Update Status' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  CheckIcon,
  InfoIcon,
  Loader2Icon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

const props = defineProps({
  pricingRule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['status-updated', 'close'])

// State
const selectedStatus = ref(props.pricingRule.status || 'active')
const reason = ref('')
const isSubmitting = ref(false)

// Computed
const isValid = computed(() => {
  return selectedStatus.value && selectedStatus.value !== props.pricingRule.status
})

const statusChangeMessage = computed(() => {
  switch (selectedStatus.value) {
    case 'active':
      return 'This price rule will be activated immediately.'
    case 'inactive':
      return 'This price rule will be deactivated.'
    case 'scheduled':
      return 'This price rule will follow the scheduled dates.'
    default:
      return ''
  }
})

const statusChangeDescription = computed(() => {
  switch (selectedStatus.value) {
    case 'active':
      return 'The customer will be charged according to this pricing rule regardless of the start/end dates.'
    case 'inactive':
      return 'The customer will be charged regular prices, and this price rule will not be applied.'
    case 'scheduled':
      return 'The price rule will only be active between the specified start and end dates. Outside of that period, regular pricing applies.'
    default:
      return ''
  }
})

// Helpers
const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    default:
      return 'outline'
  }
}

// Methods
const updateStatus = async () => {
  if (!isValid.value) return
  
  isSubmitting.value = true
  
  try {
    // In a real app, this would make an API call

    // Emit event with pricing rule, new status, and reason
    emit('status-updated', { 
      pricingRule: props.pricingRule,
      status: selectedStatus.value,
      reason: reason.value || null
    })
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>