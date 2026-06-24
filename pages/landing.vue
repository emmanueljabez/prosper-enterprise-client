<template>
  <div class="landing-page min-h-screen w-full overflow-x-hidden bg-[#FFF] flex flex-col">
    <!-- Skip links -->
    <nav aria-label="Skip links" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50">
      <a href="#main-hero" class="skip-link">Skip to main content</a>
      <a href="#impact-section" class="skip-link ml-2">Skip to Why Enterprise Mentorship Works</a>
      <a href="#mentors-section" class="skip-link ml-2">Skip to mentors</a>
      <a href="#curated-mentor-pool-section" class="skip-link ml-2">Skip to curated mentor pool</a>
      <a href="#footer" class="skip-link ml-2">Skip to footer</a>
    </nav>

    <PublicSiteHeader />

    <!-- Hero (full-bleed) -->
    <div class="flex flex-col" aria-label="Hero">
      <main
        id="main-hero"
        class="relative w-full flex-shrink-0 min-h-[200px] flex items-center overflow-hidden bg-[#d3d3d3] py-4 sm:py-6 aspect-[24/29] lg:aspect-[1728/460] lg:max-h-[460px]"
        aria-label="Hero"
      >
        <!-- Desktop background -->
        <div class="absolute inset-0 z-0 max-lg:hidden">
          <img src="/landing-hero-bg.png" alt="" class="w-full h-full object-cover object-[center_32%]" role="presentation" fetchpriority="high" />
        </div>
        <!-- Mobile background -->
        <div
          class="absolute inset-0 z-0 lg:hidden"
          :style="{
            backgroundImage: `url(/landing-hero-bg.png)`,
            backgroundPosition: 'center 32%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }"
          aria-hidden="true"
        />
        <div class="relative z-10 w-full h-full pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-[253px] lg:pr-8 pt-[clamp(50px,10vh,120px)] pb-6 max-lg:pb-14 lg:pb-6 box-border flex max-lg:justify-center max-lg:items-center">
          <div
            class="flex flex-col text-white max-w-[619px] w-full items-start text-left lg:max-w-[619px] max-lg:items-center max-lg:text-center max-lg:max-w-[308px]"
            style="font-family: var(--font-heading), Montserrat, sans-serif;"
          >
            <h1
              class="text-[#FFF] font-heading font-medium not-italic text-[34px] leading-normal lg:[font-size:clamp(26px,3.5vw,34px)] lg:[line-height:1.219]"
            >
              Mentorship Infrastructure for Organizations
            </h1>
            <p
              class="text-[#FFF] font-heading font-medium not-italic w-full text-lg leading-normal lg:[font-size:clamp(15px,1.6vw,18px)] lg:[line-height:1.22] mt-4 sm:mt-5"
            >
              Build structured, measurable mentorship programs that develop leaders, retain talent, and strengthen communities.
            </p>
            <div class="flex flex-wrap gap-4 items-center mt-6 sm:mt-8 max-lg:justify-center">
              <NuxtLink
                :to="FREE_TRIAL_SIGNUP_PATH"
                class="min-w-[150px] h-[40px] px-5 flex items-center justify-center bg-[#027F63] text-white font-medium text-sm rounded-[29px] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-green active:scale-[0.98]"
                aria-label="Start free trial"
              >
                Start free trial
              </NuxtLink>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Audience strip (full-bleed) -->
    <section class="w-full bg-[#027F63] py-3 px-4" aria-label="Audiences">
      <ul class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-2 text-white font-medium text-[14px] sm:text-[15px]" style="font-family: Montserrat, sans-serif;">
        <li class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
          Churches
        </li>
        <li class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
          Marketers
        </li>
        <li class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
          Industrialists
        </li>
        <li class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
          Start-ups
        </li>
      </ul>
    </section>

    <!-- All post-hero (non full-bleed) sections constrained to one container -->
    <div class="max-w-7xl mx-auto w-full">

      <!-- Logo carousel -->
      <section class="relative flex-shrink-0 pt-8 pb-8 lg:pt-10 lg:pb-10 bg-[#FFF] w-full overflow-hidden" aria-label="Our Mentors Experience">
        <h3
          class="text-center text-[#027F63] font-semibold text-sm sm:text-base mb-6 lg:mb-8"
          style="font-family: Montserrat, sans-serif;"
        >
          Our Mentors Experience
        </h3>
        <LogoLoop
          :logos="FALLBACK_LOGOS"
          :duration-seconds="50"
          direction="left"
          :logo-height="32"
          :gap="80"
          :hover-speed="0"
          fade-out
          fade-out-color="#FFF"
          aria-label="Partner and client logos"
        />
      </section>

      <div class="w-full h-px bg-gray-200 flex-shrink-0" aria-hidden="true" />

      <!-- Why Enterprise Mentorship Works -->
      <section
        id="impact-section"
        class="relative w-full bg-[#FFF] px-3 py-8 sm:px-4 sm:py-10 lg:px-0 lg:py-12"
        aria-label="Why Enterprise Mentorship Works"
      >
        <div class="relative mx-auto w-full max-w-[1220px] overflow-hidden rounded-[28px] bg-white shadow-[0_14px_36px_rgba(28,28,28,0.12)] lg:grid lg:min-h-[470px] lg:grid-cols-[minmax(0,1.42fr)_minmax(380px,0.92fr)]">
          <div class="relative min-h-[320px] overflow-hidden lg:min-h-[470px]">
            <img
              src="/img.png"
              alt=""
              class="absolute inset-0 h-full w-full object-cover object-center"
              aria-hidden="true"
              loading="lazy"
            />

            <div class="absolute inset-x-5 top-1/2 z-10 -translate-y-1/2 rounded-[24px] bg-white px-6 py-7 sm:left-12 sm:right-8 sm:px-9 lg:left-20 lg:right-[-28px] lg:px-11 lg:py-9">
              <h2 class="text-[19px] font-medium leading-normal text-[#202020] sm:text-[21px]" style="font-family: Montserrat, sans-serif;">
                Why Enterprise <span class="font-bold text-[#027F63]">Mentorship Works</span>
              </h2>
              <p class="mt-3 max-w-[650px] text-[13px] font-normal leading-relaxed text-[#1F1F1F] sm:text-[15px]" style="font-family: Montserrat, sans-serif;">
                Practical, structured mentorship helps teams grow faster, stay engaged,
                and perform at a higher level - all while remaining cost-effective.
              </p>
            </div>
          </div>

          <div class="relative z-20 rounded-t-[26px] border border-[#EDEDED] bg-white px-6 py-7 shadow-[0_10px_28px_rgba(0,0,0,0.16)] sm:px-8 lg:-ml-8 lg:rounded-[18px] lg:px-10 lg:py-11">
            <div class="mx-auto max-w-[430px]">
              <h3 class="text-[15px] font-medium text-[#2B2B2B]" style="font-family: Montserrat, sans-serif;">
                Get In <span class="font-bold text-[#027F63]">Touch</span>
              </h3>
              <div class="mt-2 h-px w-11 bg-[#D28BC5]" />

              <p
                v-if="impactSuccess"
                class="mt-6 rounded-[16px] border border-[#027F63]/20 bg-[#027F63]/10 px-4 py-3 text-sm font-medium text-[#027F63]"
                style="font-family: Montserrat, sans-serif;"
              >
                Thanks. We've received your details and will reach out shortly.
              </p>

              <form
                v-else
                class="mt-5 space-y-4 sm:space-y-5"
                @submit.prevent="handleImpactSubmit"
              >
                <label class="block">
                  <span class="sr-only">Full Name</span>
                  <input
                    v-model.trim="impactForm.fullName"
                    type="text"
                    name="impactFullName"
                    autocomplete="name"
                    placeholder="Full Name"
                    class="h-10 w-full border-0 border-b border-[#CFCFCF] bg-transparent px-0 text-[13px] text-[#262626] placeholder:text-[#B6B6B6] focus:border-[#027F63] focus:outline-none focus:ring-0"
                    style="font-family: Montserrat, sans-serif;"
                  >
                </label>

                <label class="block">
                  <span class="sr-only">Company Name</span>
                  <input
                    v-model.trim="impactForm.companyName"
                    type="text"
                    name="impactCompanyName"
                    autocomplete="organization"
                    placeholder="Company Name"
                    class="h-10 w-full border-0 border-b border-[#CFCFCF] bg-transparent px-0 text-[13px] text-[#262626] placeholder:text-[#B6B6B6] focus:border-[#027F63] focus:outline-none focus:ring-0"
                    style="font-family: Montserrat, sans-serif;"
                  >
                </label>

                <label class="block">
                  <span class="sr-only">Email</span>
                  <input
                    v-model.trim="impactForm.email"
                    type="email"
                    name="impactEmail"
                    autocomplete="email"
                    placeholder="Email"
                    class="h-10 w-full border-0 border-b border-[#CFCFCF] bg-transparent px-0 text-[13px] text-[#262626] placeholder:text-[#B6B6B6] focus:border-[#027F63] focus:outline-none focus:ring-0"
                    style="font-family: Montserrat, sans-serif;"
                  >
                </label>

                <label class="block">
                  <span class="sr-only">Phone Number</span>
                  <input
                    v-model.trim="impactForm.phoneNumber"
                    type="tel"
                    name="impactPhoneNumber"
                    autocomplete="tel"
                    placeholder="Phone Number"
                    class="h-10 w-full border-0 border-b border-[#CFCFCF] bg-transparent px-0 text-[13px] text-[#262626] placeholder:text-[#B6B6B6] focus:border-[#027F63] focus:outline-none focus:ring-0"
                    style="font-family: Montserrat, sans-serif;"
                  >
                </label>

                <label class="block">
                  <span class="sr-only">Tell us a little about yourselves</span>
                  <textarea
                    v-model.trim="impactForm.details"
                    name="impactDetails"
                    rows="4"
                    placeholder="Tell us a little about yourselves"
                    class="min-h-[96px] w-full rounded-[14px] border border-[#E8E8E8] px-4 py-3 text-[13px] text-[#262626] placeholder:text-[#B6B6B6] focus:border-[#027F63] focus:outline-none focus:ring-0"
                    style="font-family: Montserrat, sans-serif;"
                  />
                </label>

                <p
                  v-if="impactError"
                  class="text-sm text-[#C63C48]"
                  role="alert"
                  style="font-family: Montserrat, sans-serif;"
                >
                  {{ impactError }}
                </p>

                <button
                  type="submit"
                  :disabled="impactLoading"
                  class="inline-flex min-w-[106px] items-center justify-center rounded-full bg-[#027F63] px-6 py-2 text-[13px] font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#027F63] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  style="font-family: Montserrat, sans-serif;"
                >
                  {{ impactLoading ? 'Submitting...' : 'Submit' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div class="w-full h-px bg-gray-200" aria-hidden="true" />

      <FeaturedMentors />

      <div class="w-full h-px bg-gray-200" aria-hidden="true" />
    </div>

    <!-- Curated Mentor Pool -->
    <section id="curated-mentor-pool-section" class="relative w-full overflow-hidden py-16 sm:py-20 lg:py-28 bg-[#FFF]" aria-label="Curated Mentor Pool">
      <!-- Background decorative shapes -->
      <img src="/img_5.png" alt="" class="absolute top-[8%] -left-[64px] w-[120px] sm:w-[150px] min-[900px]:w-[180px] object-contain pointer-events-none" aria-hidden="true" />
      <img src="/img_7.png" alt="" class="absolute top-[48%] -left-[28px] w-[54px] sm:w-[70px] min-[900px]:w-[82px] object-contain pointer-events-none" aria-hidden="true" />
      <img src="/img_10.png" alt="" class="absolute top-[52%] -right-[52px] w-[110px] sm:w-[140px] min-[900px]:w-[180px] object-contain pointer-events-none" aria-hidden="true" />

      <div class="max-w-6xl mx-auto px-6 sm:px-8 relative z-10 w-full">
        <!-- Header -->
        <div class="text-center max-w-[860px] mx-auto mb-14 sm:mb-[4.5rem] lg:mb-24">
          <h2 class="font-heading font-medium text-[24px] sm:text-[30px] leading-normal mb-5 text-[#000]" style="font-family: Montserrat, sans-serif;">
            What You Get &ndash; <span class="text-[#027F63] font-bold">Curated Mentor Pool</span>
          </h2>
          <p class="text-[#000] font-normal text-[16px] sm:text-[18px] leading-relaxed" style="font-family: Montserrat, sans-serif;">
            With Prosper Mentor Enterprise, your company can quietly strengthen talent, improve performance, and cultivate a culture of continuous growth.
          </p>
        </div>

        <!-- Block 1: Left Image, Right Text -->
        <div class="grid gap-12 min-[900px]:items-center min-[900px]:grid-cols-[minmax(240px,0.85fr)_minmax(380px,1.15fr)] mb-24 min-[900px]:mb-16">
          <!-- Image Container -->
          <div class="relative flex justify-center min-[900px]:justify-end shrink-0">
            <div class="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] min-[900px]:w-[180px] min-[900px]:h-[180px] xl:w-[200px] xl:h-[200px]">
              <!-- Green Circle Background -->
              <img src="/img_8.png" alt="" class="absolute inset-0 w-full h-full object-contain drop-shadow-xl" aria-hidden="true" />
              <!-- Man -->
              <img src="/img_6.png" alt="Curated Mentor" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] xl:w-[108%] max-w-none ml-1 drop-shadow-2xl" />
            </div>
          </div>
          <!-- Text -->
          <div class="w-full text-left max-w-[520px] mx-auto min-[900px]:mx-0 min-[900px]:max-w-[460px] min-[900px]:pt-2">
            <h3 class="font-heading font-medium text-[22px] sm:text-[26px] mb-5 text-[#000]" style="font-family: Montserrat, sans-serif;">
              Personalized <span class="text-[#027F63] font-bold">Excellence</span>
            </h3>
            <p class="text-[#000] font-normal text-[15px] sm:text-[16px] leading-[1.8]" style="font-family: Montserrat, sans-serif;">
              Your organization gains access to a carefully selected network of vetted professionals across technology and engineering, data and analytics, business strategy, product and design, as well as leadership and career development. Every mentor is chosen for real-world experience and proven expertise, ensuring your team learns from people who have successfully navigated the challenges they are facing today.
            </p>
          </div>
        </div>

        <!-- Block 2: Left Text, Right Image -->
        <div class="grid gap-12 min-[900px]:items-end min-[900px]:grid-cols-[minmax(380px,0.95fr)_minmax(240px,1.05fr)]">
          <!-- Text -->
          <div class="w-full text-left flex min-[900px]:justify-start min-[900px]:pt-1">
            <div class="max-w-[520px] mx-auto min-[900px]:mx-0 min-[900px]:max-w-[500px] min-[900px]:pl-6">
              <h3 class="font-heading font-medium text-[22px] sm:text-[26px] mb-5 text-[#000]" style="font-family: Montserrat, sans-serif;">
                Your Company <span class="text-[#9F3C93] font-bold">Deserves More</span>
              </h3>
              <p class="text-[#000] font-normal text-[15px] sm:text-[16px] leading-[1.8]" style="font-family: Montserrat, sans-serif;">
                Rather than a one-size-fits-all approach, Prosper Mentors matches mentors to your team's specific goals, skill gaps, and growth objectives. This ensures every mentorship session is relevant, practical, and aligned with your organization's success.
              </p>
            </div>
          </div>
          <!-- Image Container -->
          <div class="relative flex justify-center min-[900px]:justify-start shrink-0">
            <div class="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] min-[900px]:w-[240px] min-[900px]:h-[240px] xl:w-[260px] xl:h-[260px]">
              <!-- Purple Circle Background -->
              <img src="/img_12.png" alt="" class="absolute inset-0 w-full h-full object-contain drop-shadow-xl" aria-hidden="true" />
              <!-- Woman -->
              <img src="/img_11.png" alt="Tailored Matching" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[112%] xl:w-[110%] max-w-none ml-2 drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto w-full">
      <div class="w-full h-px bg-gray-200" aria-hidden="true" />
    </div>

    <footer id="footer" class="w-full" aria-label="Footer">
      <SocialFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import LogoLoop from '@/components/landing/LogoLoop.vue'
import FeaturedMentors from '@/components/landing/FeaturedMentors.vue'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import SocialFooter from '@/components/landing/SocialFooter.vue'

definePageMeta({ layout: 'default' })

const FREE_TRIAL_SIGNUP_PATH = '/auth/signup?audience=mentee&trial=1&product=FREE_TRIAL'

const FALLBACK_LOGOS = [
  { src: '/client-logos/safaricom.png', alt: 'Safaricom' },
  { src: '/client-logos/strathmore.png', alt: 'Strathmore University' },
  { src: '/client-logos/unilever.png', alt: 'Unilever' },
  { src: '/client-logos/coca-cola.png', alt: 'Coca-Cola' },
  { src: '/client-logos/bat.png', alt: 'BAT' },
  { src: '/client-logos/vodafone.png', alt: 'Vodafone' },
  { src: '/client-logos/danone.png', alt: 'Danone' },
  { src: '/client-logos/airtel.png', alt: 'Airtel' },
]

type ImpactContactForm = {
  fullName: string
  companyName: string
  email: string
  phoneNumber: string
  details: string
}

const initialImpactFormState = (): ImpactContactForm => ({
  fullName: '',
  companyName: '',
  email: '',
  phoneNumber: '',
  details: '',
})

const impactForm = reactive<ImpactContactForm>(initialImpactFormState())
const impactLoading = ref(false)
const impactSuccess = ref(false)
const impactError = ref('')

const resetImpactForm = () => {
  Object.assign(impactForm, initialImpactFormState())
}

const handleImpactSubmit = async () => {
  impactError.value = ''

  if (!impactForm.fullName || !impactForm.companyName || !impactForm.email || !impactForm.phoneNumber) {
    impactError.value = 'Please complete your name, company, email, and phone number.'
    return
  }

  if (!impactForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    impactError.value = 'Please enter a valid email address.'
    return
  }

  impactLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
    impactSuccess.value = true
    resetImpactForm()
  } catch {
    impactError.value = 'Something went wrong. Please try again.'
  } finally {
    impactLoading.value = false
  }
}

onMounted(() => {
  document.body.classList.add('landing-page')
})
onBeforeUnmount(() => {
  document.body.classList.remove('landing-page')
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.skip-link {
  background: #9F3C93;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}
</style>

<style>
body.landing-page {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
}
</style>
