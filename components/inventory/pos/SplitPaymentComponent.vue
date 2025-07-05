<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Split Payment</h3>
      <Badge variant="outline">
        {{ activeSplits.length }} {{ activeSplits.length === 1 ? 'Split' : 'Splits' }}
      </Badge>
    </div>

    <!-- Payment Summary -->
    <Card class="p-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold">${{ totalAmount.toFixed(2) }}</div>
          <div class="text-sm text-muted-foreground">Total Amount</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">${{ paidAmount.toFixed(2) }}</div>
          <div class="text-sm text-muted-foreground">Paid</div>
        </div>
        <div>
          <div class="text-2xl font-bold" :class="remainingAmount > 0 ? 'text-red-600' : 'text-green-600'">
            ${{ Math.abs(remainingAmount).toFixed(2) }}
          </div>
          <div class="text-sm text-muted-foreground">
            {{ remainingAmount > 0 ? 'Remaining' : 'Complete' }}
          </div>
        </div>
      </div>
    </Card>

    <!-- Active Splits -->
    <div class="space-y-3">
      <h4 class="font-medium">Payment Splits</h4>
      <div class="space-y-3">
        <div
          v-for="(split, index) in activeSplits"
          :key="index"
          class="border rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Badge variant="secondary">Split {{ index + 1 }}</Badge>
              <component :is="getPaymentIcon(split.method)" class="h-4 w-4" />
              <span class="font-medium">{{ formatPaymentMethod(split.method) }}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="removeSplit(index)"
              :disabled="split.status === 'processing' || split.status === 'completed'"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold">${{ split.amount.toFixed(2) }}</span>
                <Badge
                  :variant="getStatusVariant(split.status)"
                  class="ml-auto"
                >
                  {{ split.status }}
                </Badge>
              </div>
            </div>
            <div v-if="split.method === 'card' && split.cardDetails">
              <Label>Card</Label>
              <div class="text-sm">
                •••• •••• •••• {{ split.cardDetails.lastFour }}
              </div>
            </div>
            <div v-if="split.method === 'mpesa' && split.phone">
              <Label>Phone</Label>
              <div class="text-sm">{{ split.phone }}</div>
            </div>
            <div v-if="split.tip">
              <Label>Tip</Label>
              <div class="text-sm">${{ split.tip.toFixed(2) }}</div>
            </div>
          </div>

          <!-- Split Actions -->
          <div class="flex gap-2 mt-3">
            <Button
              v-if="split.status === 'pending'"
              size="sm"
              @click="processSplit(index)"
            >
              <CreditCard class="mr-2 h-3 w-3" />
              Process Payment
            </Button>
            <Button
              v-if="split.status === 'failed'"
              size="sm"
              variant="outline"
              @click="retrySplit(index)"
            >
              <RotateCcw class="mr-2 h-3 w-3" />
              Retry
            </Button>
            <Button
              v-if="split.status === 'completed'"
              size="sm"
              variant="outline"
              @click="printSplitReceipt(index)"
            >
              <Printer class="mr-2 h-3 w-3" />
              Receipt
            </Button>
          </div>

          <!-- Transaction Details -->
          <div v-if="split.transactionId" class="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div class="flex justify-between">
              <span>Transaction ID:</span>
              <span class="font-mono">{{ split.transactionId }}</span>
            </div>
            <div v-if="split.approvalCode" class="flex justify-between">
              <span>Approval Code:</span>
              <span class="font-mono">{{ split.approvalCode }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Split -->
    <Card class="p-4">
      <h4 class="font-medium mb-3">Add Payment Split</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Method</Label>
          <Select v-model="newSplit.method">
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="mpesa">M-Pesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount</Label>
          <Input
            v-model.number="newSplit.amount"
            type="number"
            step="0.01"
            min="0.01"
            :max="remainingAmount"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Method-specific fields -->
      <div v-if="newSplit.method === 'mpesa'" class="mt-3">
        <Label>Phone Number</Label>
        <Input
          v-model="newSplit.phone"
          placeholder="254XXXXXXXXX"
          type="tel"
        />
      </div>

      <!-- Tip for this split -->
      <div class="mt-3">
        <Label>Tip (Optional)</Label>
        <Input
          v-model.number="newSplit.tip"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <Button
        class="w-full mt-4"
        @click="addSplit"
        :disabled="!canAddSplit"
      >
        <Plus class="mr-2 h-4 w-4" />
        Add Split Payment
      </Button>
    </Card>

    <!-- Quick Split Options -->
    <div class="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        @click="splitEvenly"
        :disabled="remainingAmount <= 0"
      >
        <Users class="mr-2 h-4 w-4" />
        Split Evenly
      </Button>
      <Button
        variant="outline"
        @click="payRemainingCash"
        :disabled="remainingAmount <= 0"
      >
        <DollarSign class="mr-2 h-4 w-4" />
        Remaining as Cash
      </Button>
    </div>

    <!-- Complete Payment -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button
        variant="outline"
        @click="cancel"
      >
        Cancel
      </Button>
      <Button
        @click="completeAllPayments"
        :disabled="remainingAmount > 0 || activeSplits.some(s => s.status === 'pending')"
      >
        <Check class="mr-2 h-4 w-4" />
        Complete All Payments
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Plus,
  X,
  Check,
  RotateCcw,
  Printer,
  Users
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  totalAmount: {
    type: Number,
    required: true
  },
  initialSplits: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['payment-complete', 'cancel'])

// State
const activeSplits = ref([...props.initialSplits])
const newSplit = ref({
  method: '',
  amount: 0,
  phone: '',
  tip: 0
})

// Computed
const paidAmount = computed(() => {
  return activeSplits.value
    .filter(split => split.status === 'completed')
    .reduce((sum, split) => sum + split.amount + (split.tip || 0), 0)
})

const remainingAmount = computed(() => {
  return props.totalAmount - paidAmount.value
})

const canAddSplit = computed(() => {
  return newSplit.value.method && 
         newSplit.value.amount > 0 && 
         newSplit.value.amount <= remainingAmount.value &&
         (newSplit.value.method !== 'mpesa' || newSplit.value.phone)
})

// Methods
const getPaymentIcon = (method) => {
  switch (method) {
    case 'card': return CreditCard
    case 'mpesa': return Smartphone
    case 'cash': return DollarSign
    default: return CreditCard
  }
}

const formatPaymentMethod = (method) => {
  switch (method) {
    case 'card': return 'Credit/Debit Card'
    case 'mpesa': return 'M-Pesa'
    case 'cash': return 'Cash'
    default: return method
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'completed': return 'default'
    case 'processing': return 'secondary'
    case 'failed': return 'destructive'
    default: return 'outline'
  }
}

const addSplit = () => {
  if (!canAddSplit.value) return

  const split = {
    id: Date.now(),
    method: newSplit.value.method,
    amount: newSplit.value.amount,
    tip: newSplit.value.tip || 0,
    phone: newSplit.value.phone,
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  activeSplits.value.push(split)

  // Reset form
  newSplit.value = {
    method: '',
    amount: 0,
    phone: '',
    tip: 0
  }

  toast({
    title: 'Split added',
    description: `${formatPaymentMethod(split.method)} payment of $${split.amount.toFixed(2)} added`
  })
}

const removeSplit = (index) => {
  const split = activeSplits.value[index]
  if (split.status === 'processing' || split.status === 'completed') {
    toast({
      title: 'Cannot remove',
      description: 'Cannot remove processed or completed payments',
      variant: 'destructive'
    })
    return
  }

  activeSplits.value.splice(index, 1)
  toast({
    title: 'Split removed',
    description: 'Payment split has been removed'
  })
}

const processSplit = async (index) => {
  const split = activeSplits.value[index]
  split.status = 'processing'

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      split.status = 'completed'
      split.transactionId = `TXN${Date.now()}`
      split.approvalCode = `APP${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      split.completedAt = new Date().toISOString()

      toast({
        title: 'Payment successful',
        description: `${formatPaymentMethod(split.method)} payment processed successfully`
      })
    } else {
      split.status = 'failed'
      split.error = 'Payment was declined'

      toast({
        title: 'Payment failed',
        description: 'Payment was declined. Please try again or use a different method.',
        variant: 'destructive'
      })
    }
  } catch (error) {
    split.status = 'failed'
    split.error = error.message

    toast({
      title: 'Payment error',
      description: 'An error occurred while processing the payment',
      variant: 'destructive'
    })
  }
}

const retrySplit = (index) => {
  const split = activeSplits.value[index]
  split.status = 'pending'
  delete split.error
  processSplit(index)
}

const printSplitReceipt = (index) => {
  const split = activeSplits.value[index]
  toast({
    title: 'Printing receipt',
    description: `Receipt for ${formatPaymentMethod(split.method)} payment`
  })
}

const splitEvenly = () => {
  if (remainingAmount.value <= 0) return

  const amount = remainingAmount.value / 2
  
  // Add two equal splits
  addEqualSplit('card', amount)
  addEqualSplit('cash', amount)
}

const addEqualSplit = (method, amount) => {
  activeSplits.value.push({
    id: Date.now() + Math.random(),
    method,
    amount,
    tip: 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  })
}

const payRemainingCash = () => {
  if (remainingAmount.value <= 0) return

  activeSplits.value.push({
    id: Date.now(),
    method: 'cash',
    amount: remainingAmount.value,
    tip: 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  })

  toast({
    title: 'Cash payment added',
    description: `$${remainingAmount.value.toFixed(2)} cash payment added`
  })
}

const completeAllPayments = () => {
  const completedSplits = activeSplits.value.filter(split => split.status === 'completed')
  
  emit('payment-complete', {
    splits: completedSplits,
    totalAmount: props.totalAmount,
    totalPaid: paidAmount.value,
    timestamp: new Date().toISOString()
  })
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
/* Custom styles for split payment component */
</style>
