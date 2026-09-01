<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from '#app'
import { storeToRefs } from 'pinia'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import SocialFooter from '@/components/landing/SocialFooter.vue'
import { useAuthStore } from '@/store/modules/auth'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { RoleManager } from '@/utils/roleManager'
import {
  formatPackagePrice,
  getBookableSessionPackages,
  getPackageDisplayMeta,
  getPlanSessionCount,
  type BookingPricingPlan,
} from '@/utils/bookingPricingPlans'
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'

definePageMeta({ auth: false })

type PricingTab = 'mentee' | 'enterprise'

type MenteePlan = {
  id: string
  code: string
  label: string
  accentLabel?: string
  name: string
  price: string
  amount: number
  currency: string
  subtitle: string
  footnote?: string
  features: string[]
  actionLabel: string
  highlighted?: boolean
}

type FaqItem = {
  question: string
  answer: string
}

const FREE_TRIAL_SIGNUP_PATH = '/auth/signup?audience=mentee&trial=1&product=FREE_TRIAL'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()
const { activePlans, isLoading } = storeToRefs(subscriptionsStore)

const activeTab = ref<PricingTab>('mentee')
const activeFaqIndex = ref(0)
const menteePackagePlans = ref<SubscriptionPlan[]>([])
const isLoadingMenteePlans = ref(false)

const packageStats = [
  { value: '17%', label: 'Average Savings', detail: 'on 10-session packages' },
  { value: '3x', label: 'Progress Rate', detail: 'with consistent accountability', tone: 'purple' },
  { value: '98%', label: 'Completion Rate', detail: 'on structured roadmaps' },
  { value: 'Top', label: 'Priority', detail: 'in mentor scheduling' },
]

const faqs: FaqItem[] = [
  {
    question: 'How much does one session cost?',
    answer: 'Free advice lacks commitment. Prosper Mentors is paid to ensure high-quality mentors, serious mentees, and real outcomes. Mentors are compensated for their time and expertise.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Session packs are purchased upfront, and unused booking credits remain available within the configured validity window.',
  },
  {
    question: 'How are mentors selected?',
    answer: 'Mentors are reviewed for domain expertise, communication quality, availability, and fit with the goals mentees share during onboarding.',
  },
  {
    question: 'Is Prosper Mentors only for tech?',
    answer: 'No. Prosper Mentor supports professionals across business, leadership, product, marketing, operations, technology, and career-transition paths.',
  },
]

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

const rawMenteePlans = computed(() =>
  getBookableSessionPackages(menteePackagePlans.value as unknown as BookingPricingPlan[]),
)

const menteePlans = computed<MenteePlan[]>(() =>
  rawMenteePlans.value.map((plan) => {
    const meta = getPackageDisplayMeta(plan, rawMenteePlans.value)

    return {
      id: plan.id,
      code: plan.code || plan.id,
      label: meta.label,
      accentLabel: meta.accentLabel,
      name: plan.name || meta.label,
      price: formatPackagePrice(plan),
      amount: Number(plan.cost || 0),
      currency: plan.currency || 'KES',
      subtitle: meta.subtitle,
      footnote: meta.footnote,
      features: meta.features,
      actionLabel: meta.actionLabel,
      highlighted: meta.highlighted,
    }
  }),
)

const singleSessionPlan = computed(() =>
  rawMenteePlans.value.find(plan => getPlanSessionCount(plan) === 1),
)

const bestValuePlan = computed(() => {
  const pricedPlans = rawMenteePlans.value
    .map(plan => ({
      plan,
      sessions: getPlanSessionCount(plan),
      amount: Number(plan.cost || 0),
    }))
    .filter(item => item.sessions > 0 && item.amount > 0)
    .sort((a, b) => (a.amount / a.sessions) - (b.amount / b.sessions))

  return pricedPlans[0] || null
})

const standardRateLabel = computed(() => {
  const plan = singleSessionPlan.value
  if (!plan) return 'KES 0'

  return formatPackagePrice(plan)
})

const bestValueRateLabel = computed(() => {
  const best = bestValuePlan.value
  if (!best) return 'KES 0'

  return `${formatCurrencyLabel(best.plan.currency)} ${formatAmount(Math.round(best.amount / best.sessions))}`
})

const maxSavingsLabel = computed(() => {
  const standard = singleSessionPlan.value
  const best = bestValuePlan.value
  if (!standard || !best || best.sessions <= 1) return ''

  const savings = (Number(standard.cost || 0) * best.sessions) - best.amount
  if (savings <= 0) return ''

  return `up to ${formatCurrencyLabel(best.plan.currency || standard.currency)} ${formatAmount(savings)}`
})

const isAuthenticatedCompanyAdmin = computed(() =>
  RoleManager.isCorporateAdmin(authStore.loggedInUser) && Boolean(authStore.loggedInUser?.companyId),
)

const ctaLabel = computed(() =>
  isAuthenticatedCompanyAdmin.value ? 'Manage Billing' : 'Create Company Account',
)

const formatAmount = (amount?: number | string | null) =>
  Number(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })

const formatCurrencyLabel = (value?: string | null) =>
  value?.toUpperCase() === 'KES' ? 'KES' : (value || 'KES')

const getPlanPeriod = (plan: SubscriptionPlan) => {
  if (plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH' || plan.billingType === 'ONE_TIME') {
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

  return [
    'Company-funded mentorship sessions',
    'Employee session allocation',
    'Program setup and mentor matching',
    'Usage, feedback, and outcome reporting',
    'Self-serve billing when your team is ready',
  ]
}

const startFreeTrial = async () => {
  await router.push(FREE_TRIAL_SIGNUP_PATH)
}

const selectMenteePlan = async (plan: MenteePlan) => {
  await router.push({
    path: '/auth/signup',
    query: {
      audience: 'mentee',
      product: plan.code,
      amount: String(plan.amount),
      currency: plan.currency,
      planId: plan.id,
    },
  })
}

const beginEnterpriseSignup = async () => {
  if (isAuthenticatedCompanyAdmin.value) {
    await router.push('/app/admin/billing')
    return
  }

  await router.push('/auth/signup')
}

const toggleFaq = (index: number) => {
  activeFaqIndex.value = activeFaqIndex.value === index ? -1 : index
}

const loadMenteePlans = async () => {
  isLoadingMenteePlans.value = true
  try {
    menteePackagePlans.value = await subscriptionsStore.fetchPlansForAudience('INDIVIDUAL')
  } finally {
    isLoadingMenteePlans.value = false
  }
}

onMounted(() => {
  authStore.initializeFromStorage()
  loadMenteePlans()
  subscriptionsStore.fetchPlans('CORPORATE')
})
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-white text-[#111827]" style="font-family: Montserrat, sans-serif;">
    <PublicSiteHeader />

    <main class="flex-1">
      <section class="bg-white px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-20">
        <div class="mx-auto w-full max-w-[1340px]">
          <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div class="max-w-[720px]">
              <div class="inline-flex border-b border-[#c9cdd2] text-[13px] font-medium text-[#1f2933]">
                <button
                  type="button"
                  class="min-w-[82px] border-b-2 px-4 pb-2 transition"
                  :class="activeTab === 'mentee' ? 'border-[#00856d] text-[#0b3931]' : 'border-transparent hover:text-[#00856d]'"
                  @click="activeTab = 'mentee'"
                >
                  Mentee
                </button>
                <button
                  type="button"
                  class="min-w-[92px] border-b-2 px-4 pb-2 transition"
                  :class="activeTab === 'enterprise' ? 'border-[#00856d] text-[#0b3931]' : 'border-transparent hover:text-[#00856d]'"
                  @click="activeTab = 'enterprise'"
                >
                  Enterprise
                </button>
              </div>

              <p class="mt-8 max-w-[650px] text-[14px] leading-8 text-[#59616f]">
                Personalized mentorship built for lasting impact. Choose a package that aligns with your professional aspirations and commitment level.
              </p>
            </div>

            <div class="w-full max-w-[520px] lg:justify-self-end">
              <div class="rounded-[18px] border-2 border-[#008f78] bg-white px-5 py-4 shadow-sm sm:px-7">
                <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p class="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
                      Try Prosper
                    </p>
                    <p class="text-[20px] font-extrabold leading-tight text-[#070a12]">
                      30 Minutes
                    </p>
                  </div>
                  <button
                    type="button"
                    class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#00856d] px-8 text-[13px] font-bold uppercase text-white transition hover:bg-[#00745f] focus:outline-none focus:ring-2 focus:ring-[#00856d] focus:ring-offset-2"
                    @click="startFreeTrial"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
              <p class="mt-3 text-center text-[10px] font-medium tracking-[0.02em] text-[#4b5563]">
                30 Min 1:1 Session With An Available Mentor
              </p>
            </div>
          </div>

          <section v-if="activeTab === 'mentee'" class="pt-16">
            <div v-if="isLoadingMenteePlans" class="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="index in 4"
                :key="index"
                class="min-h-[430px] animate-pulse rounded-[24px] border border-[#eff1f4] bg-[#f5f7f8]"
              />
            </div>

            <div v-else-if="menteePlans.length" class="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              <article
                v-for="plan in menteePlans"
                :key="plan.code"
                role="button"
                tabindex="0"
                class="group relative flex min-h-[430px] cursor-pointer flex-col rounded-[24px] border px-8 pb-8 pt-9 text-left shadow-[0_20px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-[#00856d] focus:ring-offset-2"
                :class="plan.highlighted ? 'border-[#006f58] bg-[#006f58] text-white xl:-mt-5 xl:min-h-[475px]' : 'border-[#eff1f4] bg-white text-[#111827]'"
                @click="selectMenteePlan(plan)"
                @keydown.enter.prevent="selectMenteePlan(plan)"
                @keydown.space.prevent="selectMenteePlan(plan)"
              >
                <div
                  v-if="plan.highlighted"
                  class="absolute left-1/2 top-0 inline-flex h-8 min-w-[150px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#dd63c4] px-5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white"
                >
                  Most Popular
                </div>

                <div class="flex min-h-[28px] items-center justify-between gap-3">
                  <span
                    class="inline-flex items-center rounded-full px-4 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em]"
                    :class="plan.highlighted ? 'bg-white text-[#4b5563]' : plan.code === 'PACK_10' ? 'bg-[#ffe6f7] text-[#a83291]' : 'bg-[#e5e7eb] text-[#4b5563]'"
                  >
                    {{ plan.label }}
                  </span>
                  <span
                    v-if="plan.accentLabel"
                    class="inline-flex items-center rounded-[5px] px-3 py-1 text-[9px] font-extrabold uppercase"
                    :class="plan.highlighted ? 'bg-white/15 text-white' : 'bg-[#a23da1] text-white'"
                  >
                    {{ plan.accentLabel }}
                  </span>
                </div>

                <h2 class="mt-6 text-[24px] font-bold leading-tight" :class="plan.highlighted ? 'text-white' : 'text-[#111827]'">
                  {{ plan.name }}
                </h2>
                <p class="mt-2 text-[32px] font-extrabold leading-none" :class="plan.highlighted ? 'text-white' : 'text-[#080b12]'">
                  {{ plan.price }}
                </p>
                <p class="mt-3 text-[13px]" :class="plan.highlighted ? 'text-white' : 'text-[#6b7280]'">
                  {{ plan.subtitle }}
                </p>
                <p v-if="plan.footnote" class="mt-2 text-[9px] font-extrabold uppercase text-[#00856d]">
                  {{ plan.footnote }}
                </p>

                <ul class="mt-8 flex flex-1 flex-col gap-4">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center gap-3 text-[13px] font-medium"
                    :class="plan.highlighted ? 'text-white' : 'text-[#374151]'"
                  >
                    <span
                      class="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border text-[10px] leading-none"
                      :class="plan.highlighted ? 'border-white/80 text-white' : 'border-[#00856d] text-[#00856d]'"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <span
                  class="mt-8 inline-flex h-14 w-full items-center justify-center rounded-[14px] text-[14px] font-bold transition"
                  :class="plan.highlighted ? 'bg-white text-[#006f58] group-hover:bg-[#f2fffb]' : 'bg-[#e5e7eb] text-[#111827] group-hover:bg-[#d9dde2]'"
                >
                  {{ plan.actionLabel }}
                </span>
              </article>
            </div>

            <div v-else class="rounded-[18px] border border-[#e4e7ec] bg-[#fafafa] p-8 text-center">
              <h3 class="text-[18px] font-semibold text-[#101828]">
                No mentee packages available
              </h3>
              <p class="mt-2 text-[13px] leading-6 text-[#667085]">
                Session package pricing will appear here once active individual package plans are configured in the backend.
              </p>
            </div>
          </section>

          <section v-else class="pt-16">
            <div class="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p class="text-[12px] font-bold uppercase tracking-[0.08em] text-[#00856d]">
                  Enterprise Plan
                </p>
                <h2 class="mt-3 max-w-[520px] text-[32px] font-bold leading-tight text-[#111827]">
                  Structured mentorship for employees, programs, and HR teams.
                </h2>
                <p class="mt-4 max-w-[520px] text-[14px] leading-7 text-[#667085]">
                  Prosper Mentor helps companies fund structured mentorship sessions, allocate them to employees, and track outcomes from one workspace.
                </p>
              </div>

              <div>
                <div v-if="isLoading" class="h-[430px] animate-pulse rounded-[20px] bg-[#f0f3f2]" />

                <article
                  v-else-if="corporatePlan"
                  class="rounded-[24px] border border-[#e4e7ec] bg-white px-8 py-9 shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                >
                  <span class="inline-flex rounded-full bg-[#00856d] px-4 py-1 text-[10px] font-extrabold uppercase text-white">
                    {{ corporatePlan.name || 'Enterprise' }}
                  </span>
                  <div class="mt-6 flex items-end gap-2">
                    <span class="text-[42px] font-extrabold leading-none text-[#111827]">
                      {{ formatCurrencyLabel(corporatePlan.currency) }} {{ formatAmount(corporatePlan.cost) }}
                    </span>
                    <span class="pb-1 text-[12px] text-[#667085]">
                      {{ getPlanPeriod(corporatePlan) }}
                    </span>
                  </div>
                  <p class="mt-5 max-w-[520px] text-[13px] leading-7 text-[#667085]">
                    {{ getPlanTagline(corporatePlan) }}
                  </p>

                  <ul class="mt-7 grid gap-3 sm:grid-cols-2">
                    <li
                      v-for="feature in getPlanFeatures(corporatePlan)"
                      :key="feature"
                      class="flex items-start gap-3 rounded-[10px] bg-[#f8faf9] px-4 py-3 text-[12px] leading-5 text-[#475467]"
                    >
                      <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00856d]" aria-hidden="true" />
                      <span>{{ feature }}</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    class="mt-8 inline-flex h-12 items-center justify-center rounded-[12px] bg-[#00856d] px-8 text-[13px] font-bold text-white transition hover:bg-[#00745f] disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isLoading"
                    @click="beginEnterpriseSignup"
                  >
                    {{ ctaLabel }}
                  </button>
                </article>

                <div v-else class="rounded-[18px] border border-[#e4e7ec] bg-[#fafafa] p-8 text-center">
                  <h3 class="text-[18px] font-semibold text-[#101828]">
                    No plans available
                  </h3>
                  <p class="mt-2 text-[13px] leading-6 text-[#667085]">
                    Enterprise pricing will appear here once the backend returns an active corporate plan.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article
                v-for="feature in includedFeatures"
                :key="feature.title"
                class="rounded-[14px] border border-[#e6ece9] bg-[#f9fbfa] p-5"
              >
                <h3 class="text-[14px] font-bold text-[#111827]">
                  {{ feature.title }}
                </h3>
                <p class="mt-2 text-[12px] leading-6 text-[#667085]">
                  {{ feature.description }}
                </p>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section v-if="activeTab === 'mentee'" class="bg-[#fafafa] px-5 py-16 sm:px-8 lg:px-10">
        <div class="mx-auto grid w-full max-w-[1120px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 class="text-[26px] font-extrabold text-[#111827]">
              Why invest in <span class="text-[#a23da1]">larger packs?</span>
            </h2>

            <div class="mt-10 flex max-w-[460px] items-center gap-7 rounded-[12px] bg-white px-6 py-5 shadow-sm">
              <div>
                <p class="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8a92a3]">
                  Standard Rate
                </p>
                <p class="mt-1 text-[16px] font-extrabold text-[#111827]">
                  {{ standardRateLabel }} <span class="text-[11px] font-semibold text-[#6b7280]">/ session</span>
                </p>
              </div>
              <div class="h-10 w-px bg-[#e5e7eb]" aria-hidden="true" />
              <div>
                <p class="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#00856d]">
                  Best Value Rate
                </p>
                <p class="mt-1 text-[16px] font-extrabold text-[#00856d]">
                  {{ bestValueRateLabel }} <span class="text-[11px] font-semibold text-[#6b7280]">/ session</span>
                </p>
              </div>
            </div>

            <p class="mt-9 max-w-[560px] text-[13px] leading-7 text-[#667085]">
              Beyond the significant financial savings<span v-if="maxSavingsLabel"> ({{ maxSavingsLabel }})</span>, larger session packs facilitate a deeper mentor-mentee relationship. This long-form engagement allows for comprehensive career strategy, iterative feedback loops, and real transformation that single sessions simply cannot match.
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <article
              v-for="stat in packageStats"
              :key="stat.value"
              class="min-h-[112px] rounded-[14px] bg-white p-6 shadow-sm"
            >
              <p
                class="text-[26px] font-extrabold leading-none"
                :class="stat.tone === 'purple' ? 'text-[#a23da1]' : 'text-[#00856d]'"
              >
                {{ stat.value }}
              </p>
              <p class="mt-2 text-[12px] font-semibold text-[#111827]">
                {{ stat.label }}
              </p>
              <p class="mt-1 text-[11px] leading-5 text-[#667085]">
                {{ stat.detail }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'mentee'" class="bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div class="mx-auto w-full max-w-[960px]">
          <h2 class="text-[28px] font-semibold text-[#111827]">
            Frequently Asked <span class="text-[#00856d]">Questions</span>
          </h2>
          <p class="mt-4 max-w-[560px] text-[12px] leading-5 text-[#475467]">
            Free advice lacks commitment. Prosper Mentors is paid to ensure high-quality mentors, serious mentees, and real outcomes. Mentors are compensated for their time and expertise.
          </p>

          <div class="mt-8 overflow-hidden rounded-[24px] bg-[#f5f5f5] px-7 py-6">
            <article
              v-for="(faq, index) in faqs"
              :key="faq.question"
              class="border-b border-[#e3e5e8] last:border-b-0"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-6 py-6 text-left text-[12px] font-extrabold text-[#111827]"
                @click="toggleFaq(index)"
              >
                <span>{{ faq.question }}</span>
                <span class="text-[14px]" aria-hidden="true">
                  {{ activeFaqIndex === index ? '-' : '+' }}
                </span>
              </button>
              <p
                v-if="activeFaqIndex === index"
                class="max-w-[760px] pb-6 text-[12px] leading-6 text-[#475467]"
              >
                {{ faq.answer }}
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
