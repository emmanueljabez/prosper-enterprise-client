<template>
  <section id="mentors-section" class="relative py-6 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8" aria-label="Mentors">
    <div class="relative z-10 max-w-7xl mx-auto">
      <div class="mb-8 sm:mb-12 flex flex-col items-start text-left">
        <h2
          class="font-heading font-semibold not-italic text-[#027F63] text-[22px] sm:text-[26px] leading-normal"
          style="font-family: Montserrat, sans-serif;"
        >
          Elite Mentor Network
        </h2>
        <p
          class="mt-3 sm:mt-4 text-[#000] font-normal not-italic text-[14px] sm:text-[16px] leading-relaxed max-w-[760px]"
          style="font-family: Montserrat, sans-serif;"
        >
          We curate a select network of accomplished professionals across technology,
          data, business, leadership, and impact sectors. Every mentor on Prosper
          brings proven experience, strong communication ability, and a track record
          of guiding growth.
        </p>
      </div>

      <div
        v-if="displayMentors.length === 0 && loading"
        class="w-full py-10 flex items-center justify-center text-sm text-gray-500"
      >
        Loading mentors…
      </div>

      <div
        v-else-if="displayMentors.length === 0"
        class="w-full py-10 flex items-center justify-center text-sm text-gray-500"
      >
        No mentors available right now.
      </div>

      <div
        v-else
        class="relative w-full overflow-hidden -mx-4 px-4 lg:mx-0 lg:px-0"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <div
          class="mentor-track flex gap-6 py-4"
          :style="{ animationDuration: `${durationSeconds}s`, animationPlayState: paused ? 'paused' : 'running' }"
        >
          <div
            v-for="(mentor, i) in loopedMentors"
            :key="`${mentor.id}-${i}`"
            class="w-[276.928px] h-[456.737px] rounded-[19px] border border-[#E8E8E8] bg-[#FFF] overflow-hidden flex flex-col shrink-0 hover:shadow-lg transition-shadow duration-300"
          >
            <div class="flex justify-center pt-[15.45px] px-[15.45px] flex-shrink-0">
              <div class="w-[246.021px] h-[187.05px] overflow-hidden rounded-t-[10px] bg-gray-200">
                <img
                  :src="mentor.profilePhoto || '/prosper-logo.png'"
                  :alt="`${mentor.name} - Mentor`"
                  class="w-full h-full object-cover object-[center_30%]"
                  loading="lazy"
                />
              </div>
            </div>
            <div class="flex-1 min-h-0 flex flex-col px-[15.45px] pb-4 pt-3">
              <p class="font-semibold text-lg text-brand-purple line-clamp-2 mb-2">{{ mentor.name }}</p>
              <p
                class="text-[#000] line-clamp-3 mb-3 max-w-[210.591px] min-h-[73px] text-[12px] font-light leading-normal"
                style="font-family: Montserrat, sans-serif;"
              >
                {{ mentor.profileSummary || FALLBACK_BIO }}
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="inline-flex flex-col justify-center min-w-[87.395px] min-h-[43.448px] px-2.5 py-1.5 rounded-[10px] bg-[#F7F3F3] gap-0.5">
                  <span class="text-[#027F63] font-light leading-normal text-[9px]" style="font-family: Montserrat, sans-serif;">
                    Expertise
                  </span>
                  <span class="text-[#000] text-xs font-medium truncate max-w-[120px]">{{ primaryExpertise(mentor) }}</span>
                </span>
                <span class="inline-flex flex-col justify-center min-w-[87.395px] min-h-[43.448px] px-2.5 py-1.5 rounded-[10px] bg-[#F7F3F3] gap-0.5">
                  <span class="text-[#027F63] font-light leading-normal text-[9px]" style="font-family: Montserrat, sans-serif;">
                    Location
                  </span>
                  <span class="text-[#000] text-xs font-medium truncate max-w-[120px]">{{ mentor.location || mentor.country || '—' }}</span>
                </span>
              </div>
              <div class="flex items-center gap-2 mt-auto">
                <a
                  :href="`https://www.prospermentor.com/mentor/${mentor.id}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center w-[128.461px] h-[29.672px] rounded-[10px] text-sm font-medium text-white bg-[#027F63] hover:opacity-90 transition-opacity"
                  :aria-label="`Get in touch with ${mentor.name}`"
                >
                  Get in touch
                </a>
                <button
                  type="button"
                  class="flex-shrink-0 p-2 rounded-full bg-brand-purple text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 flex items-center justify-center"
                  :aria-label="favorites.has(mentor.id) ? `Remove ${mentor.name} from favorites` : `Add ${mentor.name} to favorites`"
                  @click="toggleFavorite(mentor.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12.635" height="12.717" viewBox="0 0 13 13" fill="none" class="shrink-0">
                    <path
                      d="M2.33101 7.35789L5.99979 10.8264C6.17821 10.9951 6.45729 10.9951 6.63571 10.8264L10.3045 7.35789C11.3291 6.38916 11.4538 4.80189 10.5928 3.68513L10.4209 3.46211C9.38654 2.12038 7.29992 2.34443 6.574 3.87517C6.47152 4.09128 6.16399 4.09128 6.0615 3.87517C5.33558 2.34443 3.24896 2.12038 2.2146 3.46211L2.04267 3.68513C1.18174 4.80189 1.30635 6.38916 2.33101 7.35789Z"
                      :fill="favorites.has(mentor.id) ? '#FFFFFF' : 'none'"
                      stroke="#FFFFFF"
                      stroke-width="2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMentorsStore } from '@/store/modules/mentors'

const FALLBACK_BIO =
  'A free, interactive space that allows mentors and mentees to connect, share stories, ask questions, and grow together.'

const mentorsStore = useMentorsStore()
const loading = ref(false)
const paused = ref(false)

const displayMentors = computed(() => mentorsStore.mentorProfiles as any[])

const loopedMentors = computed(() => {
  const list = displayMentors.value
  if (list.length === 0) return []
  return [...list, ...list]
})

const durationSeconds = computed(() => Math.max(20, displayMentors.value.length * 6))

const primaryExpertise = (mentor: any) => {
  if (Array.isArray(mentor.expertiseAreas) && mentor.expertiseAreas.length) return mentor.expertiseAreas[0]
  if (Array.isArray(mentor.expertise) && mentor.expertise.length) return mentor.expertise[0]
  return mentor.industry || 'Mentor'
}

const favorites = ref<Set<string>>(new Set())
const toggleFavorite = (id: string) => {
  const next = new Set(favorites.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favorites.value = next
}

onMounted(async () => {
  if (displayMentors.value.length > 0) return
  loading.value = true
  try {
    await mentorsStore.loadMentorProfiles({ page: 0, size: 12 })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mentor-track {
  width: max-content;
  animation-name: mentor-loop-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes mentor-loop-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
