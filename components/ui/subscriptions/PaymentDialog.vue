<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { useAuthStore } from '@/store/modules/auth'
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

// Icons
import { Loader2, CreditCard, Smartphone, AlertCircle, CheckCircle, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  plan: SubscriptionPlan | null
  addonOption?: any | null
  addonQuantity?: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

// Stores
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()

// State
const paymentMethod = ref<'mpesa' | 'card'>('mpesa')
const phoneNumber = ref('')
const isProcessing = ref(false)
const paymentStatus = ref<'idle' | 'pending' | 'polling' | 'completed' | 'failed' | 'timeout'>('idle')
const errorMessage = ref<string | null>(null)
const checkoutRequestId = ref<string | null>(null)
const remainingSeconds = ref(120) // 2 minutes

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isAddonPurchase = computed(() => {
  return props.addonOption && props.addonOption.available && props.addonQuantity && props.addonQuantity > 0
})

const paymentTitle = computed(() => {
  if (isAddonPurchase.value) {
    return 'Purchase Additional Sessions'
  }
  return `Upgrade to ${props.plan?.name}`
})

const paymentDescription = computed(() => {
  if (isAddonPurchase.value) {
    return 'Complete payment to add sessions to your account'
  }
  return 'Complete payment to upgrade your subscription'
})

const totalAmount = computed(() => {
  if (isAddonPurchase.value && props.addonOption) {
    return props.addonOption.costPerSession * (props.addonQuantity || 1)
  }
  return props.plan?.cost || 0
})

const formattedAmount = computed(() => {
  if (isAddonPurchase.value && props.addonOption) {
    return `${props.addonOption.currency} ${totalAmount.value.toFixed(2)}`
  }
  return props.plan?.cost ? `KES ${props.plan.cost}` : 'Free'
})

const canProceed = computed(() => {
  if (paymentMethod.value === 'mpesa') {
    return phoneNumber.value.length >= 10
  }
  return false // Card payment disabled
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1)
  }

  // If doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned
  }

  return cleaned
}

const handlePayment = async () => {
  if (!authStore.loggedInUser?.id) return

  // Validate we have either a plan or addon option
  if (!props.plan && !isAddonPurchase.value) return

  errorMessage.value = null
  isProcessing.value = true
  paymentStatus.value = 'pending'

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber.value)

    let result

    if (isAddonPurchase.value) {
      // Addon session purchase
      console.log('🛒 Addon Purchase:', {
        userId: authStore.loggedInUser.id,
        quantity: props.addonQuantity,
        costPerSession: props.addonOption?.costPerSession,
        totalAmount: totalAmount.value,
        phoneNumber: formattedPhone
      })

      result = await subscriptionsStore.purchaseAddonSessions({
        userId: authStore.loggedInUser.id,
        quantity: props.addonQuantity!,
        phoneNumber: formattedPhone
      })
    } else {
      // Standard subscription upgrade
      result = await subscriptionsStore.upgradeSubscription({
        userId: authStore.loggedInUser.id,
        newPlanId: props.plan!.id,
        phoneNumber: formattedPhone
      })
    }

    if (result && result.payment) {
      checkoutRequestId.value = result.payment.checkoutRequestId
      paymentStatus.value = 'polling'
      remainingSeconds.value = 120 // Reset countdown

      // Start countdown timer (updates every second)
      const countdownInterval = setInterval(() => {
        if (remainingSeconds.value > 0) {
          remainingSeconds.value--
        } else {
          clearInterval(countdownInterval)
        }
      }, 1000)

      // Start polling for payment status
      const status = await subscriptionsStore.pollPaymentStatus(
        result.payment.checkoutRequestId,
        24,
        5000
      )

      // Clear countdown interval when polling completes
      clearInterval(countdownInterval)

      if (status === 'COMPLETED') {
        paymentStatus.value = 'completed'
        setTimeout(() => {
          emit('success')
          resetDialog()
        }, 2000)
      } else if (status === 'TIMEOUT') {
        paymentStatus.value = 'timeout'
        errorMessage.value = 'Payment verification timed out. Please check your phone and try again if payment was not completed.'
      }
    } else {
      paymentStatus.value = 'failed'
      errorMessage.value = subscriptionsStore.error || 'Failed to initiate payment'
    }
  } catch (error: any) {
    paymentStatus.value = 'failed'
    errorMessage.value = error.message || 'An error occurred while processing payment'
  } finally {
    isProcessing.value = false
  }
}

const handleRetry = () => {
  paymentStatus.value = 'idle'
  errorMessage.value = null
  checkoutRequestId.value = null
  remainingSeconds.value = 120
}

const resetDialog = () => {
  isOpen.value = false
  setTimeout(() => {
    paymentMethod.value = 'mpesa'
    phoneNumber.value = ''
    paymentStatus.value = 'idle'
    errorMessage.value = null
    checkoutRequestId.value = null
    isProcessing.value = false
    remainingSeconds.value = 120
  }, 300)
}

// Watch for dialog close
watch(isOpen, (newValue) => {
  if (!newValue && paymentStatus.value !== 'polling') {
    resetDialog()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ paymentTitle }}</DialogTitle>
        <DialogDescription>
          {{ paymentDescription }}
        </DialogDescription>
      </DialogHeader>

      <!-- Payment Status Views -->
      <div v-if="paymentStatus === 'polling'" class="py-8 flex flex-col items-center justify-center space-y-4">
        <Loader2 class="h-12 w-12 animate-spin" style="color: #9b3699;" />
        <div class="text-center space-y-3">
          <p class="font-semibold">Processing Payment</p>
          <p class="text-sm text-muted-foreground">Please complete the payment on your phone</p>

          <!-- Countdown Timer -->
          <div class="flex flex-col items-center gap-2 mt-4">
            <div class="text-3xl font-bold tabular-nums" style="color: #9b3699;">
              {{ formattedTime }}
            </div>
            <p class="text-xs text-muted-foreground">Time remaining</p>
          </div>
        </div>
      </div>

      <div v-else-if="paymentStatus === 'completed'" class="py-8 flex flex-col items-center justify-center space-y-4">
        <CheckCircle class="h-12 w-12 text-green-600" />
        <div class="text-center">
          <p class="font-semibold text-green-600">Payment Successful!</p>
          <p class="text-sm text-muted-foreground">Your subscription has been upgraded</p>
        </div>
      </div>

      <div v-else-if="paymentStatus === 'failed' || paymentStatus === 'timeout'" class="py-8 flex flex-col items-center justify-center space-y-4">
        <XCircle class="h-12 w-12 text-red-600" />
        <div class="text-center space-y-2">
          <p class="font-semibold text-red-600">Payment {{ paymentStatus === 'timeout' ? 'Timeout' : 'Failed' }}</p>
          <p class="text-sm text-muted-foreground">{{ errorMessage }}</p>
        </div>
        <Button @click="handleRetry" style="background-color: #9b3699;">
          Try Again
        </Button>
      </div>

      <!-- Payment Form -->
      <div v-else class="space-y-6">
        <!-- Pricing Info -->
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <!-- Addon Purchase Info -->
          <div v-if="isAddonPurchase" class="space-y-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Price per session</span>
              <span class="font-medium">{{ addonOption?.formattedPrice }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Quantity</span>
              <span class="font-medium">{{ addonQuantity }} session{{ addonQuantity > 1 ? 's' : '' }}</span>
            </div>
            <div class="h-px bg-purple-200"></div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Total Cost</span>
              <span class="text-lg font-bold" style="color: #9b3699;">
                {{ formattedAmount }}
              </span>
            </div>
          </div>

          <!-- Subscription Upgrade Info -->
          <div v-else>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Plan Cost</span>
              <span class="text-lg font-bold" style="color: #9b3699;">
                {{ formattedAmount }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              Prorated amount will be calculated based on your current plan
            </p>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup v-model="paymentMethod" class="space-y-2">
            <div class="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                 :class="paymentMethod === 'mpesa' ? 'border-[#9b3699] bg-purple-50' : 'border-gray-200'">
              <RadioGroupItem value="mpesa" id="mpesa" />
              <Label for="mpesa" class="flex items-center gap-2 cursor-pointer flex-1">
                <Smartphone class="h-5 w-5" style="color: #9b3699;" />
                <div>
                  <p class="font-medium">M-Pesa</p>
                  <p class="text-xs text-muted-foreground">Pay with M-Pesa mobile money</p>
                </div>
              </Label>
            </div>

            <div class="flex items-center space-x-2 p-3 border rounded-lg opacity-50 cursor-not-allowed"
                 :class="paymentMethod === 'card' ? 'border-[#9b3699] bg-purple-50' : 'border-gray-200'">
              <RadioGroupItem value="card" id="card" disabled />
              <Label for="card" class="flex items-center gap-2 cursor-not-allowed flex-1">
                <CreditCard class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="font-medium text-gray-500">Card Payment</p>
                  <p class="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <!-- M-Pesa Phone Number -->
        <div v-if="paymentMethod === 'mpesa'" class="space-y-2">
          <Label for="phone">M-Pesa Phone Number</Label>
          <Input
            id="phone"
            v-model="phoneNumber"
            type="tel"
            placeholder="0712345678 or 254712345678"
            :disabled="isProcessing"
          />
          <p class="text-xs text-muted-foreground">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <!-- Error Alert -->
        <Alert v-if="errorMessage && paymentStatus === 'idle'" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            {{ errorMessage }}
          </AlertDescription>
        </Alert>

        <!-- Info Alert -->
        <Alert v-if="paymentStatus === 'pending'">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            You will receive an M-Pesa prompt on your phone. Please enter your PIN to complete the payment.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooter v-if="paymentStatus === 'idle' || paymentStatus === 'pending'">
        <Button variant="outline" @click="resetDialog" :disabled="isProcessing">
          Cancel
        </Button>
        <Button
          @click="handlePayment"
          :disabled="!canProceed || isProcessing"
          style="background-color: #9b3699;"
        >
          <Loader2 v-if="isProcessing" class="mr-2 h-4 w-4 animate-spin" />
          {{ isProcessing ? 'Processing...' : 'Proceed to Payment' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
