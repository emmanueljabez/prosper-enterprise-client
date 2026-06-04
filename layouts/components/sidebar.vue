<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Zap } from 'lucide-vue-next'
import { useSidebarStore } from '@/store/modules/sidebar'
import { useAuthStore } from '@/store/modules/auth'
import companySubscriptionsApi, {
  type CompanySessionWalletSummary,
  type CompanySubscriptionSummary,
} from '@/http/requests/app/companySubscriptions'
import Navbar from '@/layouts/components/navbar.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const navigation = computed(() => sidebarStore.roleBasedNavigation)
const navigationGroups = computed(() =>
  navigation.value.filter(item => Boolean(item.children?.length)),
)

const isPosPage = computed(() => route.path.includes('/app/inventory/pos'))
const CORPORATE_ROLE_NAMES = new Set(['corporate_admin', 'company_admin', 'company'])

const isCorporateAdminUser = computed(() => {
  const userRoles = authStore.loggedInUser?.roles || []
  const hasCorporateRole = userRoles.some((role: any) => {
    const roleName = String(role?.name || role || '').trim().toLowerCase()
    return CORPORATE_ROLE_NAMES.has(roleName)
  })

  if (hasCorporateRole) {
    return true
  }

  if (typeof window !== 'undefined') {
    const storedRole = String(localStorage.getItem('role') || '').trim().toLowerCase()
    if (CORPORATE_ROLE_NAMES.has(storedRole)) {
      return true
    }
  }

  return route.path.startsWith('/app/admin')
})

const showWalletCard = computed(() => isCorporateAdminUser.value)

const companyLogoUrl = ref('/images/prosper_mentor_logo.png')
const companyId = ref('')
const isLoadingWallet = ref(false)
const billingError = ref<string | null>(null)
const activeCompanySubscription = ref<CompanySubscriptionSummary | null>(null)
const lastLoadedCompanyWalletId = ref('')

const parseStoredJson = (key: string) => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

const resolveCompanyContext = () => {
  const profile = parseStoredJson('profile')
  const loggedInUser = parseStoredJson('loggedInUser')
  const authCompany = authStore.loggedInUser?.company

  companyId.value =
    String(
      profile?.company?.id
      || profile?.company?.companyId
      || profile?.company?.company_id
      || profile?.company?.tenantId
      || profile?.companyId
      || profile?.company_id
      || profile?.tenantId
      || loggedInUser?.company?.id
      || loggedInUser?.company?.companyId
      || loggedInUser?.company?.company_id
      || loggedInUser?.company?.tenantId
      || loggedInUser?.companyId
      || loggedInUser?.company_id
      || loggedInUser?.tenantId
      || authCompany?.id
      || authCompany?.companyId
      || authCompany?.company_id
      || authCompany?.tenantId
      || authStore.loggedInUser?.companyId
      || authStore.loggedInUser?.company?.id
      || authStore.loggedInUser?.tenantId
      || '',
    ).trim()

  companyLogoUrl.value =
    String(
      profile?.company?.logoUrl
      || profile?.company?.logo
      || profile?.companyLogoUrl
      || loggedInUser?.company?.logoUrl
      || loggedInUser?.company?.logo
      || loggedInUser?.companyLogoUrl
      || authCompany?.logoUrl
      || authCompany?.logo
      || '/images/prosper_mentor_logo.png',
    ).trim() || '/images/prosper_mentor_logo.png'
}

const onCompanyLogoError = (event: Event) => {
  const image = event.target as HTMLImageElement | null
  if (!image) {
    return
  }

  image.src = '/images/prosper_mentor_logo.png'
}

const pickPrimarySubscription = (subscriptions: CompanySubscriptionSummary[]) =>
  subscriptions.find(subscription => subscription.status === 'ACTIVE')
  || subscriptions[0]
  || null

const getWalletReservedSessions = (wallet?: CompanySessionWalletSummary | null) =>
  Math.max(0, Number(wallet?.sessionsAllocated || 0) - Number(wallet?.sessionsReturned || 0))

const managedCompanyWallet = computed<CompanySessionWalletSummary | null>(() =>
  activeCompanySubscription.value?.wallet || null,
)

const walletAvailableSessions = computed(() => Number(managedCompanyWallet.value?.sessionsAvailable || 0))
const walletPurchasedSessions = computed(() => Number(managedCompanyWallet.value?.sessionsPurchased || 0))
const walletReservedSessions = computed(() => getWalletReservedSessions(managedCompanyWallet.value))
const walletPricePerSession = computed(() => Number(managedCompanyWallet.value?.pricePerSession || 0))
const hasCompanyWallet = computed(() => Boolean(managedCompanyWallet.value))

const loadWalletSummary = async (force = false) => {
  if (!companyId.value) {
    activeCompanySubscription.value = null
    billingError.value = 'Company wallet unavailable.'
    lastLoadedCompanyWalletId.value = ''
    isLoadingWallet.value = false
    return
  }

  if (
    !force
    && companyId.value === lastLoadedCompanyWalletId.value
    && Boolean(activeCompanySubscription.value)
    && !billingError.value
  ) {
    return
  }

  isLoadingWallet.value = true
  try {
    const response = await companySubscriptionsApi.getCompanySubscriptions(companyId.value)
    if (!response.success) {
      activeCompanySubscription.value = null
      billingError.value = response.message || 'Failed to load wallet summary.'
      return
    }

    activeCompanySubscription.value = pickPrimarySubscription(response.data || [])
    billingError.value = null
    lastLoadedCompanyWalletId.value = companyId.value
  } catch (error) {
    console.error('Failed to load sidebar wallet summary:', error)
    activeCompanySubscription.value = null
    billingError.value = 'Failed to load wallet summary.'
  } finally {
    isLoadingWallet.value = false
  }
}

const isWalletLow = computed(() => walletAvailableSessions.value > 0 && walletAvailableSessions.value <= 20)
const walletStatusMessage = computed(() => {
  if (isLoadingWallet.value) {
    return 'Loading session balance...'
  }

  if (billingError.value) {
    return billingError.value
  }

  if (!hasCompanyWallet.value) {
    return 'No active session wallet yet'
  }

  if (walletAvailableSessions.value === 0 || isWalletLow.value) {
    return 'Top up required soon'
  }

  return ''
})

const formatNumber = (value: number) =>
  new Intl.NumberFormat().format(Math.max(0, Math.trunc(Number(value) || 0)))

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

watch(
  () => route.path,
  newPath => sidebarStore.setActiveRoute(newPath),
  { immediate: true },
)

router.afterEach((to) => {
  sidebarStore.setActiveRoute(to.path)
})

watch(
  () => ({
    isAdminView: showWalletCard.value,
    authCompanyId:
      authStore.loggedInUser?.companyId
      || authStore.loggedInUser?.company?.id
      || authStore.loggedInUser?.company?.companyId
      || '',
    authCompanyLogo:
      authStore.loggedInUser?.company?.logoUrl
      || authStore.loggedInUser?.company?.logo
      || '',
  }),
  async ({ isAdminView }) => {
    resolveCompanyContext()
    if (isAdminView) {
      await loadWalletSummary()
    }
  },
  { immediate: true },
)

watch(
  () => route.path,
  async () => {
    if (!showWalletCard.value) {
      return
    }

    resolveCompanyContext()
    await loadWalletSummary()
  },
)
</script>

<template>
  <div class="layout-container" style="height: 100vh; overflow: hidden; display: flex;">
    <SidebarProvider :style="{ '--sidebar-width': '236px', '--sidebar-width-icon': '236px' }">
      <Sidebar collapsible="none" class="corporate-sidebar bg-background border-r z-50">
        <SidebarContent class="sidebar-content overflow-y-auto px-3 pb-6 pt-7">
          <section class="company-header">
            <img
              :src="companyLogoUrl"
              alt="Company logo"
              class="company-logo"
              @error="onCompanyLogoError"
            />
          </section>

          <section v-if="showWalletCard" class="wallet-card">
            <p class="wallet-label">SESSION WALLET</p>
            <p class="wallet-balance">{{ formatNumber(walletAvailableSessions) }} Sessions</p>
            <p class="wallet-metrics">
              {{ formatNumber(walletReservedSessions) }} reserved
              <span class="wallet-metrics-separator">•</span>
              {{ formatNumber(walletPurchasedSessions) }} purchased
            </p>
            <p class="wallet-price" v-if="hasCompanyWallet">
              {{ formatCurrency(walletPricePerSession) }} per session
            </p>
            <p v-if="walletStatusMessage" class="wallet-message">
              <Zap class="h-4 w-4 shrink-0" />
              {{ walletStatusMessage }}
            </p>
          </section>

          <section class="menu-wrap">
            <template v-for="(group, groupIndex) in navigationGroups" :key="group.title">
              <SidebarGroup class="px-0">
                <SidebarMenu class="gap-1">
                  <SidebarMenuItem v-for="subItem in group.children || []" :key="subItem.title">
                    <NuxtLink
                      :to="subItem.url"
                      class="nav-link"
                      :class="{ 'nav-link-active': subItem.isActive }"
                      @click="() => sidebarStore.setActiveRoute(subItem.url ?? '')"
                    >
                      <component :is="subItem.icon" class="nav-icon" />
                      <span class="nav-label">{{ subItem.title }}</span>
                    </NuxtLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              <div v-if="groupIndex < navigationGroups.length - 1" class="menu-divider" />
            </template>
          </section>
        </SidebarContent>
      </Sidebar>

      <SidebarInset class="flex flex-col h-screen overflow-y-auto">
        <header v-if="!isPosPage" class="sticky top-0 z-10 bg-background shadow-sm border-b">
          <div class="flex items-center h-16 px-4 w-full">
            <Navbar class="flex-1" />
          </div>
        </header>
        <div class="flex-1">
          <NuxtPage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<style scoped>
:deep([data-slot="sidebar-wrapper"]),
:deep([data-sidebar="provider"]) {
  height: 100vh !important;
  overflow: hidden !important;
}

:deep([data-slot="sidebar"]),
:deep([data-sidebar="sidebar"]) {
  width: 236px !important;
  min-width: 236px !important;
  max-width: 236px !important;
  height: 100vh !important;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.company-header {
  padding: 0 6px 4px;
}

.company-logo {
  width: 100%;
  height: 92px;
  object-fit: contain;
  object-position: left;
}

.wallet-card {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 14px;
  padding: 12px;
  color: #fdf8fd;
  background: linear-gradient(135deg, #9a4884 0%, #b74c96 100%);
  box-shadow: 0 16px 24px -22px rgba(154, 72, 132, 0.9);
}

.wallet-card::after {
  content: '';
  position: absolute;
  right: -14px;
  bottom: -20px;
  width: 92px;
  height: 92px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.16);
  transform: rotate(12deg);
}

.wallet-label {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.88);
}

.wallet-balance {
  margin-top: 4px;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 600;
  color: #ffffff;
}

.wallet-message {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.95);
}

.wallet-metrics {
  margin-top: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.wallet-metrics-separator {
  margin: 0 4px;
}

.wallet-price {
  margin-top: 3px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.98);
}

.menu-wrap {
  margin: 2px -16px 0;
}

.menu-divider {
  height: 1px;
  margin: 12px 16px;
  background: #e4e9f2;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 10px 28px;
  min-height: 44px;
  width: 100%;
  border-radius: 0;
  color: #667791;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  border-radius: 0;
  background: transparent;
  transition: background-color 0.15s ease;
}

.nav-link:hover {
  color: #5b6d88;
  background-color: #f6f3f8;
}

.nav-link-active {
  color: #9a4884;
  background-color: #f1edf2;
}

.nav-link-active::before {
  background: #9a4884;
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  stroke-width: 2.2;
}


.nav-label {
  font-size: 12px;
  line-height: 1.2;
  font-weight: 500;
  text-align: left;
}

.nav-link-active .nav-label {
  font-weight: 500;
}

.corporate-sidebar {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
}
</style>
