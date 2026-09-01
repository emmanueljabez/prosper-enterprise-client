<script setup lang="ts">
import { ref } from 'vue'
import {
  Check,
  ChevronRight,
  Loader2,
  MessageCircle,
} from 'lucide-vue-next'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import SocialFooter from '@/components/landing/SocialFooter.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { useB2BDemoRequestStore } from '@/store/modules/b2b-demo-requests'

definePageMeta({ auth: false })

type DeliveryModel = {
  number: string
  title: string
  description: string
}

type InclusionItem = {
  title: string
  description: string
}

type InclusionSection = {
  title: string
  items: InclusionItem[]
  addOn?: boolean
}

type SolutionCard = {
  id: string
  badge: string
  badgeTone: 'light' | 'green' | 'pink'
  title: string
  lede: string
  featured?: boolean
  partnershipType: string
  sections: InclusionSection[]
  toggleLabel?: string
}

type ContactForm = {
  fullName: string
  workEmail: string
  organisation: string
  phoneNumber: string
  partnershipType: string
  cohortSize: string
  timeline: string
  details: string
}

const demoRequestStore = useB2BDemoRequestStore()
const { toast } = useToast()
const openInclusions = ref<Record<string, boolean>>({})
const includeInstitutionAssessment = ref(false)
const contactDialogOpen = ref(false)
const contactError = ref('')

const emptyContactForm = (): ContactForm => ({
  fullName: '',
  workEmail: '',
  organisation: '',
  phoneNumber: '',
  partnershipType: '',
  cohortSize: '',
  timeline: '',
  details: '',
})

const contactForm = ref<ContactForm>(emptyContactForm())

const deliveryModels: DeliveryModel[] = [
  {
    number: '1',
    title: 'Prosper-managed',
    description: 'Prosper supplies and manages the mentor pool end-to-end.',
  },
  {
    number: '2',
    title: 'Institution-led',
    description: 'Your team creates and runs its own program with its own mentors, hosted on the Prosper platform.',
  },
  {
    number: '3',
    title: 'Hybrid',
    description: 'Blend Prosper mentors with your own mentor pool, with room to run internal programs alongside Prosper programs.',
  },
]

const solutionCards: SolutionCard[] = [
  {
    id: 'institutional',
    badge: 'Institutions',
    badgeTone: 'light',
    title: 'Institutional Partnership',
    lede: 'For universities and colleges building structured mentorship into the student experience, cohort by cohort.',
    featured: true,
    partnershipType: 'Institution',
    toggleLabel: 'Include assessment package',
    sections: [
      {
        title: 'Core sessions',
        items: [
          {
            title: 'Plenary session (Cohort Circle)',
            description: 'A cohort circle seats the full student cohort with a mentor to explore a shared theme such as career direction, leadership, or professional readiness through facilitated discussion.',
          },
          {
            title: 'Learn & Connect session (2-10 people)',
            description: 'A small-group session with one mentor and 2 to 10 students, blending structured guidance with peer learning and networking.',
          },
          {
            title: 'One-to-one session',
            description: 'A private mentoring session pairing each student with a matched mentor for guidance tailored to their specific goals, challenges, and next steps.',
          },
        ],
      },
      {
        title: 'With assessment',
        addOn: true,
        items: [
          {
            title: 'Personality assessment',
            description: 'A structured personality and competency assessment each student completes to inform mentor matching and build self-awareness ahead of sessions.',
          },
          {
            title: 'Certified feedback session',
            description: 'A one-to-one debrief with an accredited practitioner to interpret assessment results and translate them into practical next steps.',
          },
        ],
      },
      {
        title: 'Also included',
        items: [
          {
            title: 'Platform and tech',
            description: 'Full access to the Prosper Mentor platform for scheduling, tracking, and messaging between mentors and students.',
          },
          {
            title: 'Impact reporting and measurable outcomes',
            description: 'Regular reporting on student engagement, session completion, and program outcomes that your institution can track term over term.',
          },
        ],
      },
    ],
  },
  {
    id: 'corporate',
    badge: 'Corporates',
    badgeTone: 'green',
    title: 'Enterprise Mentorship',
    lede: 'For employers building mentorship into leadership development, retention, and talent programs.',
    partnershipType: 'Corporate',
    sections: [
      {
        title: 'Core sessions',
        items: [
          {
            title: 'Plenary session (Cohort Circle)',
            description: 'A cohort circle seats participating employees with a mentor to explore a shared theme relevant to your workforce, such as leadership, growth, or resilience.',
          },
          {
            title: 'Learn & Connect session (2-10 people)',
            description: 'A small-group session with one mentor and 2 to 10 employees, combining structured guidance with peer exchange and cross-team connection.',
          },
          {
            title: 'One-to-one session',
            description: 'A private mentoring session pairing each employee with a matched mentor for guidance on their role, goals, and development areas.',
          },
        ],
      },
      {
        title: 'Also included',
        items: [
          {
            title: 'Platform and tech',
            description: 'Full access to the Prosper Mentor platform for scheduling, tracking, and messaging between mentors and employees.',
          },
          {
            title: 'Assessment',
            description: 'A personality and competency assessment used to guide mentor matching and build employee self-awareness.',
          },
          {
            title: 'Feedback',
            description: 'A certified feedback session interpreting assessment results with an accredited practitioner.',
          },
          {
            title: 'HR support',
            description: 'Dedicated support for your HR or L&D team to integrate the program into existing talent and performance processes.',
          },
          {
            title: 'Impact reporting and measurable outcomes',
            description: 'Regular reporting on employee engagement, session completion, and program outcomes that HR and L&D teams can track quarter over quarter.',
          },
        ],
      },
    ],
  },
  {
    id: 'grant-funded',
    badge: 'Donor-funded / NGO',
    badgeTone: 'pink',
    title: 'Grant-Funded Programme',
    lede: 'For foundations and NGOs delivering mentorship as part of a funded program, with reporting built in for donors.',
    partnershipType: 'Donor-funded / NGO',
    sections: [
      {
        title: 'Core sessions',
        items: [
          {
            title: 'Plenary session (Cohort Circle)',
            description: 'A cohort circle seats program beneficiaries with a mentor to explore a shared theme tied to the program goals.',
          },
          {
            title: 'Learn & Connect session (2-10 people)',
            description: 'A small-group session with one mentor and 2 to 10 beneficiaries, blending structured guidance with peer support and connection.',
          },
          {
            title: 'One-to-one session',
            description: 'A private mentoring session pairing each beneficiary with a matched mentor for guidance on their specific circumstances and goals.',
          },
        ],
      },
      {
        title: 'Also included',
        items: [
          {
            title: 'Platform and tech',
            description: 'Full access to the Prosper Mentor platform to run, schedule, and track the program end-to-end.',
          },
          {
            title: 'Psychometric and technical assessments',
            description: 'Structured assessments used to guide mentor matching and measure beneficiary growth over the program.',
          },
          {
            title: 'Impact reporting and support',
            description: 'Structured reporting on beneficiary outcomes and engagement, built to support donor and grant reporting requirements.',
          },
        ],
      },
    ],
  },
]

const showContact = (partnershipType = '') => {
  contactDialogOpen.value = true
  contactError.value = ''
  demoRequestStore.clearRequest()

  if (partnershipType) {
    contactForm.value.partnershipType = partnershipType
  }
}

const inclusionKey = (cardId: string, sectionTitle: string, itemTitle: string) =>
  `${cardId}:${sectionTitle}:${itemTitle}`

const toggleInclusion = (key: string) => {
  openInclusions.value[key] = !openInclusions.value[key]
}

const badgeClasses = (tone: SolutionCard['badgeTone'], featured = false) => {
  if (featured) {
    return 'bg-white text-[#016f56]'
  }

  const tones: Record<SolutionCard['badgeTone'], string> = {
    light: 'bg-[#fdf4fb] text-[#dd63c4]',
    green: 'bg-[#e8f6f1] text-[#016f56]',
    pink: 'bg-[#fdf4fb] text-[#dd63c4]',
  }

  return tones[tone]
}

const submitContact = async () => {
  contactError.value = ''

  if (!contactForm.value.fullName || !contactForm.value.workEmail || !contactForm.value.organisation) {
    contactError.value = 'Please add your name, work email, and organisation.'
    return
  }

  try {
    await demoRequestStore.submitRequest({
      ...contactForm.value,
      sourcePage: 'enterprise-pricing',
    })
    toast({
      title: 'Request submitted',
      description: 'We received your request and will follow up with you shortly.',
      variant: 'success',
    })
    contactDialogOpen.value = false
    contactForm.value = emptyContactForm()
  } catch (error: any) {
    contactError.value = error?.message || demoRequestStore.error || 'Failed to submit your request. Please try again.'
  }
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col overflow-x-hidden bg-white text-[#1a1a1a]"
    style="font-family: Montserrat, sans-serif;"
  >
    <PublicSiteHeader />

    <main class="flex-1">
      <section class="bg-white px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div class="mx-auto w-full max-w-[1240px]">
          <div class="max-w-[680px]">
            <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#dd63c4]">
              Solutions
            </p>
            <h1 class="mt-3 text-[30px] font-semibold leading-tight text-[#101828] sm:text-[38px]">
              Enterprise partnership solutions
            </h1>
            <p class="mt-4 text-[14px] leading-7 text-[#4b5563] sm:text-[15px]">
              Structured mentorship built around your institution, workforce, or program. Every solution below is scoped to your needs on an introductory call rather than listed at a fixed public price.
            </p>
          </div>

          <section
            class="mt-8 border-y border-[#d9eee7] bg-[#f5fbf9] py-5"
            aria-labelledby="delivery-models-heading"
          >
            <div class="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <h2
                  id="delivery-models-heading"
                  class="text-[12px] font-bold uppercase tracking-[0.14em] text-[#016f56]"
                >
                  PARTNERSHIP DELIVERY MODELS
                </h2>
                <p class="mt-2 max-w-[520px] text-[13px] leading-6 text-[#475467]">
                  Every partner chooses from the same delivery options. What changes is who runs the mentor side.
                </p>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
                <article
                  v-for="model in deliveryModels"
                  :key="model.number"
                  class="min-h-[126px] rounded-[8px] border border-[#d9eee7] bg-white p-4"
                >
                  <p class="text-[13px] font-bold text-[#016f56]">
                    {{ model.number }}. {{ model.title }}
                  </p>
                  <p class="mt-2 text-[12px] leading-5 text-[#5f6c72]">
                    {{ model.description }}
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section
            class="mt-8 grid gap-5 lg:grid-cols-3"
            aria-label="Enterprise partnership solution types"
          >
            <article
              v-for="card in solutionCards"
              :key="card.id"
              class="flex min-h-[620px] flex-col rounded-[8px] border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
              :class="card.featured ? 'border-[#016f56] bg-[#016f56] text-white' : 'border-[#e5e7eb] bg-white text-[#101828]'"
            >
              <span
                class="inline-flex w-fit rounded-[6px] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em]"
                :class="badgeClasses(card.badgeTone, card.featured)"
              >
                {{ card.badge }}
              </span>
              <h2
                class="mt-4 text-[20px] font-bold leading-tight"
                :class="card.featured ? 'text-white' : 'text-[#101828]'"
              >
                {{ card.title }}
              </h2>
              <p
                class="mt-3 min-h-[72px] text-[13px] leading-6"
                :class="card.featured ? 'text-white/85' : 'text-[#4b5563]'"
              >
                {{ card.lede }}
              </p>

              <div class="mt-2 flex-1">
                <template
                  v-for="section in card.sections"
                  :key="`${card.id}-${section.title}`"
                >
                  <label
                    v-if="section.addOn && card.toggleLabel"
                    :key="`${card.id}-toggle`"
                    class="mb-2 mt-5 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-[8px] px-3 py-2"
                    :class="card.featured ? 'bg-white/10 text-white' : 'bg-[#f8fafc] text-[#101828]'"
                  >
                    <span class="text-[13px] font-semibold">
                      {{ card.toggleLabel }}
                    </span>
                    <input
                      v-model="includeInstitutionAssessment"
                      type="checkbox"
                      class="h-4 w-4 cursor-pointer rounded border-[#d1d5db] text-[#dd63c4] focus:ring-[#dd63c4]"
                    >
                  </label>

                  <div v-if="!section.addOn || includeInstitutionAssessment">
                    <p
                      class="mt-5 text-[11px] font-bold uppercase tracking-[0.12em]"
                      :class="card.featured ? 'text-white/80' : 'text-[#7c8794]'"
                    >
                      {{ section.title }}
                    </p>

                    <div
                      v-for="item in section.items"
                      :key="inclusionKey(card.id, section.title, item.title)"
                      class="border-b last:border-b-0"
                      :class="card.featured ? 'border-white/15' : 'border-[#edf0f2]'"
                    >
                      <button
                        type="button"
                        class="group flex min-h-[46px] w-full items-center justify-between gap-3 py-2 text-left"
                        :aria-expanded="openInclusions[inclusionKey(card.id, section.title, item.title)] ? 'true' : 'false'"
                        @click="toggleInclusion(inclusionKey(card.id, section.title, item.title))"
                      >
                        <span class="flex items-start gap-2 text-[13px] font-bold leading-5">
                          <Check
                            class="mt-0.5 h-4 w-4 shrink-0"
                            :class="card.featured ? 'text-white/80' : 'text-[#016f56]'"
                            aria-hidden="true"
                          />
                          <span>{{ item.title }}</span>
                        </span>
                        <span
                          class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                          :class="card.featured ? 'bg-white text-[#016f56]' : 'bg-[#e8f6f1] text-[#016f56]'"
                        >
                          <ChevronRight
                            class="h-4 w-4 transition"
                            :class="openInclusions[inclusionKey(card.id, section.title, item.title)] ? 'rotate-90' : ''"
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                      <p
                        v-if="openInclusions[inclusionKey(card.id, section.title, item.title)]"
                        class="mb-3 ml-6 text-[12px] leading-6"
                        :class="card.featured ? 'text-white/80' : 'text-[#5f6c72]'"
                      >
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </template>
              </div>

              <button
                type="button"
                class="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] text-[14px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#dd63c4] focus:ring-offset-2"
                :class="card.featured ? 'bg-white text-[#016f56] hover:bg-[#fdf4fb]' : 'border border-[#d1d5db] bg-[#f8fafc] text-[#101828] hover:border-[#dd63c4] hover:text-[#dd63c4]'"
                @click="showContact(card.partnershipType)"
              >
                <MessageCircle class="h-4 w-4" aria-hidden="true" />
                Contact Us
              </button>
            </article>
          </section>
        </div>
      </section>

    </main>

    <Dialog :open="contactDialogOpen" @update:open="contactDialogOpen = $event">
      <DialogContent class="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle class="text-[#101828]">
            Tell us about your organisation
          </DialogTitle>
          <DialogDescription class="text-[#4b5563]">
            Share a few details and our team will follow up with the right partnership next step.
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-5" @submit.prevent="submitContact">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Full name</span>
              <input
                v-model.trim="contactForm.fullName"
                type="text"
                autocomplete="name"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#9ca3af] focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
                placeholder="Jane Doe"
              >
            </label>

            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Work email</span>
              <input
                v-model.trim="contactForm.workEmail"
                type="email"
                autocomplete="email"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#9ca3af] focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
                placeholder="jane@company.com"
              >
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Organisation</span>
              <input
                v-model.trim="contactForm.organisation"
                type="text"
                autocomplete="organization"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#9ca3af] focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
                placeholder="Company, university, or NGO"
              >
            </label>

            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Phone number</span>
              <input
                v-model.trim="contactForm.phoneNumber"
                type="tel"
                autocomplete="tel"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#9ca3af] focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
                placeholder="+254700000000"
              >
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Partnership type</span>
              <select
                v-model="contactForm.partnershipType"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
              >
                <option value="">
                  Select one
                </option>
                <option value="Institution">
                  Institution
                </option>
                <option value="Corporate">
                  Corporate
                </option>
                <option value="Donor-funded / NGO">
                  Donor-funded / NGO
                </option>
              </select>
            </label>

            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Cohort size</span>
              <select
                v-model="contactForm.cohortSize"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
              >
                <option value="">
                  Select size
                </option>
                <option value="1-50">
                  1-50
                </option>
                <option value="51-200">
                  51-200
                </option>
                <option value="201-500">
                  201-500
                </option>
                <option value="500+">
                  500+
                </option>
              </select>
            </label>

            <label class="block">
              <span class="text-[12px] font-semibold text-[#667085]">Timeline</span>
              <select
                v-model="contactForm.timeline"
                class="mt-2 h-11 w-full rounded-[8px] border border-[#d1d5db] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
              >
                <option value="">
                  Select timing
                </option>
                <option value="This month">
                  This month
                </option>
                <option value="This quarter">
                  This quarter
                </option>
                <option value="Next quarter">
                  Next quarter
                </option>
                <option value="Exploring options">
                  Exploring options
                </option>
              </select>
            </label>
          </div>

          <label class="block">
            <span class="text-[12px] font-semibold text-[#667085]">What would you like to cover?</span>
            <textarea
              v-model.trim="contactForm.details"
              rows="5"
              class="mt-2 min-h-[120px] w-full rounded-[8px] border border-[#d1d5db] px-3 py-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#9ca3af] focus:border-[#016f56] focus:ring-2 focus:ring-[#016f56]/20"
              placeholder="Tell us about your cohort, timeline, and goals."
            />
          </label>

          <p
            v-if="contactError"
            class="rounded-[8px] border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-[13px] font-medium text-[#b42318]"
            role="alert"
          >
            {{ contactError }}
          </p>

          <DialogFooter class="gap-3 sm:justify-between">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-5 text-[14px] font-bold text-[#344054] transition hover:border-[#016f56] hover:text-[#016f56] focus:outline-none focus:ring-2 focus:ring-[#dd63c4] focus:ring-offset-2"
              @click="contactDialogOpen = false"
            >
              Close
            </button>

            <button
              type="submit"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#016f56] px-5 text-[14px] font-bold text-white transition hover:bg-[#016f56] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#dd63c4] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="demoRequestStore.isLoading"
            >
              <Loader2 v-if="demoRequestStore.isLoading" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <MessageCircle v-else class="h-4 w-4" aria-hidden="true" />
              {{ demoRequestStore.isLoading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <footer id="footer" class="w-full" aria-label="Footer">
      <SocialFooter />
    </footer>
  </div>
</template>
