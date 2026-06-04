<template>
  <div v-if="!copyrightOnly">
    <div class="w-full bg-[#E8EAED]">
      <!-- Desktop: 5 columns -->
      <div class="hidden md:grid md:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] gap-6 lg:gap-12 w-full py-10 px-6 sm:px-8 lg:px-12 xl:px-16" style="font-family: Montserrat, sans-serif;">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-3 mb-4">
            <img src="/prosper-logo.png" alt="Prosper Mentor" class="h-12 w-12 object-contain flex-shrink-0" />
            <div class="flex flex-col leading-tight">
              <span class="font-bold text-[#9F3C93] text-sm uppercase tracking-wide">Prosper</span>
              <span class="font-bold text-[#027F63] text-sm uppercase tracking-wide">Mentor</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm leading-relaxed max-w-xs">
            We are on a mission to provide everyone With accessible mentorship.
          </p>
        </div>

        <div v-for="col in columns" :key="col.title" class="flex flex-col items-start">
          <h4 class="font-bold text-base text-gray-900 mb-3">{{ col.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink :to="link.to" class="text-gray-600 hover:text-[#027F63] transition-colors text-sm">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex flex-col items-start">
          <h4 class="font-bold text-base text-gray-900 mb-3">Contact Us</h4>
          <a href="https://wa.me/254111780160" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-[#027F63] transition-colors text-sm mb-1">
            Via Whatsapp
          </a>
          <a href="mailto:customer@prospermentor.com" class="text-gray-600 hover:text-[#027F63] transition-colors text-sm">
            customer@prospermentor.com
          </a>
        </div>
      </div>

      <!-- Mobile: accordions -->
      <div class="block md:hidden px-6 py-6" style="font-family: Montserrat, sans-serif;">
        <div class="flex items-center gap-3 mb-4">
          <img src="/prosper-logo.png" alt="Prosper Mentor" class="h-12 w-12 object-contain flex-shrink-0" />
          <div class="flex flex-col leading-tight">
            <span class="font-bold text-[#9F3C93] text-sm uppercase">Prosper</span>
            <span class="font-bold text-[#027F63] text-sm uppercase">Mentor</span>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-4">We are on a mission to provide everyone With accessible mentorship.</p>

        <div v-for="col in columns" :key="col.title" class="border-t border-gray-300 pt-4">
          <button
            type="button"
            class="w-full text-left font-bold text-base py-2 flex justify-between items-center text-gray-900"
            @click="toggle(col.key)"
          >
            {{ col.title }}
            <span>{{ openKey === col.key ? '−' : '+' }}</span>
          </button>
          <ul v-if="openKey === col.key" class="space-y-2 pl-0 pb-3">
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink :to="link.to" class="text-gray-600 text-sm hover:text-[#027F63]">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="border-t border-gray-300 pt-4">
          <button
            type="button"
            class="w-full text-left font-bold text-base py-2 flex justify-between items-center text-gray-900"
            @click="toggle('contact')"
          >
            Contact Us
            <span>{{ openKey === 'contact' ? '−' : '+' }}</span>
          </button>
          <div v-if="openKey === 'contact'" class="pl-0 pb-3 space-y-2">
            <a href="https://wa.me/254111780160" target="_blank" rel="noopener noreferrer" class="text-gray-600 text-sm block hover:text-[#027F63]">
              Via Whatsapp
            </a>
            <a href="mailto:customer@prospermentor.com" class="text-gray-600 text-sm block hover:text-[#027F63]">
              customer@prospermentor.com
            </a>
          </div>
        </div>
      </div>
    </div>

    <BottomBar />
  </div>
  <BottomBar v-else />
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { Facebook, Linkedin, Instagram, Twitter, Youtube } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ copyrightOnly?: boolean }>(), { copyrightOnly: false })

const openKey = ref<string | null>(null)
const toggle = (k: string) => (openKey.value = openKey.value === k ? null : k)

const currentYear = new Date().getFullYear()

const columns = [
  {
    key: 'mentors',
    title: 'Mentors',
    links: [
      { label: 'Featured Mentors', to: '/mentors' },
      { label: 'Find By Category', to: '/mentors' },
      { label: 'Become A Mentor', to: '/mentors' },
    ],
  },
  {
    key: 'corporate',
    title: 'Corporate',
    links: [
      { label: 'Featured Mentors', to: '/mentors' },
      { label: 'Find By Category', to: '/mentors' },
      { label: 'Become A Mentor', to: '/mentors' },
    ],
  },
  {
    key: 'services',
    title: 'Services',
    links: [
      { label: 'Mentor Network', to: '/networks' },
      { label: 'Virtual Mentor', to: '/voice' },
      { label: 'Mentor Sessions', to: '/sessions' },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/prospermentor', label: 'Facebook' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/prospermentor/posts/?feedView=all', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/prosper_mentor', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/prosper_mentor', label: 'Twitter' },
  { icon: Youtube, href: 'https://www.youtube.com/@prospermentor', label: 'YouTube' },
]

const BottomBar = () =>
  h('div', { class: 'w-full bg-[#E8EAED] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-300' }, [
    h('p', { class: 'text-sm text-gray-600 order-2 sm:order-1' }, `© Copyright ${currentYear}, Prosper Mentor`),
    h('div', { class: 'flex items-center gap-3 order-1 sm:order-2' }, [
      h('span', { class: 'text-sm text-gray-600 hidden sm:inline' }, 'Follow us on:'),
      ...socialLinks.map((s) =>
        h('a', {
          key: s.label,
          href: s.href,
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': s.label,
          class: 'w-9 h-9 rounded-full flex items-center justify-center text-[#027F63] hover:text-[#026e56] transition-colors',
        }, h(s.icon, { class: 'w-5 h-5', 'stroke-width': 1.5 }))
      ),
    ]),
  ])
</script>
