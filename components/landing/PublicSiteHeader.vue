<template>
  <header>
    <nav
      class="sticky top-0 z-30 flex w-full items-center justify-between border-b border-brand-purple/10 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-300 sm:px-4 md:px-8 md:py-2.5"
      aria-label="Main navigation"
    >
      <NuxtLink to="/" class="group flex min-h-[52px] flex-shrink-0 items-center" aria-label="Home">
        <img
          src="/prosper-logo.png"
          alt="Prosper Mentor"
          class="h-12 w-20 object-contain drop-shadow-lg sm:h-14 sm:w-24 md:h-16 md:w-28"
        >
      </NuxtLink>

      <div class="ml-auto hidden items-center space-x-2 md:flex">
        <a
          href="https://www.prospermentor.com/mentors"
          class="rounded-full px-4 py-2 text-[12px] font-normal leading-normal text-black transition hover:bg-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          Mentors
        </a>
        <a
          href="https://www.prospermentor.com/programs"
          class="rounded-full px-4 py-2 text-[12px] font-normal leading-normal text-black transition hover:bg-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          Programs
        </a>
        <button
          class="rounded-full px-4 py-2 text-[12px] font-normal leading-normal text-black transition hover:bg-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          @click="go('/about')"
        >
          Insights
        </button>
        <button
          class="rounded-full px-4 py-2 text-[12px] font-normal leading-normal text-black transition hover:bg-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          @click="go('/pricing')"
        >
          Pricing
        </button>
      </div>

      <Sheet v-model:open="navMenuOpen">
        <SheetTrigger as-child>
          <button
            type="button"
            class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-black hover:bg-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-purple md:ml-2"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 9" fill="none" class="shrink-0" aria-hidden="true">
              <line x1="0.5" y1="0.5" x2="11.5" y2="0.5" stroke="currentColor" stroke-linecap="round" />
              <line x1="0.5" y1="4.5" x2="11.5" y2="4.5" stroke="currentColor" stroke-linecap="round" />
              <line x1="0.5" y1="8.5" x2="11.5" y2="8.5" stroke="currentColor" stroke-linecap="round" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent side="right" class="w-[280px] sm:w-[320px]">
          <div class="flex flex-col gap-4 pt-8">
            <span class="text-sm font-semibold uppercase tracking-wide text-gray-500">Menu</span>
            <a
              href="https://www.prospermentor.com/mentors"
              class="text-left text-[12px] font-normal leading-normal text-black hover:underline"
              @click="navMenuOpen = false"
            >
              Mentors
            </a>
            <a
              href="https://www.prospermentor.com/programs"
              class="text-left text-[12px] font-normal leading-normal text-black hover:underline"
              @click="navMenuOpen = false"
            >
              Programs
            </a>
            <button class="py-2 text-left text-[12px] font-normal leading-normal text-black hover:underline" @click="goAndClose('/about')">
              Insights
            </button>
            <button class="py-2 text-left text-[12px] font-normal leading-normal text-black hover:underline" @click="goAndClose('/pricing')">
              Pricing
            </button>
            <div class="my-2 border-t border-gray-200" />
            <span class="text-sm font-semibold uppercase tracking-wide text-gray-500">Account</span>
            <button
              class="w-full rounded-[29px] border-2 border-brand-purple bg-white px-4 py-3 text-center text-sm font-medium text-brand-purple transition hover:bg-brand-purple hover:text-white"
              @click="goAndClose('/auth/login')"
            >
              Sign In
            </button>
            <button
              class="w-full rounded-[29px] border-2 border-brand-purple bg-brand-purple px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white hover:text-brand-purple"
              @click="goAndClose('/auth/signup')"
            >
              Sign Up
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'nuxt/app'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const router = useRouter()
const navMenuOpen = ref(false)

const go = (path: string) => router.push(path)

const goAndClose = (path: string) => {
  navMenuOpen.value = false
  router.push(path)
}
</script>
