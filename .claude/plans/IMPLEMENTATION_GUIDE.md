# CyberSource Integration - Implementation Guide
## Hybrid Approach (iFrame with Popup Fallback)

This guide provides step-by-step instructions to implement CyberSource Secure Acceptance Hosted Checkout with automatic fallback from iframe to popup window.

---

## ✅ Implementation Checklist

### Backend (Spring Boot)
- [ ] Add CyberSource configuration to `application.properties`
- [ ] Create Flyway migration for database schema
- [ ] Update `Payment` entity with new fields
- [ ] Create `CyberSourceTransaction` entity
- [ ] Create `CyberSourceTransactionRepository`
- [ ] Create `CyberSourceService`
- [ ] Update `PaymentController` with new endpoints
- [ ] Create DTO classes for requests/responses
- [ ] Create Thymeleaf template for callback page

### Frontend (Nuxt/Vue)
- [ ] Create `CyberSourcePayment.vue` component (hybrid iframe/popup)
- [ ] Update `PaymentDialog.vue` to integrate CyberSource
- [ ] Add CyberSource methods to subscriptions store
- [ ] Add CyberSource API client methods
- [ ] Create return/cancel pages

### Testing
- [ ] Get CyberSource test credentials
- [ ] Test iframe mode
- [ ] Test popup fallback
- [ ] Test with test cards (success, decline, review)
- [ ] Test M-Pesa still works
- [ ] Test subscription upgrades
- [ ] Test addon purchases

---

## Step 1: Frontend - Create CyberSource Payment Component

The `CyberSourcePayment.vue` component is already created at:
`/Users/macbookpro/WebstormProjects/myProsperV2/components/ui/subscriptions/CyberSourcePayment.vue`

**Features:**
- ✅ Tries iframe first
- ✅ Automatically detects if iframe is blocked
- ✅ Falls back to popup window if needed
- ✅ Handles messages from both iframe and popup
- ✅ Monitors popup closure
- ✅ Proper cleanup on unmount

---

## Step 2: Frontend - Update PaymentDialog.vue

Replace the entire content with this updated version that integrates CyberSource:

**File**: `components/ui/subscriptions/PaymentDialog.vue`

```vue
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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

// CyberSource Payment Component
import CyberSourcePayment from './CyberSourcePayment.vue'

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
const paymentStatus = ref<'idle' | 'pending' | 'polling' | 'cybersource' | 'completed' | 'failed' | 'timeout'>('idle')
const errorMessage = ref<string | null>(null)
const checkoutRequestId = ref<string | null>(null)
const remainingSeconds = ref(120) // 2 minutes

// CyberSource state
const showCyberSource = ref(false)
const cybersourceUrl = ref('')
const cybersourceParams = ref<Record<string, string>>({})
const cybersourceTransactionId = ref<string | null>(null)

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
  if (paymentMethod.value === 'card') {
    return true // Card payment enabled
  }
  return false
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1)
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned
  }
  return cleaned
}

const handleCardPayment = async () => {
  errorMessage.value = null
  isProcessing.value = true
  paymentStatus.value = 'pending'

  try {
    console.log('💳 Initiating CyberSource payment')

    const paymentType = isAddonPurchase.value ? 'ADDON' :
                       props.plan ? 'SUBSCRIPTION' : 'SESSION'

    const result = await subscriptionsStore.initiateCyberSourcePayment({
      userId: authStore.loggedInUser.id,
      amount: totalAmount.value,
      currency: props.addonOption?.currency || 'KES',
      paymentType: paymentType,
      itemId: isAddonPurchase.value ? null : props.plan?.id,
      planId: props.plan?.id,
      addonQuantity: isAddonPurchase.value ? props.addonQuantity : undefined
    })

    if (result && result.cybersourceParams && result.cybersourceEndpoint) {
      cybersourceUrl.value = result.cybersourceEndpoint
      cybersourceParams.value = result.cybersourceParams
      cybersourceTransactionId.value = result.transactionId
      showCyberSource.value = true
      paymentStatus.value = 'cybersource'

      console.log('✅ CyberSource payment initialized')
    } else {
      console.error('❌ Failed to initialize CyberSource payment:', result)
      errorMessage.value = subscriptionsStore.error || 'Failed to initialize card payment'
      paymentStatus.value = 'failed'
    }
  } catch (error: any) {
    console.error('❌ Card payment error:', error)
    errorMessage.value = error.message || 'An error occurred while initializing payment'
    paymentStatus.value = 'failed'
  } finally {
    isProcessing.value = false
  }
}

const handleMpesaPayment = async () => {
  // Validate we have either a plan or addon option
  if (!props.plan && !isAddonPurchase.value) {
    console.error('❌ Payment validation failed')
    errorMessage.value = 'Invalid payment configuration. Please try again or contact support.'
    return
  }

  errorMessage.value = null
  isProcessing.value = true
  paymentStatus.value = 'pending'

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber.value)
    let result

    if (isAddonPurchase.value) {
      result = await subscriptionsStore.purchaseAddonSessions({
        userId: authStore.loggedInUser.id,
        quantity: props.addonQuantity!,
        phoneNumber: formattedPhone
      })
    } else {
      result = await subscriptionsStore.upgradeSubscription({
        userId: authStore.loggedInUser.id,
        newPlanId: props.plan!.id,
        phoneNumber: formattedPhone
      })
    }

    if (result && result.payment) {
      checkoutRequestId.value = result.payment.checkoutRequestId
      paymentStatus.value = 'polling'
      remainingSeconds.value = 120

      const countdownInterval = setInterval(() => {
        if (remainingSeconds.value > 0) {
          remainingSeconds.value--
        } else {
          clearInterval(countdownInterval)
        }
      }, 1000)

      const status = await subscriptionsStore.pollPaymentStatus(
        result.payment.checkoutRequestId,
        24,
        5000
      )

      clearInterval(countdownInterval)

      if (status === 'COMPLETED') {
        paymentStatus.value = 'completed'
        setTimeout(() => {
          emit('success')
          resetDialog()
        }, 2000)
      } else if (status === 'TIMEOUT') {
        paymentStatus.value = 'timeout'
        errorMessage.value = 'Payment verification timed out. Please check your phone and try again.'
      }
    } else {
      paymentStatus.value = 'failed'
      errorMessage.value = subscriptionsStore.error || 'Failed to initiate payment.'
    }
  } catch (error: any) {
    console.error('❌ Payment error:', error)
    paymentStatus.value = 'failed'
    errorMessage.value = error.response?.data?.message || error.message || 'An error occurred'
  } finally {
    isProcessing.value = false
  }
}

const handlePayment = async () => {
  if (paymentMethod.value === 'card') {
    await handleCardPayment()
  } else {
    await handleMpesaPayment()
  }
}

const handleCyberSourceSuccess = async (transactionId: string) => {
  console.log('✅ CyberSource payment successful:', transactionId)
  paymentStatus.value = 'completed'
  showCyberSource.value = false

  setTimeout(() => {
    emit('success')
    resetDialog()
  }, 2000)
}

const handleCyberSourceFailure = (message: string) => {
  console.error('❌ CyberSource payment failed:', message)
  paymentStatus.value = 'failed'
  errorMessage.value = message
  showCyberSource.value = false
}

const handleCyberSourceCancel = () => {
  console.log('🚫 CyberSource payment cancelled')
  paymentStatus.value = 'idle'
  showCyberSource.value = false
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
    showCyberSource.value = false
    cybersourceUrl.value = ''
    cybersourceParams.value = {}
    cybersourceTransactionId.value = null
  }, 300)
}

watch(isOpen, (newValue) => {
  if (!newValue && paymentStatus.value !== 'polling' && paymentStatus.value !== 'cybersource') {
    resetDialog()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ paymentTitle }}</DialogTitle>
        <DialogDescription>
          {{ paymentDescription }}
        </DialogDescription>
      </DialogHeader>

      <!-- CyberSource Payment View -->
      <div v-if="paymentStatus === 'cybersource' && showCyberSource">
        <CyberSourcePayment
          :cybersource-url="cybersourceUrl"
          :cybersource-params="cybersourceParams"
          :transaction-id="cybersourceTransactionId!"
          @success="handleCyberSourceSuccess"
          @failure="handleCyberSourceFailure"
          @cancel="handleCyberSourceCancel"
        />
      </div>

      <!-- M-Pesa Polling View -->
      <div v-else-if="paymentStatus === 'polling'" class="py-8 flex flex-col items-center justify-center space-y-4">
        <Loader2 class="h-12 w-12 animate-spin" style="color: #9b3699;" />
        <div class="text-center space-y-3">
          <p class="font-semibold">Processing Payment</p>
          <p class="text-sm text-muted-foreground">Please complete the payment on your phone</p>
          <div class="flex flex-col items-center gap-2 mt-4">
            <div class="text-3xl font-bold tabular-nums" style="color: #9b3699;">
              {{ formattedTime }}
            </div>
            <p class="text-xs text-muted-foreground">Time remaining</p>
          </div>
        </div>
      </div>

      <!-- Success View -->
      <div v-else-if="paymentStatus === 'completed'" class="py-8 flex flex-col items-center justify-center space-y-4">
        <CheckCircle class="h-12 w-12 text-green-600" />
        <div class="text-center">
          <p class="font-semibold text-green-600">Payment Successful!</p>
          <p class="text-sm text-muted-foreground">
            {{ isAddonPurchase ? 'Additional sessions have been added to your account' : 'Your subscription has been upgraded' }}
          </p>
        </div>
      </div>

      <!-- Failed/Timeout View -->
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

            <div class="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                 :class="paymentMethod === 'card' ? 'border-[#9b3699] bg-purple-50' : 'border-gray-200'">
              <RadioGroupItem value="card" id="card" />
              <Label for="card" class="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard class="h-5 w-5" style="color: #9b3699;" />
                <div>
                  <p class="font-medium">Card Payment</p>
                  <p class="text-xs text-muted-foreground">Pay with Visa, Mastercard, or Amex</p>
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

        <!-- Card Payment Info -->
        <div v-if="paymentMethod === 'card'" class="space-y-2">
          <Alert>
            <CreditCard class="h-4 w-4" />
            <AlertDescription>
              You will be directed to a secure payment page to enter your card details.
              Your payment is protected by CyberSource.
            </AlertDescription>
          </Alert>
        </div>

        <!-- Error Alert -->
        <Alert v-if="errorMessage && paymentStatus === 'idle'" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            {{ errorMessage }}
          </AlertDescription>
        </Alert>

        <!-- Info Alert -->
        <Alert v-if="paymentStatus === 'pending' && paymentMethod === 'mpesa'">
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
```

---

## Step 3: Add Store Methods

**File**: `store/modules/subscriptions.ts`

Add this method to the subscriptions store:

```typescript
const initiateCyberSourcePayment = async (payload: {
  userId: string
  amount: number
  currency: string
  paymentType: string
  itemId?: string
  planId?: string
  addonQuantity?: number
}) => {
  isProcessing.value = true
  error.value = null

  try {
    const response = await subscriptionsApi.initiateCyberSourcePayment(payload)
    if (response.success) {
      return response.data
    } else {
      error.value = response.message
      return null
    }
  } catch (err: any) {
    error.value = err.message
    return null
  } finally {
    isProcessing.value = false
  }
}

// Don't forget to export it in the return statement
return {
  // ... existing exports
  initiateCyberSourcePayment,
}
```

---

## Step 4: Add API Client Methods

**File**: `http/requests/app/subscriptions.ts`

Add these interfaces and method:

```typescript
export interface CyberSourcePaymentRequest {
  userId: string
  amount: number
  currency: string
  paymentType: string
  itemId?: string
  planId?: string
  addonQuantity?: number
}

export interface CyberSourcePaymentResponse {
  success: boolean
  message: string
  data: {
    transactionId: string
    cybersourceParams: Record<string, string>
    cybersourceEndpoint: string
  }
}

export const subscriptionsApi = {
  // ... existing methods ...

  /**
   * Initiate CyberSource card payment
   */
  async initiateCyberSourcePayment(payload: CyberSourcePaymentRequest): Promise<CyberSourcePaymentResponse> {
    const { data } = await api.post('/v1/payments/cybersource/initiate', payload)
    return data
  },
}
```

---

## Step 5: Backend - Complete Implementation

Refer to the file:
`/Users/macbookpro/WebstormProjects/myProsperV2/.claude/plans/cybersource-integration-plan-backend-updated.md`

This contains all the backend Spring Boot code including:
- Configuration
- Database migrations
- Entities
- Repositories
- Services
- Controllers
- DTOs

---

## Testing Guide

### 1. Test Cards (CyberSource Sandbox)
```
Success: 4111111111111111
Decline: 4000300011112220
Review:  4000100011112224

Expiry: Any future date
CVV: Any 3 digits
```

### 2. Test Scenarios

**iFrame Mode:**
1. Select card payment
2. Enter amount
3. Click "Proceed to Payment"
4. Verify iframe loads
5. Complete payment in iframe
6. Verify success message

**Popup Mode (if iframe blocked):**
1. Same as above
2. If iframe doesn't load, popup should open automatically
3. Complete payment in popup
4. Popup closes and success message shows

**M-Pesa (ensure still works):**
1. Select M-Pesa
2. Enter phone number
3. Complete STK push
4. Verify polling works

---

## Security Checklist

- [ ] Signature verification on all callbacks
- [ ] HTTPS only in production
- [ ] Validate payment amounts match expected
- [ ] Check for duplicate transactions
- [ ] Never log sensitive card data
- [ ] Validate origin of postMessage events
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting on payment endpoints

---

## Next Steps

1. **Get CyberSource Credentials**: Sign up for test account
2. **Configure Backend**: Add credentials to `application-local.properties`
3. **Test Locally**: Use test cards to verify flow
4. **Deploy to Staging**: Test with real CyberSource test environment
5. **Production**: Get production credentials and deploy

---

## Support

- CyberSource Docs: https://developer.cybersource.com/
- Secure Acceptance Guide: https://developer.cybersource.com/library/documentation/dev_guides/Secure_Acceptance_Hosted_Checkout/Secure_Acceptance_Hosted_Checkout.pdf

