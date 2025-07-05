<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <CreditCard class="h-5 w-5" />
        Processing Payment
      </DialogTitle>
      <DialogDescription>
        {{ paymentData?.method }} - ${{ paymentData?.amount?.toFixed(2) }}
      </DialogDescription>
    </DialogHeader>

    <!-- Payment Status -->
    <div class="text-center space-y-4">
      <!-- Status Icon -->
      <div class="flex justify-center">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center"
          :class="statusConfig.bgClass"
        >
          <component :is="statusConfig.icon" :class="statusConfig.iconClass" />
        </div>
      </div>

      <!-- Status Message -->
      <div>
        <h3 class="text-lg font-semibold">{{ statusConfig.title }}</h3>
        <p class="text-muted-foreground">{{ statusConfig.message }}</p>
      </div>

      <!-- Progress Indicator -->
      <div v-if="paymentStatus === 'processing'" class="space-y-2">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-sm text-muted-foreground">{{ progressMessage }}</p>
      </div>
    </div>

    <!-- Payment Details -->
    <div class="border rounded-lg p-4 space-y-3">
      <div class="flex justify-between">
        <span>Payment Method</span>
        <div class="flex items-center gap-2">
          <component :is="getPaymentIcon(paymentData?.method)" class="h-4 w-4" />
          <span>{{ formatPaymentMethod(paymentData?.method) }}</span>
        </div>
      </div>
      
      <div class="flex justify-between">
        <span>Amount</span>
        <span class="font-medium">${{ paymentData?.amount?.toFixed(2) }}</span>
      </div>
      
      <div v-if="paymentData?.tip" class="flex justify-between">
        <span>Tip</span>
        <span>${{ paymentData.tip.toFixed(2) }}</span>
      </div>
      
      <div v-if="paymentData?.reference" class="flex justify-between">
        <span>Reference</span>
        <span class="font-mono text-sm">{{ paymentData.reference }}</span>
      </div>
      
      <Separator />
      
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>${{ totalAmount.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Error Details -->
    <div v-if="paymentStatus === 'failed' && errorDetails" class="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
      <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">Error Details</h4>
      <p class="text-sm text-red-600 dark:text-red-300">{{ errorDetails.message }}</p>
      <p v-if="errorDetails.code" class="text-xs text-red-500 dark:text-red-400 mt-1">
        Error Code: {{ errorDetails.code }}
      </p>
    </div>

    <!-- Success Details -->
    <div v-if="paymentStatus === 'success' && successDetails" class="space-y-3">
      <div class="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
        <div class="flex justify-between items-center">
          <span class="font-medium text-green-800 dark:text-green-200">Transaction ID</span>
          <span class="font-mono text-sm text-green-600 dark:text-green-400">
            {{ successDetails.transactionId }}
          </span>
        </div>
        <div v-if="successDetails.approvalCode" class="flex justify-between items-center mt-2">
          <span class="font-medium text-green-800 dark:text-green-200">Approval Code</span>
          <span class="font-mono text-sm text-green-600 dark:text-green-400">
            {{ successDetails.approvalCode }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Reader Instructions -->
    <div v-if="paymentData?.method === 'card' && paymentStatus === 'processing'" class="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
      <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Card Reader Instructions</h4>
      <ul class="text-sm text-blue-600 dark:text-blue-300 space-y-1">
        <li>• Insert chip card or swipe magnetic stripe</li>
        <li>• Follow prompts on the card reader</li>
        <li>• Enter PIN if required</li>
        <li>• Wait for approval confirmation</li>
      </ul>
    </div>

    <!-- M-Pesa Instructions -->
    <div v-if="paymentData?.method === 'mpesa' && paymentStatus === 'processing'" class="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
      <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">M-Pesa Payment</h4>
      <div class="text-sm text-green-600 dark:text-green-300 space-y-1">
        <p>• Check your phone for M-Pesa prompt</p>
        <p>• Enter your M-Pesa PIN</p>
        <p>• Confirm the payment amount</p>
        <p v-if="paymentData?.phone">• Payment sent to: {{ paymentData.phone }}</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button
        v-if="paymentStatus === 'processing'"
        variant="outline"
        @click="cancelPayment"
      >
        Cancel Payment
      </Button>
      
      <Button
        v-if="paymentStatus === 'failed'"
        variant="outline"
        @click="retryPayment"
      >
        <RotateCcw class="mr-2 h-4 w-4" />
        Retry Payment
      </Button>
      
      <Button
        v-if="paymentStatus === 'failed'"
        @click="changePaymentMethod"
      >
        Change Method
      </Button>
      
      <Button
        v-if="paymentStatus === 'success'"
        @click="printReceipt"
      >
        <Printer class="mr-2 h-4 w-4" />
        Print Receipt
      </Button>
      
      <Button
        v-if="paymentStatus === 'success'"
        @click="completePayment"
      >
        <Check class="mr-2 h-4 w-4" />
        Complete
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CreditCard,
  Loader2,
  Check,
  X,
  AlertCircle,
  Smartphone,
  DollarSign,
  RotateCcw,
  Printer
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  paymentData: {
    type: Object,
    required: true
  },
  paymentStatus: {
    type: String,
    default: 'processing' // 'processing', 'success', 'failed'
  }
})

// Emits
const emit = defineEmits(['payment-complete', 'payment-failed', 'retry', 'cancel'])

// State
const progress = ref(0)
const progressMessage = ref('Initializing payment...')
const errorDetails = ref(null)
const successDetails = ref(null)
const simulationInterval = ref(null)

// Computed
const totalAmount = computed(() => {
  return (props.paymentData?.amount || 0) + (props.paymentData?.tip || 0)
})

const statusConfig = computed(() => {
  switch (props.paymentStatus) {
    case 'processing':
      return {
        icon: Loader2,
        iconClass: 'h-10 w-10 text-primary animate-spin',
        bgClass: 'bg-primary/10',
        title: 'Processing Payment',
        message: 'Please wait while we process your payment...'
      }
    case 'success':
      return {
        icon: Check,
        iconClass: 'h-10 w-10 text-green-600',
        bgClass: 'bg-green-100 dark:bg-green-900/20',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully'
      }
    case 'failed':
      return {
        icon: X,
        iconClass: 'h-10 w-10 text-red-600',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        title: 'Payment Failed',
        message: 'There was an error processing your payment'
      }
    default:
      return {
        icon: AlertCircle,
        iconClass: 'h-10 w-10 text-orange-600',
        bgClass: 'bg-orange-100 dark:bg-orange-900/20',
        title: 'Payment Status Unknown',
        message: 'Please check the payment status'
      }
  }
})

// Methods
const getPaymentIcon = (method) => {
  switch (method) {
    case 'card':
      return CreditCard
    case 'mpesa':
      return Smartphone
    case 'cash':
      return DollarSign
    default:
      return CreditCard
  }
}

const formatPaymentMethod = (method) => {
  switch (method) {
    case 'card':
      return 'Credit/Debit Card'
    case 'mpesa':
      return 'M-Pesa Mobile Money'
    case 'cash':
      return 'Cash Payment'
    default:
      return method
  }
}

const simulatePaymentProgress = () => {
  const steps = [
    { progress: 10, message: 'Connecting to payment processor...' },
    { progress: 30, message: 'Verifying payment details...' },
    { progress: 50, message: 'Processing transaction...' },
    { progress: 70, message: 'Awaiting authorization...' },
    { progress: 90, message: 'Finalizing payment...' },
    { progress: 100, message: 'Payment complete!' }
  ]
  
  let stepIndex = 0
  
  simulationInterval.value = setInterval(() => {
    if (stepIndex < steps.length && props.paymentStatus === 'processing') {
      const step = steps[stepIndex]
      progress.value = step.progress
      progressMessage.value = step.message
      stepIndex++
    } else {
      clearInterval(simulationInterval.value)
    }
  }, 1000)
}

const cancelPayment = () => {
  emit('cancel')
  toast({
    title: 'Payment cancelled',
    description: 'Payment process has been cancelled'
  })
}

const retryPayment = () => {
  emit('retry', props.paymentData)
}

const changePaymentMethod = () => {
  emit('payment-failed', { changeMethod: true })
}

const printReceipt = () => {
  // Handle receipt printing
  toast({
    title: 'Printing receipt',
    description: 'Receipt is being printed...'
  })
}

const completePayment = () => {
  emit('payment-complete', {
    ...props.paymentData,
    transactionId: successDetails.value?.transactionId,
    approvalCode: successDetails.value?.approvalCode,
    timestamp: new Date().toISOString()
  })
}

// Lifecycle
onMounted(() => {
  if (props.paymentStatus === 'processing') {
    simulatePaymentProgress()
  }
  
  // Simulate different outcomes based on payment method
  if (props.paymentStatus === 'processing') {
    setTimeout(() => {
      // Simulate success/failure
      const isSuccess = Math.random() > 0.2 // 80% success rate
      
      if (isSuccess) {
        successDetails.value = {
          transactionId: `TXN${Date.now()}`,
          approvalCode: `APP${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        }
        emit('payment-complete', {
          ...props.paymentData,
          ...successDetails.value
        })
      } else {
        errorDetails.value = {
          message: 'Payment was declined by the bank',
          code: 'DECLINED_001'
        }
        emit('payment-failed', errorDetails.value)
      }
    }, 6000) // 6 seconds for demo
  }
})

onUnmounted(() => {
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value)
  }
})
</script>

<style scoped>
/* Custom styles for payment processing dialog */
</style>
