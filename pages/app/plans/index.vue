<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import { storeToRefs } from 'pinia'
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PaymentDialog from '@/components/ui/subscriptions/PaymentDialog.vue'

// Icons
import { Check, X, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  title: 'Subscription Plans',
  description: 'Choose the perfect plan for your professional growth',
  requiresAuth: true,
  permissions: ['plans:view']
})

// Store
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()

// Store state
const { activePlans, isLoading, error, activeSubscription, isLoadingActiveSubscription } = storeToRefs(subscriptionsStore)

// Local state
const showPaymentDialog = ref(false)
const selectedPlanForPayment = ref<SubscriptionPlan | null>(null)

// Check permissions
const canViewPlans = computed(() => {
  // For development: always return true
  return true
  // return RoleManager.hasPermission(authStore.loggedInUser, 'plans:view')
})

// Lifecycle
onMounted(async () => {
  if (canViewPlans.value) {
    await subscriptionsStore.fetchPlans()

    // Fetch the user's active subscription
    if (authStore.loggedInUser?.id) {
      await subscriptionsStore.fetchActiveSubscription(authStore.loggedInUser.id)
    }
  }
})

// Methods
const selectPlan = (plan: SubscriptionPlan) => {
  selectedPlanForPayment.value = plan
  showPaymentDialog.value = true
}

const handlePaymentSuccess = async () => {
  showPaymentDialog.value = false

  // Refresh the page data
  if (authStore.loggedInUser?.id) {
    await subscriptionsStore.fetchActiveSubscription(authStore.loggedInUser.id)
    await subscriptionsStore.fetchPlans()
  }

  // Reload the page to reflect changes
  window.location.reload()
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Get all unique features across all plans
const allFeatures = computed(() => {
  const featuresSet = new Set<string>()

  activePlans.value.forEach(plan => {
    if (plan.planFeatures && plan.planFeatures.length > 0) {
      plan.planFeatures.forEach(pf => {
        if (pf.feature?.name) {
          featuresSet.add(pf.feature.name)
        }
      })
    }
  })

  return Array.from(featuresSet)
})

// Check if a plan has a specific feature
const planHasFeature = (plan: SubscriptionPlan, featureName: string): boolean => {
  if (!plan.planFeatures || plan.planFeatures.length === 0) return false

  return plan.planFeatures.some(pf =>
    pf.feature?.name === featureName && pf.enabled
  )
}

// Get feature value or description for a plan
const getFeatureValue = (plan: SubscriptionPlan, featureName: string): string | null => {
  if (!plan.planFeatures || plan.planFeatures.length === 0) return null

  const planFeature = plan.planFeatures.find(pf => pf.feature?.name === featureName)

  // Return limit info if not unlimited
  if (planFeature && !planFeature.unlimited && planFeature.limitValue > 0) {
    return `${planFeature.limitValue} per period`
  }

  return planFeature?.feature?.description || null
}

// Check if a plan is the current subscription
const isCurrentPlan = (plan: SubscriptionPlan): boolean => {
  return activeSubscription.value?.plan?.id === plan.id
}

// Check if user should upgrade to this plan
const shouldUpgrade = (plan: SubscriptionPlan): boolean => {
  if (!activeSubscription.value?.plan) return false
  if (isCurrentPlan(plan)) return false

  // Compare by display order (higher means better plan)
  return plan.displayOrder > activeSubscription.value.plan.displayOrder
}

// Get the badge text for a plan
const getPlanBadge = (plan: SubscriptionPlan): { text: string; variant: 'current' } | null => {
  if (isCurrentPlan(plan)) {
    return { text: 'Current Plan', variant: 'current' }
  }

  return null
}
</script>

<template>
  <div class="container mx-auto py-6 px-4 max-w-7xl">
    <!-- Page Header -->
    <div class="space-y-4 mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p class="text-muted-foreground">
            Choose the perfect plan to accelerate your professional growth
          </p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <!-- Loading State -->
    <Card v-if="isLoading" class="border-2 border-purple-200">
      <CardContent class="p-6">
        <div class="space-y-4">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-64 w-full" />
        </div>
      </CardContent>
    </Card>

    <!-- Pricing Table -->
    <Card v-else-if="activePlans.length > 0" class="border-2 border-purple-300 shadow-lg overflow-hidden">
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <!-- Table Header with Plan Names -->
            <thead>
              <tr class="bg-purple-50">
                <th class="border border-purple-300 p-4 text-left font-semibold min-w-[200px]"></th>
                <th
                  v-for="plan in activePlans"
                  :key="plan.id"
                  :class="[
                    'border p-4 text-center font-bold text-lg min-w-[150px] relative',
                    isCurrentPlan(plan)
                      ? 'border-2'
                      : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#f3e8f1',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <div class="flex flex-col items-center gap-2">
                    <span :style="isCurrentPlan(plan) ? { color: '#9b3699' } : { color: '#7c3aed' }">
                      {{ plan.name }}
                    </span>

                    <!-- Plan Badge -->
                    <span
                      v-if="getPlanBadge(plan)"
                      class="text-xs font-semibold px-3 py-1 rounded-full text-white"
                      style="background-color: #9b3699;"
                    >
                      {{ getPlanBadge(plan)?.text }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- Pricing Row -->
              <tr class="bg-white">
                <td class="border border-purple-300 p-4 font-semibold"></td>
                <td
                  v-for="plan in activePlans"
                  :key="`price-${plan.id}`"
                  :class="[
                    'border p-4 text-center',
                    isCurrentPlan(plan) ? 'border-x-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#faf7fa',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <div class="space-y-1">
                    <div class="text-2xl font-bold text-purple-700">
                      {{ formatCurrency(plan.cost, plan.currency) }}
                      <span v-if="plan.cost > 0" class="text-base font-normal text-muted-foreground">
                        /Month
                      </span>
                    </div>
                    <div v-if="plan.cost === 0" class="text-sm text-muted-foreground">
                      $0
                    </div>
                    <div v-else-if="plan.yearlyCost && plan.yearlyCost > 0" class="text-sm text-muted-foreground">
                      Or {{ formatCurrency(plan.yearlyCost, plan.currency) }}/Year
                    </div>
                  </div>
                </td>
              </tr>

              <!-- What We Offer Row -->
              <tr class="bg-purple-50">
                <td class="border border-purple-300 p-4 font-semibold">What We Offer</td>
                <td
                  v-for="plan in activePlans"
                  :key="`offer-${plan.id}`"
                  :class="[
                    'border p-4 text-center text-sm',
                    isCurrentPlan(plan) ? 'border-x-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#f3e8f1',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  {{ plan.description }}
                </td>
              </tr>

              <!-- What You Get Row (Sessions Info) -->
              <tr class="bg-white">
                <td class="border border-purple-300 p-4 font-semibold">What You Get</td>
                <td
                  v-for="plan in activePlans"
                  :key="`sessions-${plan.id}`"
                  :class="[
                    'border p-4 text-center text-sm',
                    isCurrentPlan(plan) ? 'border-x-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#faf7fa',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <div v-if="plan.sessionsPerPeriod > 0">
                    {{ plan.sessionsPerPeriod }} session{{ plan.sessionsPerPeriod > 1 ? 's' : '' }} per period
                  </div>
                  <div v-else class="text-muted-foreground">
                    Access to platform
                  </div>
                </td>
              </tr>

              <!-- Feature Rows -->
              <tr
                v-for="(feature, index) in allFeatures"
                :key="feature"
                :class="index % 2 === 0 ? 'bg-purple-50' : 'bg-white'"
              >
                <td class="border border-purple-300 p-4 font-medium">{{ feature }}</td>
                <td
                  v-for="plan in activePlans"
                  :key="`${plan.id}-${feature}`"
                  :class="[
                    'border p-4 text-center',
                    isCurrentPlan(plan) ? 'border-x-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: index % 2 === 0 ? '#f3e8f1' : '#faf7fa',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <div v-if="planHasFeature(plan, feature)" class="flex items-center justify-center">
                    <Check class="h-5 w-5 text-green-600" />
                  </div>
                  <div v-else class="flex items-center justify-center">
                    <span class="text-muted-foreground">—</span>
                  </div>
                </td>
              </tr>

              <!-- Extra Sessions Row -->
              <tr class="bg-white">
                <td class="border border-purple-300 p-4 font-semibold">Extra 1:1 Sessions</td>
                <td
                  v-for="plan in activePlans"
                  :key="`extra-${plan.id}`"
                  :class="[
                    'border p-4 text-center text-sm',
                    isCurrentPlan(plan) ? 'border-x-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#faf7fa',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <div v-if="plan.allowsAddons && plan.addonSessionCost">
                    {{ formatCurrency(plan.addonSessionCost, plan.currency) }} /Session
                  </div>
                  <div v-else class="text-muted-foreground">
                    —
                  </div>
                </td>
              </tr>

              <!-- CTA Row -->
              <tr class="bg-white">
                <td class="border border-purple-300 p-4"></td>
                <td
                  v-for="plan in activePlans"
                  :key="`cta-${plan.id}`"
                  :class="[
                    'border p-6 text-center',
                    isCurrentPlan(plan) ? 'border-x-2 border-b-2' : 'border-purple-300'
                  ]"
                  :style="isCurrentPlan(plan) ? {
                    backgroundColor: '#faf7fa',
                    borderColor: '#9b3699'
                  } : {}"
                >
                  <Button
                    v-if="isCurrentPlan(plan)"
                    disabled
                    class="w-full"
                    style="background-color: #9b3699; opacity: 0.6; cursor: not-allowed;"
                  >
                    Current Plan
                  </Button>
                  <Button
                    v-else-if="shouldUpgrade(plan)"
                    class="w-full"
                    style="background-color: #9b3699;"
                    @click="selectPlan(plan)"
                  >
                    Upgrade Now
                  </Button>
                  <Button
                    v-else-if="activeSubscription"
                    variant="outline"
                    class="w-full"
                    @click="selectPlan(plan)"
                  >
                    Change Plan
                  </Button>
                  <Button
                    v-else
                    class="w-full"
                    style="background-color: #9b3699;"
                    @click="selectPlan(plan)"
                  >
                    Get Started
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="!isLoading" class="border-2 border-purple-200">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <AlertCircle class="h-12 w-12 text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">No Plans Available</h3>
        <p class="text-muted-foreground text-center max-w-md">
          There are currently no subscription plans available. Please check back later or contact support.
        </p>
      </CardContent>
    </Card>

    <!-- Payment Dialog -->
    <PaymentDialog
      v-model:open="showPaymentDialog"
      :plan="selectedPlanForPayment"
      @success="handlePaymentSuccess"
    />
  </div>
</template>
