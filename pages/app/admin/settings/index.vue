<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubscriptionsStore } from '~/store/modules/subscriptions'
import { useAuthStore } from '~/store/modules/auth'
import type { SubscriptionPlan } from '~/http/requests/app/subscriptions'
import mentorsApi from '~/http/requests/app/mentors'
import companyApi, { type CompanyRecord, type CompanyRecommendedProgram } from '~/http/requests/app/company'
import companySubscriptionsApi from '~/http/requests/app/companySubscriptions'
import { useCompanySubscriptionAdmin } from '~/composables/useCompanySubscriptionAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import DepartmentsSettingsTab from '~/components/app/admin/settings/DepartmentsSettingsTab.vue'
import {
  AlertCircle,
  Settings,
  Building2,
  Minus,
  Palette,
  Plug,
  Save,
  CreditCard,
  Receipt,
  Plus,
  RefreshCw,
  FileText,
  Users
} from 'lucide-vue-next'
import { useAppToast } from '~/composables/services/toastService'

definePageMeta({
  title: 'Settings',
  description: 'Manage your organization settings',
  requiresAuth: true,
  permissions: ['admin:settings']
})

type SettingsTab = 'company' | 'branding' | 'program' | 'departments' | 'subscription' | 'billing'

const DEFAULT_PRIMARY_COLOR = '#a03b93'
const DEFAULT_SECONDARY_COLOR = '#d9a8d3'

const { success, error: toastError } = useAppToast()
const route = useRoute()
const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const {
  isLoadingBilling,
  billingError,
  companySubscriptions,
  activeCompanySubscriptionId,
  managedCompanySubscription,
  managedCompanyWallet,
  loadCompanyBilling,
  selectCompanySubscription,
  getWalletReservedSessions,
} = useCompanySubscriptionAdmin()

const resolveSettingsTab = (value?: unknown): SettingsTab => {
  const normalized = String(Array.isArray(value) ? value[0] : value || '').trim().toLowerCase()

  switch (normalized) {
    case 'company':
    case 'branding':
    case 'program':
    case 'subscription':
    case 'departments':
    case 'billing':
      return normalized
    default:
      return 'company'
  }
}

const isBillingTabQuery = (value?: unknown) =>
  String(Array.isArray(value) ? value[0] : value || '').trim().toLowerCase() === 'billing'

const hasBillingReturnContext = () =>
  route.query.invoice_paid === '1'
  || route.query.invoice_cancelled === '1'
  || route.query.context === 'company_subscription'

const redirectSettingsBillingToFinance = async () => {
  const query = { ...route.query }
  delete query.tab

  await navigateTo({
    path: '/app/admin/billing',
    query,
  }, { replace: true })
}

const { activePlans: storeActivePlans, isLoading: isLoadingPlans, error: plansError } = storeToRefs(subscriptionsStore)

// Active tab
const activeTab = ref<SettingsTab>(resolveSettingsTab(route.query.tab))

// Company Information
const companyInfo = ref({
  name: '',
  email: '',
  phone: '',
  website: '',
  description: '',
  address: '',
  city: '',
  country: ''
})

// Branding
const branding = ref({
  logoUrl: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_SECONDARY_COLOR
})

const companyRecord = ref<CompanyRecord | null>(null)
const isLoadingCompanySettings = ref(false)
const isSavingCompanyInfo = ref(false)
const isSavingBranding = ref(false)
const companySettingsError = ref<string | null>(null)
const isCreatingInvoice = ref(false)
const isLoadingProgramCatalog = ref(false)
const isLoadingRecommendedPrograms = ref(false)
const isSavingRecommendedPrograms = ref(false)
const hasLoadedProgramCatalog = ref(false)
const hasLoadedRecommendedPrograms = ref(false)
const corporateSessionCounts = ref<Record<string, number>>({})
const availablePrograms = ref<CompanyRecommendedProgram[]>([])
const selectedRecommendedProgramIds = ref<string[]>([])
const programConfigurationError = ref<string | null>(null)

const corporatePlans = computed(() =>
  storeActivePlans.value.filter(plan =>
    plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH',
  ),
)

const managedCompanyPlan = computed(() =>
  storeActivePlans.value.find(plan => plan.id === managedCompanySubscription.value?.planId) || null
)

const isPendingCorporatePlan = (plan: SubscriptionPlan) =>
  managedCompanySubscription.value?.status === 'PENDING_PAYMENT'
  && managedCompanySubscription.value?.planId === plan.id

const isCurrentCorporatePlan = (plan: SubscriptionPlan) =>
  managedCompanySubscription.value?.status === 'ACTIVE'
  && managedCompanySubscription.value?.planId === plan.id

const hasOpenInvoiceForPlan = (plan: SubscriptionPlan) =>
  managedCompanySubscription.value?.planId === plan.id
  && managedCompanySubscription.value?.latestInvoice?.status === 'OPEN'
  && !!managedCompanySubscription.value?.latestInvoice?.paymentUrl

const getCorporatePlanActionLabel = (plan: SubscriptionPlan) => {
  if (hasOpenInvoiceForPlan(plan)) {
    return 'Continue Payment'
  }

  if (isCurrentCorporatePlan(plan)) {
    return 'Buy More Sessions'
  }

  if (isPendingCorporatePlan(plan)) {
    return 'Buy Sessions'
  }

  if (!managedCompanySubscription.value || !managedCompanyPlan.value) {
    return 'Buy Sessions'
  }

  return managedCompanyPlan.value.id === plan.id ? 'Buy More Sessions' : 'Select Offer'
}

const handleCorporatePlanAction = (plan: SubscriptionPlan) => {
  if (hasOpenInvoiceForPlan(plan)) {
    goToPaymentUrl(managedCompanySubscription.value?.latestInvoice?.paymentUrl)
    return
  }

  purchaseCorporatePlan(plan.id, plan.name, plan.minSeats, plan.maxSeats || undefined)
}

const companyContext = computed(() => {
  const hasCorporateAdminPermission = (authStore.loggedInUser?.roles || []).some(role =>
    (role?.permissions || []).some(permission =>
      ['admin:settings', 'admin:billing', 'admin:company'].includes(String(permission?.id || '').trim().toLowerCase()),
    ),
  )
  const hasCorporateAdminRole = (authStore.loggedInUser?.roles || []).some(role => {
    const normalizedRole = String(role?.name || '').trim().toLowerCase()
    return ['corporate_admin', 'company_admin', 'company', 'admin'].includes(normalizedRole)
  })

  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile)
        const normalizedRole = String(parsed?.role || '').trim().toLowerCase()

        return {
          isCorporateAdmin: hasCorporateAdminRole
            || hasCorporateAdminPermission
            || ['corporate_admin', 'company_admin', 'company', 'admin'].includes(normalizedRole),
          companyId: companyRecord.value?.id || parsed?.company?.id || parsed?.companyId || parsed?.company_id || authStore.loggedInUser?.companyId || '',
          companyName: companyRecord.value?.name || parsed?.company?.name || 'Your company',
        }
      } catch {
        return {
          isCorporateAdmin: hasCorporateAdminRole || hasCorporateAdminPermission,
          companyId: companyRecord.value?.id || authStore.loggedInUser?.companyId || '',
          companyName: companyRecord.value?.name || 'Your company',
        }
      }
    }
  }

  return {
    isCorporateAdmin: hasCorporateAdminRole || hasCorporateAdminPermission,
    companyId: companyRecord.value?.id || authStore.loggedInUser?.companyId || '',
    companyName: companyRecord.value?.name || 'Your company',
  }
})

const selectedRecommendedProgramIdSet = computed(() =>
  new Set(selectedRecommendedProgramIds.value)
)

const isProgramRecommended = (programId: string) =>
  selectedRecommendedProgramIdSet.value.has(programId)

const toggleRecommendedProgram = (programId: string) => {
  if (isSavingRecommendedPrograms.value) {
    return
  }

  if (selectedRecommendedProgramIdSet.value.has(programId)) {
    selectedRecommendedProgramIds.value = selectedRecommendedProgramIds.value.filter(id => id !== programId)
    return
  }

  selectedRecommendedProgramIds.value = [...selectedRecommendedProgramIds.value, programId]
}

const normalizeSessionCount = (value: number | string | undefined, minSessions = 1, maxSessions?: number) => {
  const parsed = Number(value)
  const safeMin = Math.max(1, Number(minSessions || 1))
  let normalized = Number.isFinite(parsed) ? Math.trunc(parsed) : safeMin

  normalized = Math.max(safeMin, normalized)

  if (maxSessions) {
    normalized = Math.min(normalized, maxSessions)
  }

  return normalized
}

const getCorporateSessionCount = (planId: string, minSessions?: number, defaultSessions?: number, maxSessions?: number) => {
  if (!corporateSessionCounts.value[planId]) {
    corporateSessionCounts.value[planId] = normalizeSessionCount(defaultSessions || minSessions || 1, minSessions, maxSessions)
  }

  return corporateSessionCounts.value[planId]
}

const clampCorporateSessionCount = (planId: string, minSessions?: number, defaultSessions?: number, maxSessions?: number) => {
  corporateSessionCounts.value[planId] = normalizeSessionCount(
    corporateSessionCounts.value[planId] ?? defaultSessions ?? minSessions ?? 1,
    minSessions,
    maxSessions,
  )
}

const adjustCorporateSessionCount = (
  planId: string,
  delta: number,
  minSessions?: number,
  defaultSessions?: number,
  maxSessions?: number,
) => {
  const nextValue = getCorporateSessionCount(planId, minSessions, defaultSessions, maxSessions) + delta
  corporateSessionCounts.value[planId] = normalizeSessionCount(nextValue, minSessions, maxSessions)
}

const formatCurrency = (amount: number, currency = 'KES') => {
  if (Number(amount) === 0) return 'Free'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

const getWalletPricePerSession = (plan?: SubscriptionPlan | null) =>
  Number(managedCompanyWallet.value?.pricePerSession || plan?.cost || 0)

const managedWalletReservedSessions = computed(() =>
  getWalletReservedSessions(managedCompanyWallet.value),
)

const normalizeColor = (value?: string | null, fallback = DEFAULT_PRIMARY_COLOR) => {
  const normalized = String(value || '').trim()
  if (!normalized) {
    return fallback
  }

  const withHash = normalized.startsWith('#') ? normalized : `#${normalized}`
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash : fallback
}

const syncStoredCompanyContext = (company: CompanyRecord) => {
  if (typeof window === 'undefined') {
    return
  }

  const rawProfile = localStorage.getItem('profile')
  if (rawProfile) {
    try {
      const parsed = JSON.parse(rawProfile)
      parsed.company = {
        ...(parsed.company || {}),
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl || null,
      }
      parsed.companyId = company.id
      parsed.company_id = company.id
      localStorage.setItem('profile', JSON.stringify(parsed))
    } catch {
      // Ignore malformed local profile cache; a fresh login will rebuild it.
    }
  }
}

const populateCompanySettings = (company: CompanyRecord) => {
  companyRecord.value = company
  companyInfo.value = {
    name: company.name || '',
    email: company.emailAddress || '',
    phone: company.phoneNumber || '',
    website: company.website || '',
    description: company.description || '',
    address: company.address || '',
    city: company.city || '',
    country: company.country || '',
  }
  branding.value = {
    logoUrl: company.logoUrl || '',
    primaryColor: normalizeColor(company.primaryColor, DEFAULT_PRIMARY_COLOR),
    secondaryColor: normalizeColor(company.secondaryColor, DEFAULT_SECONDARY_COLOR),
  }
  syncStoredCompanyContext(company)
}

const loadCompanySettings = async () => {
  if (!companyContext.value.companyId) {
    companySettingsError.value = 'Company context not found. Sign in again and retry.'
    return
  }

  isLoadingCompanySettings.value = true
  companySettingsError.value = null

  try {
    const response = await companyApi.getCompany(companyContext.value.companyId)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to load company settings.')
    }

    populateCompanySettings(response.data.data)
  } catch (loadError: any) {
    console.error('Failed to load company settings:', loadError)
    companySettingsError.value =
      loadError?.response?.data?.message
      || loadError?.message
      || 'Failed to load company settings.'
  } finally {
    isLoadingCompanySettings.value = false
  }
}

// Save handlers
const saveCompanyInfo = async () => {
  if (!companyContext.value.companyId) {
    toastError('Company context not found. Refresh your session and try again.')
    return
  }

  isSavingCompanyInfo.value = true
  companySettingsError.value = null

  try {
    const response = await companyApi.updateCompany(companyContext.value.companyId, {
      name: companyInfo.value.name.trim(),
      emailAddress: companyInfo.value.email.trim(),
      phoneNumber: companyInfo.value.phone.trim(),
      website: companyInfo.value.website.trim(),
      description: companyInfo.value.description.trim(),
      address: companyInfo.value.address.trim(),
      city: companyInfo.value.city.trim(),
      country: companyInfo.value.country.trim(),
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update company information.')
    }

    populateCompanySettings(response.data.data)
    success('Company information updated successfully')
  } catch (err: any) {
    companySettingsError.value =
      err?.response?.data?.message
      || err?.message
      || 'Failed to update company information.'
    toastError(companySettingsError.value)
  } finally {
    isSavingCompanyInfo.value = false
  }
}

const saveBranding = async () => {
  if (!companyContext.value.companyId) {
    toastError('Company context not found. Refresh your session and try again.')
    return
  }

  isSavingBranding.value = true
  companySettingsError.value = null

  try {
    const response = await companyApi.updateCompany(companyContext.value.companyId, {
      logoUrl: branding.value.logoUrl.trim(),
      primaryColor: normalizeColor(branding.value.primaryColor, DEFAULT_PRIMARY_COLOR),
      secondaryColor: normalizeColor(branding.value.secondaryColor, DEFAULT_SECONDARY_COLOR),
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update branding settings.')
    }

    populateCompanySettings(response.data.data)
    success('Branding settings updated successfully')
  } catch (err: any) {
    companySettingsError.value =
      err?.response?.data?.message
      || err?.message
      || 'Failed to update branding settings.'
    toastError(companySettingsError.value)
  } finally {
    isSavingBranding.value = false
  }
}

const loadAvailablePrograms = async () => {
  isLoadingProgramCatalog.value = true
  programConfigurationError.value = null

  try {
    const response = await mentorsApi.programs.getLivePrograms()
    if (!response.success) {
      throw new Error('Failed to load programs')
    }

    availablePrograms.value = [...(response.programs || [])]
      .filter(program => program.status === 'LIVE')
      .sort((a, b) => Number(a.orderId || 0) - Number(b.orderId || 0))
    hasLoadedProgramCatalog.value = true
  } catch (loadError: any) {
    console.error('Failed to load available programs:', loadError)
    programConfigurationError.value =
      loadError?.response?.data?.message
      || loadError?.message
      || 'Failed to load available programs.'
  } finally {
    isLoadingProgramCatalog.value = false
  }
}

const loadCompanyRecommendedPrograms = async () => {
  if (!companyContext.value.companyId) {
    selectedRecommendedProgramIds.value = []
    return
  }

  isLoadingRecommendedPrograms.value = true
  programConfigurationError.value = null

  try {
    const response = await companyApi.getRecommendedPrograms(companyContext.value.companyId)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load company recommended programs.')
    }

    selectedRecommendedProgramIds.value = (response.data.data?.programs || []).map(program => program.id)
    hasLoadedRecommendedPrograms.value = true
  } catch (loadError: any) {
    console.error('Failed to load company recommended programs:', loadError)
    programConfigurationError.value =
      loadError?.response?.data?.message
      || loadError?.message
      || 'Failed to load company recommended programs.'
  } finally {
    isLoadingRecommendedPrograms.value = false
  }
}

const saveRecommendedPrograms = async () => {
  if (!companyContext.value.companyId) {
    toastError('Company context not found. Refresh your session and try again.')
    return
  }

  isSavingRecommendedPrograms.value = true
  programConfigurationError.value = null

  try {
    const response = await companyApi.updateRecommendedPrograms(
      companyContext.value.companyId,
      selectedRecommendedProgramIds.value,
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update recommended programs.')
    }

    selectedRecommendedProgramIds.value = (response.data.data?.programs || []).map(program => program.id)
    success('Recommended programs updated successfully.')
  } catch (saveError: any) {
    console.error('Failed to save recommended programs:', saveError)
    toastError(
      saveError?.response?.data?.message
      || saveError?.message
      || 'Failed to update recommended programs.',
    )
  } finally {
    isSavingRecommendedPrograms.value = false
  }
}

const purchaseCorporatePlan = async (planId: string, planName: string, minSessions?: number, maxSessions?: number) => {
  if (isCreatingInvoice.value) return

  if (!companyContext.value.isCorporateAdmin) {
    toastError('Corporate admin access is required.')
    return
  }

  if (!companyContext.value.companyId) {
    toastError('Company context not found. Refresh your session and try again.')
    return
  }

  const sessionCount = normalizeSessionCount(corporateSessionCounts.value[planId], minSessions, maxSessions)
  corporateSessionCounts.value[planId] = sessionCount
  if (!sessionCount || sessionCount < (minSessions || 1)) {
    toastError(`Minimum sessions for this offer is ${minSessions || 1}.`)
    return
  }

  if (maxSessions && sessionCount > maxSessions) {
    toastError(`Maximum sessions for this offer is ${maxSessions}.`)
    return
  }

  isCreatingInvoice.value = true

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await companySubscriptionsApi.createCompanySubscription({
      companyId: companyContext.value.companyId,
      planId,
      sessionCount,
      redirectSuccessUrl: `${origin}/app/admin/billing?invoice_paid=1&context=company_subscription&plan_id=${planId}`,
      redirectCancelUrl: `${origin}/app/admin/billing?invoice_cancelled=1&context=company_subscription&plan_id=${planId}`,
    })

    if (!response.success || !response.data?.paymentUrl) {
      throw new Error(response.message || `Failed to create invoice for ${planName}`)
    }

    window.location.href = response.data.paymentUrl
  } catch (purchaseError: any) {
    toastError(purchaseError?.response?.data?.message || purchaseError?.message || 'Failed to redirect to payment page')
  } finally {
    isCreatingInvoice.value = false
  }
}

const goToPaymentUrl = (url?: string | null) => {
  if (!url) return
  window.location.assign(url)
}

const refreshBilling = async () => {
  if (!companyContext.value.companyId) {
    toastError('Company context not found. Refresh your session and try again.')
    return
  }

  await loadCompanyBilling(companyContext.value.companyId)
}

watch(() => route.query.tab, async value => {
  if (isBillingTabQuery(value)) {
    await redirectSettingsBillingToFinance()
    return
  }

  const resolvedTab = resolveSettingsTab(value)
  if (activeTab.value !== resolvedTab) {
    activeTab.value = resolvedTab
  }
})

watch(activeTab, async value => {
  const resolvedTab = resolveSettingsTab(value)
  const currentTab = resolveSettingsTab(route.query.tab)

  if (resolvedTab === currentTab) return

  const query = { ...route.query }
  if (resolvedTab === 'company') {
    delete query.tab
  } else {
    query.tab = resolvedTab
  }

  await router.replace({ query })

  if (resolvedTab === 'program') {
    if (!hasLoadedProgramCatalog.value && !isLoadingProgramCatalog.value) {
      await loadAvailablePrograms()
    }

    if (companyContext.value.companyId && !hasLoadedRecommendedPrograms.value && !isLoadingRecommendedPrograms.value) {
      await loadCompanyRecommendedPrograms()
    }
  }

  if (
    (resolvedTab === 'company' || resolvedTab === 'branding')
    && companyContext.value.companyId
    && !companyRecord.value
    && !isLoadingCompanySettings.value
  ) {
    await loadCompanySettings()
  }
})

// Load settings on mount
onMounted(async () => {
  if (isBillingTabQuery(route.query.tab) || hasBillingReturnContext()) {
    await redirectSettingsBillingToFinance()
    return
  }

  await Promise.all([
    subscriptionsStore.fetchPlans('CORPORATE'),
    loadAvailablePrograms(),
  ])

  if (companyContext.value.companyId) {
    await Promise.all([
      loadCompanySettings(),
      loadCompanyBilling(companyContext.value.companyId),
      loadCompanyRecommendedPrograms(),
    ])
  } else {
    companySettingsError.value = 'Company context not found. Sign in again and retry.'
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Settings class="h-7 w-7" /> Settings
      </h1>
      <p class="text-muted-foreground">
        Manage your organization's settings and preferences
      </p>
    </div>

    <!-- Tabs Navigation -->
    <Card>
      <CardContent class="p-0">
        <div class="flex flex-wrap border-b overflow-x-auto">
          <button
            @click="activeTab = 'company'"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'company'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Building2 class="h-4 w-4" /> Company
          </button>
          <button
            @click="activeTab = 'branding'"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'branding'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Palette class="h-4 w-4" /> Branding
          </button>
          <button
            @click="activeTab = 'program'"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'program'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Plug class="h-4 w-4" /> Program
          </button>
          <button
            @click="activeTab = 'departments'"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'departments'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Users class="h-4 w-4" /> Departments
          </button>
          <button
            @click="activeTab = 'subscription'"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'subscription'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Receipt class="h-4 w-4" /> Plans
          </button>
          <button
            @click="router.push('/app/admin/billing')"
            :class="[
              'px-6 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === 'billing'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <CreditCard class="h-4 w-4" /> Billing
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Company Information Tab -->
    <div v-show="activeTab === 'company'">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company's basic information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <Alert v-if="companySettingsError" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ companySettingsError }}</AlertDescription>
          </Alert>

          <div v-if="isLoadingCompanySettings" class="grid gap-4 md:grid-cols-2">
            <Skeleton v-for="index in 6" :key="`company-settings-skeleton-${index}`" class="h-10 w-full" />
          </div>

          <template v-else>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="company-name">Company Name *</Label>
              <Input id="company-name" v-model="companyInfo.name" placeholder="Enter company name" />
            </div>
            <div class="space-y-2">
              <Label for="company-email">Email Address *</Label>
              <Input id="company-email" type="email" v-model="companyInfo.email" placeholder="email@company.com" />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="company-phone">Phone Number</Label>
              <Input id="company-phone" v-model="companyInfo.phone" placeholder="+254 XXX XXX XXX" />
            </div>
            <div class="space-y-2">
              <Label for="company-website">Website</Label>
              <Input id="company-website" type="url" v-model="companyInfo.website" placeholder="https://example.com" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="company-description">Description</Label>
            <Textarea
              id="company-description"
              v-model="companyInfo.description"
              placeholder="Brief description of your company"
              rows="3"
            />
          </div>

          <Separator />

          <div class="space-y-2">
            <Label for="company-address">Address</Label>
            <Input id="company-address" v-model="companyInfo.address" placeholder="Street address" />
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="company-city">City</Label>
              <Input id="company-city" v-model="companyInfo.city" placeholder="City" />
            </div>
            <div class="space-y-2">
              <Label for="company-country">Country</Label>
              <Input id="company-country" v-model="companyInfo.country" placeholder="Country" />
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="saveCompanyInfo" :disabled="isSavingCompanyInfo || !companyContext.companyId" class="gap-2">
              <Save class="h-4 w-4" />
              {{ isSavingCompanyInfo ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <!-- Branding Tab -->
    <div v-show="activeTab === 'branding'">
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Customize your company's visual identity
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <Alert v-if="companySettingsError" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ companySettingsError }}</AlertDescription>
          </Alert>

          <div v-if="isLoadingCompanySettings" class="grid gap-4 md:grid-cols-2">
            <Skeleton v-for="index in 4" :key="`branding-settings-skeleton-${index}`" class="h-10 w-full" />
          </div>

          <template v-else>
          <div class="space-y-2">
            <Label for="logo-url">Company Logo URL</Label>
            <Input id="logo-url" v-model="branding.logoUrl" placeholder="https://example.com/logo.png" />
            <p class="text-sm text-muted-foreground">Recommended size: 200x200px</p>
          </div>

          <div v-if="branding.logoUrl" class="flex items-center gap-4 p-4 border rounded-lg">
            <img :src="branding.logoUrl" alt="Company Logo" class="h-16 w-auto object-contain" />
            <div class="text-sm text-muted-foreground">Logo Preview</div>
          </div>

          <Separator />

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="primary-color">Primary Color</Label>
              <div class="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  v-model="branding.primaryColor"
                  class="w-20 h-10 cursor-pointer"
                />
                <Input
                  v-model="branding.primaryColor"
                  placeholder="#3B82F6"
                  class="flex-1"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="secondary-color">Secondary Color</Label>
              <div class="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  v-model="branding.secondaryColor"
                  class="w-20 h-10 cursor-pointer"
                />
                <Input
                  v-model="branding.secondaryColor"
                  placeholder="#10B981"
                  class="flex-1"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="saveBranding" :disabled="isSavingBranding || !companyContext.companyId" class="gap-2">
              <Save class="h-4 w-4" />
              {{ isSavingBranding ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <!-- Program Settings Tab -->
    <div v-show="activeTab === 'program'" class="space-y-6">
      <Card>
        <CardHeader class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Recommended Programs</CardTitle>
            <CardDescription>
              Select the programs {{ companyContext.companyName }} wants employees to prioritize in their learning portal.
            </CardDescription>
          </div>
          <Badge variant="outline">
            {{ selectedRecommendedProgramIds.length }} selected
          </Badge>
        </CardHeader>
        <CardContent class="space-y-6">
          <Alert v-if="programConfigurationError" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ programConfigurationError }}</AlertDescription>
          </Alert>

          <Alert v-if="!companyContext.isCorporateAdmin" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>
              Corporate admin access is required to manage company recommended programs.
            </AlertDescription>
          </Alert>

          <Alert v-else-if="!companyContext.companyId" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>
              Company context was not found in your session. Sign in again and retry.
            </AlertDescription>
          </Alert>

          <div v-if="isLoadingProgramCatalog || isLoadingRecommendedPrograms" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton v-for="index in 6" :key="`program-selection-skeleton-${index}`" class="h-48 w-full" />
          </div>

          <div v-else-if="availablePrograms.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="program in availablePrograms"
              :key="program.id"
              type="button"
              class="rounded-2xl border p-0 text-left transition-all"
              :class="isProgramRecommended(program.id)
                ? 'border-[#a03b93] bg-[#fcf5fa] shadow-[0_18px_48px_-24px_rgba(160,59,147,0.45)]'
                : 'border-[#ead8e6] bg-white hover:border-[#d8abd0]'"
              :disabled="isSavingRecommendedPrograms || !companyContext.companyId || !companyContext.isCorporateAdmin"
              @click="toggleRecommendedProgram(program.id)"
            >
              <div v-if="program.imageUrl" class="h-32 overflow-hidden rounded-t-2xl border-b border-[#f3e4f0] bg-[#f9f3f7]">
                <img :src="program.imageUrl" :alt="program.name" class="h-full w-full object-cover" />
              </div>

              <div class="space-y-4 p-5">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-base font-semibold text-slate-900">{{ program.name }}</p>
                    <p class="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {{ program.description || 'No description provided yet.' }}
                    </p>
                  </div>
                  <Badge :variant="isProgramRecommended(program.id) ? 'default' : 'outline'">
                    {{ isProgramRecommended(program.id) ? 'Selected' : 'Available' }}
                  </Badge>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="focusArea in (program.focusAreas || []).slice(0, 3)"
                    :key="`${program.id}-${focusArea}`"
                    class="rounded-full bg-[#f6eff4] px-2.5 py-1 text-xs text-[#7f2f75]"
                  >
                    {{ focusArea }}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div v-else class="rounded-xl border border-dashed p-10 text-center">
            <p class="text-lg font-semibold">No live programs available</p>
            <p class="mt-2 text-sm text-muted-foreground">
              Once live programs are available, you can select the ones your employees should prioritize.
            </p>
          </div>

          <div class="flex justify-end">
            <Button
              @click="saveRecommendedPrograms"
              :disabled="isSavingRecommendedPrograms || !companyContext.companyId || !companyContext.isCorporateAdmin"
              class="gap-2"
            >
              <Save class="h-4 w-4" />
              {{ isSavingRecommendedPrograms ? 'Saving...' : 'Save Recommended Programs' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Departments Tab -->
    <div v-show="activeTab === 'departments'" class="space-y-6">
      <DepartmentsSettingsTab
        :company-id="companyContext.companyId"
        :can-manage="companyContext.isCorporateAdmin"
      />
    </div>

    <!-- Subscription Tab -->
    <div v-show="activeTab === 'subscription'" class="space-y-6">
      <Card>
        <CardHeader class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Plans</CardTitle>
            <CardDescription>
              Purchase company-funded sessions for {{ companyContext.companyName }}. Every successful payment tops up one shared wallet that admins can allocate across employees.
            </CardDescription>
          </div>
          <Button variant="outline" @click="router.push('/app/admin/billing')">
            Manage Sessions &amp; Billing
          </Button>
        </CardHeader>
      </Card>

      <Alert v-if="plansError" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ plansError }}</AlertDescription>
      </Alert>

      <Alert v-if="!companyContext.isCorporateAdmin" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Corporate admin access is required to purchase company-funded sessions.
        </AlertDescription>
      </Alert>

      <Alert v-else-if="!companyContext.companyId" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Company context was not found in your session. Sign in again and retry.
        </AlertDescription>
      </Alert>

      <div v-if="isLoadingPlans" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton v-for="index in 4" :key="`corporate-plan-skeleton-${index}`" class="h-72 w-full" />
      </div>

      <div v-else-if="corporatePlans.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card
          v-for="plan in corporatePlans"
          :key="plan.id"
          :class="[
            'border bg-white shadow-sm transition-colors',
            isCurrentCorporatePlan(plan)
              ? 'border-[#a03b93] bg-[#fcf5fa] shadow-[0_18px_48px_-24px_rgba(160,59,147,0.55)]'
              : 'border-[#edd3e8]'
          ]"
        >
          <CardHeader class="space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <CardTitle class="text-2xl text-[#7f2f75]">{{ plan.name }}</CardTitle>
                <CardDescription class="mt-2">{{ plan.description }}</CardDescription>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span
                  v-if="isCurrentCorporatePlan(plan)"
                  class="rounded-full bg-[#a03b93] px-3 py-1 text-xs font-semibold text-white"
                >
                  Current Plan
                </span>
                <span class="rounded-full bg-[#f7e6f4] px-3 py-1 text-xs font-medium text-[#7f2f75]">
                  {{ plan.planAudience === 'BOTH' ? 'Corporate + Individual' : 'Corporate' }}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent class="space-y-5">
            <div class="rounded-xl border border-[#edd3e8] bg-[#fcf5fa] p-4">
              <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7e6f4]">
                  <CreditCard class="h-5 w-5 text-[#7f2f75]" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-[#7f2f75]">
                    {{ formatCurrency(Number(plan.cost || 0), plan.currency) }}
                    <span class="text-sm font-normal text-muted-foreground">
                      / session
                    </span>
                  </p>
                  <p class="text-xs text-muted-foreground">
                    One-time corporate purchase. Sessions stay valid until your company uses them.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <Label :for="`session-count-${plan.id}`">Session count</Label>
                <div class="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="h-10 w-10 shrink-0 border-[#e5c5df]"
                    :disabled="!companyContext.companyId || isCreatingInvoice || getCorporateSessionCount(plan.id, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined) <= (plan.minSeats || 1)"
                    @click="adjustCorporateSessionCount(plan.id, -1, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined)"
                  >
                    <Minus class="h-4 w-4" />
                  </Button>
                  <Input
                    :id="`session-count-${plan.id}`"
                    v-model.number="corporateSessionCounts[plan.id]"
                    type="number"
                    inputmode="numeric"
                    :min="plan.minSeats || 1"
                    :max="plan.maxSeats || undefined"
                    :disabled="!companyContext.companyId || isCreatingInvoice"
                    class="text-center"
                    @blur="clampCorporateSessionCount(plan.id, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    class="h-10 w-10 shrink-0 border-[#e5c5df]"
                    :disabled="!companyContext.companyId || isCreatingInvoice || (!!plan.maxSeats && getCorporateSessionCount(plan.id, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined) >= plan.maxSeats)"
                    @click="adjustCorporateSessionCount(plan.id, 1, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined)"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground">
                  Minimum {{ plan.minSeats || 1 }} session<span v-if="(plan.minSeats || 1) !== 1">s</span>
                  <span v-if="plan.maxSeats"> · Maximum {{ plan.maxSeats }} sessions</span>
                </p>
              </div>

              <div class="rounded-lg border border-dashed border-[#e5c5df] bg-white p-4">
                <p class="text-xs uppercase tracking-wide text-[#7f2f75]">Estimated total</p>
                <p class="mt-2 text-xl font-semibold text-[#7f2f75]">
                  {{ formatCurrency((Number(getCorporateSessionCount(plan.id, plan.minSeats, plan.defaultSeats, plan.maxSeats || undefined)) || 0) * Number(plan.cost || 0), plan.currency) }}
                </p>
                <p class="mt-2 text-xs text-muted-foreground">
                  Default {{ plan.defaultSeats || plan.minSeats || 1 }} sessions
                </p>
                <p class="text-xs text-muted-foreground">The shared company wallet is topped up immediately after payment.</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span class="rounded-full bg-gray-100 px-2 py-1">
                <Building2 class="mr-1 inline h-3 w-3" />
                Company-wide wallet
              </span>
              <span class="rounded-full bg-gray-100 px-2 py-1">
                Immediate employee reservation
              </span>
              <span class="rounded-full bg-gray-100 px-2 py-1">
                Invoice-first billing
              </span>
            </div>

            <Button
              class="w-full"
              style="background-color: #a03b93;"
              :disabled="isCreatingInvoice || !companyContext.isCorporateAdmin || !companyContext.companyId"
              @click="handleCorporatePlanAction(plan)"
            >
              {{
                isCreatingInvoice
                  ? 'Preparing invoice...'
                  : getCorporatePlanActionLabel(plan)
              }}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card v-else class="border-dashed">
        <CardContent class="py-12 text-center">
          <p class="text-lg font-semibold">No corporate offers available</p>
          <p class="mt-2 text-sm text-muted-foreground">
            Create or activate a corporate session offer before purchasing sessions for your company.
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Billing Tab -->
    <div v-show="activeTab === 'billing'" class="space-y-6">
      <Alert v-if="billingError" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ billingError }}</AlertDescription>
      </Alert>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="activeTab = 'subscription'">
          <Receipt class="mr-2 h-4 w-4" />
          Buy More Sessions
        </Button>
        <Button variant="outline" @click="refreshBilling" :disabled="isLoadingBilling">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoadingBilling }" />
          Refresh Billing
        </Button>
        <Button
          v-if="managedCompanySubscription?.latestInvoice?.status === 'OPEN' && managedCompanySubscription.latestInvoice.paymentUrl"
          variant="outline"
          @click="goToPaymentUrl(managedCompanySubscription.latestInvoice.paymentUrl)"
        >
          Pay Open Invoice
        </Button>
        <Button variant="outline" @click="router.push('/app/admin/employees')">
          <Users class="mr-2 h-4 w-4" />
          Manage Employee Sessions
        </Button>
      </div>

      <div v-if="isLoadingBilling" class="grid gap-4 lg:grid-cols-3">
        <Skeleton v-for="index in 3" :key="`billing-skeleton-${index}`" class="h-40 w-full" />
      </div>

      <div v-else-if="!companySubscriptions.length" class="rounded-xl border border-dashed p-10 text-center">
        <CreditCard class="mx-auto h-12 w-12 text-muted-foreground" />
        <p class="mt-4 text-lg font-semibold">No company subscription yet</p>
        <p class="mt-2 text-sm text-muted-foreground">
          Purchase company-funded sessions to create a shared wallet and allocate them across employees.
        </p>
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Current Offer</CardDescription>
              <CardTitle>{{ managedCompanySubscription?.planName || '—' }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">
                {{ managedCompanySubscription?.status || '—' }}
                <span v-if="managedCompanyWallet">
                  · {{ formatCurrency(getWalletPricePerSession(managedCompanyPlan), managedCompanyPlan?.currency || 'KES') }} per session
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Wallet Available</CardDescription>
              <CardTitle>
                {{ managedCompanyWallet?.sessionsAvailable || 0 }} sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="mt-3 text-sm text-muted-foreground">
                {{ managedCompanyWallet?.sessionsPurchased || 0 }} purchased lifetime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Reserved For Employees</CardDescription>
              <CardTitle>{{ managedWalletReservedSessions }} sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                {{ managedCompanyWallet?.sessionsReturned || 0 }} sessions returned to the company wallet so far
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Subscriptions</CardTitle>
            <CardDescription>Select a company subscription to review wallet balances and invoice status.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="subscription in companySubscriptions"
              :key="subscription.id"
              class="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              :class="activeCompanySubscriptionId === subscription.id ? 'border-[#a03b93] bg-[#fcf5fa]' : ''"
            >
              <div>
                <p class="font-medium">{{ subscription.planName }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ subscription.companyName }} · {{ subscription.wallet?.sessionsAvailable || 0 }} sessions available
                  · {{ getWalletReservedSessions(subscription.wallet) }} reserved
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline">{{ subscription.status }}</Badge>
                <Button variant="outline" size="sm" @click="selectCompanySubscription(subscription.id)">
                  {{ activeCompanySubscriptionId === subscription.id ? 'Selected' : 'Manage' }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
