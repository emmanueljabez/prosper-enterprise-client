<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from '#app'
import { storeToRefs } from 'pinia'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import SocialFooter from '@/components/landing/SocialFooter.vue'
import { useAuthStore } from '@/store/modules/auth'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { RoleManager } from '@/utils/roleManager'
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'

definePageMeta({ auth: false })

const router = useRouter()
const authStore = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()
const { activePlans, isLoading } = storeToRefs(subscriptionsStore)

const includedFeatures = [
  {
    title: 'Company-funded session balance',
    description: 'Purchase sessions centrally and allocate them to employees as programs launch or grow.',
  },
  {
    title: 'Program and mentor pool access',
    description: 'Build journeys from Prosper Mentor programs, available mentors, or a curated mix of both.',
  },
  {
    title: 'Flexible employee allocation',
    description: 'Top up employees before enrollment, during a journey, or after extra support is approved.',
  },
  {
    title: 'WhatsApp-first quality reviews',
    description: 'Track structured mentor and mentee feedback after sessions through the primary WhatsApp flow.',
  },
]

const corporatePlans = computed(() =>
  activePlans.value.filter(plan => plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH'),
)

const corporatePlan = computed(() => {
  const enterprisePlan = corporatePlans.value.find((plan) => {
    const searchable = `${plan.name || ''} ${plan.code || ''}`.toLowerCase()
    return searchable.includes('enterprise') || searchable.includes('corporate')
  })

  return enterprisePlan || corporatePlans.value[0] || null
})

const isAuthenticatedCompanyAdmin = computed(() =>
  RoleManager.isCorporateAdmin(authStore.loggedInUser) && Boolean(authStore.loggedInUser?.companyId),
)

const ctaLabel = computed(() =>
  isAuthenticatedCompanyAdmin.value ? 'Manage Billing' : 'Create Company Account',
)

const currencyLabel = (value?: string | null) => {
  if (!value) return 'Ksh'
  return value.toUpperCase() === 'KES' ? 'Ksh' : value
}

const formatAmount = (amount?: number | string | null) =>
  Number(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })

const isCorporatePlan = (plan: SubscriptionPlan) =>
  plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH'

const getPlanPeriod = (plan: SubscriptionPlan) => {
  if (isCorporatePlan(plan) || plan.billingType === 'ONE_TIME') {
    return 'Per session'
  }

  return 'Per month'
}

const getPlanTagline = (plan: SubscriptionPlan) =>
  plan.description || 'Designed for structured progress, accountability, and measurable mentorship outcomes.'

const getPlanFeatures = (plan: SubscriptionPlan) => {
  const planFeatureNames = (plan.planFeatures || [])
    .filter(feature => feature.enabled || feature.available)
    .map(feature => feature.feature?.name)
    .filter(Boolean) as string[]

  if (planFeatureNames.length) {
    return planFeatureNames.slice(0, 5)
  }

  if (Array.isArray(plan.features) && plan.features.length) {
    return plan.features.slice(0, 5)
  }

  if (isCorporatePlan(plan)) {
    return [
      'Company-funded mentorship sessions',
      'Employee session allocation',
      'Program setup and mentor matching',
      'Usage, feedback, and outcome reporting',
      'Self-serve billing when your team is ready',
    ]
  }

  return [
    'Structured mentorship sessions',
    'Access to vetted mentors',
    'Goal tracking and progress support',
    'Post-session feedback',
  ]
}

const beginSignup = async () => {
  if (isAuthenticatedCompanyAdmin.value) {
    await router.push('/app/admin/billing')
    return
  }

  await router.push('/auth/signup')
}

onMounted(() => {
  authStore.initializeFromStorage()
  subscriptionsStore.fetchPlans('CORPORATE')
})
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-white" style="font-family: Montserrat, sans-serif;">
    <PublicSiteHeader />

    <main class="flex-1 bg-white text-[#101828]">
      <section class="relative isolate min-h-[253px] overflow-hidden bg-[#651f61] text-white">
        <img
          src="/pricing-hero-bg.png"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
        <div class="absolute inset-0 bg-[#651f61]/80" aria-hidden="true" />
        <div class="relative z-10 mx-auto flex min-h-[253px] w-full max-w-[1160px] flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <p class="text-[12px] font-semibold leading-normal text-white/80">
            Pricing that adapts with your growth
          </p>
          <h1 class="mt-2 max-w-[740px] text-[30px] font-normal leading-tight text-white sm:text-[38px] lg:text-[42px]">
            Find the right plan for your needs
          </h1>
        </div>
      </section>

      <section class="relative isolate overflow-hidden bg-white px-6 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24">
        <div class="pointer-events-none absolute left-[-44px] top-[240px] hidden h-[82px] w-[126px] rotate-[18deg] bg-[#2f876f] md:block" style="border-radius: 54% 46% 42% 58% / 48% 44% 56% 52%;" aria-hidden="true" />
        <div class="pointer-events-none absolute left-[148px] top-[206px] hidden h-[92px] w-[106px] rotate-[11deg] bg-[#2f876f] md:block" style="border-radius: 53% 47% 44% 56% / 43% 54% 46% 57%;" aria-hidden="true" />
        <div class="pointer-events-none absolute left-[104px] top-[392px] hidden h-[92px] w-[108px] rotate-[34deg] bg-[#2f876f] md:block" style="border-radius: 49% 51% 42% 58% / 44% 48% 52% 56%;" aria-hidden="true" />
        <div class="pointer-events-none absolute right-[112px] top-[210px] hidden h-[92px] w-[94px] rotate-[-34deg] bg-[#a4439b] md:block" style="border-radius: 58% 42% 54% 46% / 48% 58% 42% 52%;" aria-hidden="true" />
        <div class="pointer-events-none absolute right-[-4px] top-[315px] hidden h-[92px] w-[122px] rotate-[-18deg] bg-[#651f61] md:block" style="border-radius: 50% 50% 56% 44% / 52% 44% 56% 48%;" aria-hidden="true" />
        <div class="pointer-events-none absolute right-[86px] top-[442px] hidden h-[86px] w-[108px] rotate-[34deg] bg-[#82487f] md:block" style="border-radius: 52% 48% 42% 58% / 48% 52% 48% 52%;" aria-hidden="true" />

        <div class="relative z-10 mx-auto w-full max-w-[1080px]">
          <div class="mx-auto flex w-full max-w-[760px] flex-col gap-5">
            <div>
              <h2 class="text-[16px] font-semibold text-[#2f765e]">
                Enterprise Plan
              </h2>
              <p class="mt-2 max-w-[700px] text-[12px] font-medium leading-relaxed text-[#343434]">
                Prosper Mentor helps companies fund structured mentorship sessions, allocate them to employees, and track outcomes from one workspace.
              </p>
            </div>
          </div>

          <div
            v-if="isLoading"
            class="mx-auto mt-14 grid w-full max-w-[360px]"
          >
            <div class="h-[420px] animate-pulse rounded-[14px] bg-[#f0f0f0]" />
          </div>

          <div
            v-else-if="corporatePlan"
            class="mx-auto mt-14 grid w-full max-w-[360px]"
          >
            <article
              class="flex min-h-[420px] flex-col rounded-[14px] border border-[#e4e7ec] bg-white px-7 py-8 text-center text-[#101828] shadow-[0_12px_22px_rgba(16,24,40,0.12)] transition duration-200 hover:-translate-y-1"
            >
              <div class="flex justify-center">
                <span class="inline-flex min-w-[104px] items-center justify-center rounded-full bg-[#a4439b] px-4 py-1 text-[9px] font-bold text-white">
                  {{ corporatePlan.name || 'Enterprise' }}
                </span>
              </div>

              <div class="mt-6 flex justify-center">
                <div class="relative inline-flex items-start">
                  <span class="text-[46px] font-bold leading-none sm:text-[50px]">
                    {{ formatAmount(corporatePlan.cost) }}
                  </span>
                  <span class="ml-1 mt-2 text-[8px] font-semibold text-[#2f876f]">
                    {{ currencyLabel(corporatePlan.currency) }}
                  </span>
                </div>
              </div>
              <p class="mt-1 text-[8px] text-[#667085]">
                {{ getPlanPeriod(corporatePlan) }}
              </p>

              <p class="mx-auto mt-5 max-w-[250px] text-[11px] leading-relaxed text-[#475467]">
                {{ getPlanTagline(corporatePlan) }}
              </p>

              <p class="mt-8 text-[12px] font-bold">
                What you get:
              </p>

              <ul class="mx-auto mt-4 flex w-full max-w-[270px] flex-1 flex-col items-center gap-2">
                <li
                  v-for="feature in getPlanFeatures(corporatePlan)"
                  :key="feature"
                  class="flex w-full items-start gap-2 text-left text-[11px] leading-5 text-[#475467]"
                >
                  <span class="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#101828]" aria-hidden="true" />
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="mt-5 flex h-12 w-full items-center justify-center rounded-[8px] bg-[#a4439b] text-[12px] font-normal text-white transition hover:bg-[#8d3387] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading"
                @click="beginSignup"
              >
                {{ ctaLabel }}
              </button>
            </article>
          </div>

          <div v-else class="mx-auto mt-14 max-w-[640px] rounded-[8px] border border-[#e4e7ec] bg-[#fafafa] p-8 text-center">
            <h3 class="text-[18px] font-semibold text-[#101828]">No plans available</h3>
            <p class="mt-2 text-[13px] leading-6 text-[#667085]">
              Enterprise pricing will appear here once the backend returns an active corporate plan.
            </p>
          </div>
        </div>
      </section>

      <section class="border-y border-[#e6e1d6] bg-[#fbfaf5] px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div class="mx-auto grid w-full max-w-[1080px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p class="text-[12px] font-semibold uppercase text-[#2f765e]">
              What is included
            </p>
            <h2 class="mt-4 max-w-[420px] text-[30px] font-semibold leading-tight text-[#231126]">
              Everything HR needs to run mentorship with control.
            </h2>
            <p class="mt-4 max-w-[420px] text-[14px] leading-7 text-[#5f6673]">
              A single corporate plan covers program setup, session allocation, feedback status, and reporting.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="feature in includedFeatures"
              :key="feature.title"
              class="rounded-[8px] border border-[#e8e1dd] bg-white p-5"
            >
              <h3 class="text-[15px] font-semibold text-[#231126]">
                {{ feature.title }}
              </h3>
              <p class="mt-2 text-[12px] leading-6 text-[#667085]">
                {{ feature.description }}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer id="footer" class="w-full" aria-label="Footer">
      <SocialFooter />
    </footer>
  </div>
</template>
