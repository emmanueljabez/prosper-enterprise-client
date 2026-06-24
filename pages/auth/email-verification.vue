<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#app'
import { Button } from '@/components/ui/button'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

definePageMeta({ auth: false })

const route = useRoute()

const email = computed(() => String(route.query.email || '').trim())
const isFreeTrialFlow = computed(() =>
  String(route.query.product || '').trim().toUpperCase() === 'FREE_TRIAL'
  || String(route.query.trial || '').trim() === '1'
)
const loginLink = computed(() => ({
  path: '/auth/login',
  query: isFreeTrialFlow.value
    ? { audience: 'mentee', trial: '1', product: 'FREE_TRIAL' }
    : {},
}))
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" style="font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;">
    <img
      src="/img_2.jpg"
      alt="ProsperMentor background"
      class="absolute inset-0 h-full w-full object-cover"
    >
    <div class="absolute inset-0 bg-[#0f3f35]/60" />

    <PublicSiteHeader />

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6">
      <section class="w-full max-w-[460px] rounded-[28px] border border-white/30 bg-white/95 p-5 shadow-2xl sm:p-6">
        <div class="grid gap-3 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e7f5] text-[#a03b93]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m5 7 6.2 5.1a1.25 1.25 0 0 0 1.6 0L19 7" />
            </svg>
          </div>

          <p class="text-[24px] font-semibold leading-tight text-[#1f2937]">
            Check your email
          </p>
          <p class="text-[13px] leading-6 text-[#4b5563]">
            We have created your {{ isFreeTrialFlow ? 'mentee' : 'company' }} account{{ email ? ` for ${email}` : '' }}.
            <span v-if="isFreeTrialFlow">Verify your email first, then sign in to choose a mentor for your free trial.</span>
            <span v-else>Verify your email first, then sign in to buy sessions and activate your workspace.</span>
          </p>
        </div>

        <div class="mt-6 grid gap-3">
          <NuxtLink :to="loginLink">
            <Button type="button" class="h-10 w-full rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]">
              Go to login
            </Button>
          </NuxtLink>

          <NuxtLink to="/pricing" class="text-center text-xs text-[#6b7280] underline transition hover:text-[#027F63]">
            Back to pricing
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
