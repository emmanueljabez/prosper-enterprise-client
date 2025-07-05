<template>
  <div class="space-y-6">
    <!-- Payment Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Payment Processing</h2>
        <div class="flex items-center space-x-2">
          <Badge v-if="currentOrder" variant="outline">
            {{ currentOrder.items.length }} Items
          </Badge>
          <Badge v-if="currentOrder" variant="secondary" class="font-medium">
            KSh {{ formatCurrency(currentOrder.total) }}
          </Badge>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Order Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div class="p-4 border-b">
          <h3 class="font-medium">Order Summary</h3>
        </div>
        
        <div class="p-4">
          <div v-if="!currentOrder" class="text-center py-8">
            <ShoppingCart class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-300">No active order</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Order Items -->
            <div class="space-y-2">
              <div
                v-for="item in currentOrder.items"
                :key="item.id"
                class="flex justify-between items-start py-2 border-b last:border-b-0"
              >
                <div class="flex-1">
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    {{ item.quantity }} × KSh {{ formatCurrency(item.price) }}
                  </div>
                  <div v-if="item.modifiers?.length > 0" class="text-xs text-gray-500">
                    {{ item.modifiers.map(m => m.name).join(', ') }}
                  </div>
                </div>
                <div class="font-medium">
                  KSh {{ formatCurrency(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <!-- Order Totals -->
            <div class="space-y-2 pt-4 border-t">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span>KSh {{ formatCurrency(currentOrder.subtotal) }}</span>
              </div>
              <div v-if="appliedDiscount > 0" class="flex justify-between text-green-600">
                <span>Discount ({{ discountPercentage }}%):</span>
                <span>-KSh {{ formatCurrency(appliedDiscount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax (16%):</span>
                <span>KSh {{ formatCurrency(currentOrder.tax) }}</span>
              </div>
              <div v-if="serviceCharge > 0" class="flex justify-between">
                <span>Service Charge:</span>
                <span>KSh {{ formatCurrency(serviceCharge) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>KSh {{ formatCurrency(finalTotal) }}</span>
              </div>
            </div>

            <!-- Discount Controls -->
            <div class="pt-4 border-t">
              <div class="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="showDiscountDialog = true"
                >
                  <Percent class="h-4 w-4 mr-2" />
                  Apply Discount
                </Button>
                <Button
                  v-if="appliedDiscount > 0"
                  variant="ghost"
                  size="sm"
                  @click="removeDiscount"
                >
                  <X class="h-4 w-4 mr-2" />
                  Remove Discount
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div class="p-4 border-b">
          <h3 class="font-medium">Payment Method</h3>
        </div>
        
        <div class="p-4 space-y-4">
          <!-- Payment Method Selection -->
          <div class="grid grid-cols-2 gap-3">
            <Button
              v-for="method in paymentMethods"
              :key="method.id"
              variant="outline"
              class="h-20 flex flex-col items-center justify-center space-y-2"
              :class="selectedPaymentMethod?.id === method.id ? 'ring-2 ring-primary bg-primary/5' : ''"
              @click="selectPaymentMethod(method)"
            >
              <component :is="method.icon" class="h-6 w-6" />
              <span class="text-sm font-medium">{{ method.name }}</span>
            </Button>
          </div>

          <!-- Selected Payment Method Details -->
          <div v-if="selectedPaymentMethod" class="space-y-4">
            <!-- Cash Payment -->
            <div v-if="selectedPaymentMethod.id === 'cash'" class="space-y-3">
              <div>
                <Label>Amount Received</Label>
                <Input
                  v-model="cashReceived"
                  type="number"
                  step="0.01"
                  placeholder="Enter cash amount"
                  class="text-right"
                  @input="calculateChange"
                />
              </div>
              
              <div v-if="cashReceived && parseFloat(cashReceived) >= finalTotal" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-green-800 dark:text-green-200">Change:</span>
                  <span class="text-lg font-semibold text-green-800 dark:text-green-200">
                    KSh {{ formatCurrency(changeAmount) }}
                  </span>
                </div>
              </div>
              
              <div v-else-if="cashReceived && parseFloat(cashReceived) < finalTotal" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-red-800 dark:text-red-200">Short:</span>
                  <span class="text-lg font-semibold text-red-800 dark:text-red-200">
                    KSh {{ formatCurrency(finalTotal - parseFloat(cashReceived)) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Payment -->
            <div v-if="selectedPaymentMethod.id === 'card'" class="space-y-3">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="flex items-center space-x-2">
                  <CreditCard class="h-5 w-5 text-blue-600" />
                  <span class="font-medium text-blue-800 dark:text-blue-200">
                    Insert or tap card to pay KSh {{ formatCurrency(finalTotal) }}
                  </span>
                </div>
              </div>
              
              <div v-if="cardProcessing" class="flex items-center justify-center space-x-2 py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Processing payment...</span>
              </div>
            </div>

            <!-- M-Pesa Payment -->
            <div v-if="selectedPaymentMethod.id === 'mpesa'" class="space-y-3">
              <div>
                <Label>Customer Phone Number</Label>
                <Input
                  v-model="mpesaPhone"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  class="text-left"
                />
              </div>
              
              <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="flex items-center space-x-2">
                  <Smartphone class="h-5 w-5 text-green-600" />
                  <span class="font-medium text-green-800 dark:text-green-200">
                    Send STK push for KSh {{ formatCurrency(finalTotal) }}
                  </span>
                </div>
              </div>
              
              <div v-if="mpesaProcessing" class="space-y-2">
                <div class="flex items-center justify-center space-x-2 py-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  <span class="text-sm">Waiting for customer confirmation...</span>
                </div>
                <div class="text-center">
                  <Button variant="outline" size="sm" @click="cancelMpesaPayment">
                    Cancel Payment
                  </Button>
                </div>
              </div>
            </div>

            <!-- Split Payment -->
            <div v-if="selectedPaymentMethod.id === 'split'" class="space-y-3">
              <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span class="font-medium text-purple-800 dark:text-purple-200">
                  Split payment between multiple methods
                </span>
              </div>
              
              <Button
                variant="outline"
                class="w-full"
                @click="openSplitPaymentModal"
              >
                <Calculator class="h-4 w-4 mr-2" />
                Configure Split Payment
              </Button>
            </div>
          </div>

          <!-- Tip Selection -->
          <div v-if="selectedPaymentMethod && selectedPaymentMethod.id !== 'split'" class="space-y-3">
            <Label>Add Tip (Optional)</Label>
            <div class="grid grid-cols-4 gap-2">
              <Button
                v-for="tipOption in tipOptions"
                :key="tipOption.value"
                variant="outline"
                size="sm"
                :class="selectedTip === tipOption.value ? 'bg-primary text-primary-foreground' : ''"
                @click="selectTip(tipOption.value)"
              >
                {{ tipOption.label }}
              </Button>
            </div>
            <div v-if="selectedTip === 'custom'">
              <Input
                v-model="customTipAmount"
                type="number"
                step="0.01"
                placeholder="Enter custom tip amount"
                class="text-right"
              />
            </div>
            <div v-if="tipAmount > 0" class="text-sm text-gray-600">
              Tip: KSh {{ formatCurrency(tipAmount) }}
            </div>
          </div>

          <!-- Process Payment Button -->
          <div class="pt-4">
            <Button
              class="w-full"
              size="lg"
              :disabled="!canProcessPayment"
              @click="processPayment"
            >
              <component :is="getPaymentIcon()" class="h-5 w-5 mr-2" />
              {{ getPaymentButtonText() }}
            </Button>
          </div>

          <!-- Additional Actions -->
          <div class="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" @click="printReceipt" :disabled="!currentOrder">
              <Printer class="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" size="sm" @click="emailReceipt" :disabled="!currentOrder">
              <Mail class="h-4 w-4 mr-2" />
              Email Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Discount Dialog -->
    <Dialog v-model:open="showDiscountDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <Label>Discount Type</Label>
            <Select v-model="discountType">
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {{ discountType === 'percentage' ? 'Percentage (%)' : 'Amount (KSh)' }}
            </Label>
            <Input
              v-model="discountValue"
              type="number"
              :step="discountType === 'percentage' ? '1' : '0.01'"
              :max="discountType === 'percentage' ? '100' : undefined"
              placeholder="Enter discount value"
            />
          </div>

          <div>
            <Label>Reason (Required for approval)</Label>
            <Textarea
              v-model="discountReason"
              placeholder="Enter reason for discount..."
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showDiscountDialog = false">
            Cancel
          </Button>
          <Button @click="applyDiscount" :disabled="!discountValue || !discountReason">
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Split Payment Modal -->
    <Dialog v-model:open="showSplitPaymentModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Payment</DialogTitle>
        </DialogHeader>
        
        <SplitPaymentComponent
          :total-amount="finalTotal"
          :payment-methods="paymentMethods"
          @payment-complete="handleSplitPaymentComplete"
          @cancel="showSplitPaymentModal = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  ShoppingCart,
  Percent,
  X,
  CreditCard,
  Smartphone,
  Calculator,
  Printer,
  Mail,
  Banknote,
  Wallet
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

// Import custom component
import SplitPaymentComponent from './SplitPaymentComponent.vue'

// Props
const props = defineProps({
  currentOrder: {
    type: Object,
    default: null
  },
  paymentMethods: {
    type: Array,
    default: () => [
      { id: 'cash', name: 'Cash', icon: Banknote },
      { id: 'card', name: 'Card', icon: CreditCard },
      { id: 'mpesa', name: 'M-Pesa', icon: Smartphone },
      { id: 'split', name: 'Split Payment', icon: Calculator }
    ]
  }
})

// Emits
const emit = defineEmits([
  'process-payment',
  'split-payment',
  'calculate-change'
])

// Local state
const selectedPaymentMethod = ref(null)
const cashReceived = ref('')
const mpesaPhone = ref('')
const cardProcessing = ref(false)
const mpesaProcessing = ref(false)
const showDiscountDialog = ref(false)
const showSplitPaymentModal = ref(false)

// Discount state
const appliedDiscount = ref(0)
const discountPercentage = ref(0)
const discountType = ref('percentage')
const discountValue = ref('')
const discountReason = ref('')

// Tip state
const selectedTip = ref(null)
const customTipAmount = ref('')
const tipOptions = [
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
  { label: '20%', value: 20 },
  { label: 'Custom', value: 'custom' }
]

// Service charge
const serviceCharge = ref(0)

// Computed properties
const finalTotal = computed(() => {
  if (!props.currentOrder) return 0
  return props.currentOrder.total - appliedDiscount.value + serviceCharge.value + tipAmount.value
})

const changeAmount = computed(() => {
  if (!cashReceived.value) return 0
  return Math.max(0, parseFloat(cashReceived.value) - finalTotal.value)
})

const tipAmount = computed(() => {
  if (!selectedTip.value || !props.currentOrder) return 0
  
  if (selectedTip.value === 'custom') {
    return parseFloat(customTipAmount.value) || 0
  }
  
  return (props.currentOrder.subtotal * selectedTip.value) / 100
})

const canProcessPayment = computed(() => {
  if (!selectedPaymentMethod.value || !props.currentOrder) return false
  
  switch (selectedPaymentMethod.value.id) {
    case 'cash':
      return cashReceived.value && parseFloat(cashReceived.value) >= finalTotal.value
    case 'card':
      return true
    case 'mpesa':
      return mpesaPhone.value && mpesaPhone.value.length >= 10
    case 'split':
      return true
    default:
      return false
  }
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method
  
  // Reset payment-specific data
  cashReceived.value = ''
  mpesaPhone.value = ''
  cardProcessing.value = false
  mpesaProcessing.value = false
}

const calculateChange = () => {
  emit('calculate-change', parseFloat(cashReceived.value), finalTotal.value)
}

const selectTip = (tipValue) => {
  selectedTip.value = tipValue
  if (tipValue !== 'custom') {
    customTipAmount.value = ''
  }
}

const applyDiscount = () => {
  if (!discountValue.value || !discountReason.value) return
  
  const orderSubtotal = props.currentOrder.subtotal
  
  if (discountType.value === 'percentage') {
    const percentage = Math.min(100, Math.max(0, parseFloat(discountValue.value)))
    appliedDiscount.value = (orderSubtotal * percentage) / 100
    discountPercentage.value = percentage
  } else {
    appliedDiscount.value = Math.min(orderSubtotal, Math.max(0, parseFloat(discountValue.value)))
    discountPercentage.value = (appliedDiscount.value / orderSubtotal) * 100
  }
  
  showDiscountDialog.value = false
  
  // Reset form
  discountValue.value = ''
  discountReason.value = ''
}

const removeDiscount = () => {
  appliedDiscount.value = 0
  discountPercentage.value = 0
}

const processPayment = async () => {
  const paymentData = {
    method: selectedPaymentMethod.value.id,
    amount: finalTotal.value,
    orderId: props.currentOrder.id,
    tip: tipAmount.value,
    discount: appliedDiscount.value
  }
  
  switch (selectedPaymentMethod.value.id) {
    case 'cash':
      paymentData.cashReceived = parseFloat(cashReceived.value)
      paymentData.change = changeAmount.value
      break
      
    case 'card':
      cardProcessing.value = true
      // Simulate card processing
      setTimeout(() => {
        cardProcessing.value = false
        emit('process-payment', paymentData)
      }, 3000)
      return
      
    case 'mpesa':
      paymentData.phone = mpesaPhone.value
      mpesaProcessing.value = true
      // Simulate M-Pesa processing
      setTimeout(() => {
        mpesaProcessing.value = false
        emit('process-payment', paymentData)
      }, 5000)
      return
      
    case 'split':
      openSplitPaymentModal()
      return
  }
  
  emit('process-payment', paymentData)
}

const cancelMpesaPayment = () => {
  mpesaProcessing.value = false
}

const openSplitPaymentModal = () => {
  showSplitPaymentModal.value = true
}

const handleSplitPaymentComplete = (splitData) => {
  emit('split-payment', splitData)
  showSplitPaymentModal.value = false
}

const printReceipt = () => {
  // Implementation for printing receipt
  console.log('Printing receipt...')
}

const emailReceipt = () => {
  // Implementation for emailing receipt
  console.log('Emailing receipt...')
}

const getPaymentIcon = () => {
  if (!selectedPaymentMethod.value) return Wallet
  return selectedPaymentMethod.value.icon
}

const getPaymentButtonText = () => {
  if (!selectedPaymentMethod.value) return 'Select Payment Method'
  
  const amount = formatCurrency(finalTotal.value)
  
  switch (selectedPaymentMethod.value.id) {
    case 'cash':
      return `Process Cash Payment - KSh ${amount}`
    case 'card':
      return cardProcessing.value ? 'Processing...' : `Charge Card - KSh ${amount}`
    case 'mpesa':
      return mpesaProcessing.value ? 'Sending STK Push...' : `Send M-Pesa Request - KSh ${amount}`
    case 'split':
      return `Configure Split Payment - KSh ${amount}`
    default:
      return `Process Payment - KSh ${amount}`
  }
}
</script>
