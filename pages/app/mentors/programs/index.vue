<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import companyApi, { type CompanyRecommendedProgram } from '@/http/requests/app/company'
import { RoleManager } from '@/utils/roleManager'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-vue-next'

definePageMeta({
  title: 'Programs',
  requiresAuth: true,
  permissions: ['mentors:read']
})

const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const companyRecommendedPrograms = ref<CompanyRecommendedProgram[]>([])
const recommendedProgramsError = ref<string | null>(null)

const canViewPrograms = computed(() =>
  RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view') || true
)

const programs = computed(() => mentorsStore.programs)
const isLoading = computed(() => mentorsStore.programsLoading)
const programsPagination = computed(() => mentorsStore.programsPagination)
const companyContext = computed(() => {
  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile)
        return {
          companyId: parsed?.company?.id || parsed?.companyId || parsed?.company_id || authStore.loggedInUser?.companyId || '',
          companyName: parsed?.company?.name || 'your company',
        }
      } catch {
        return {
          companyId: authStore.loggedInUser?.companyId || '',
          companyName: 'your company',
        }
      }
    }
  }

  return {
    companyId: authStore.loggedInUser?.companyId || '',
    companyName: 'your company',
  }
})
const companyRecommendedProgramIds = computed(() =>
  new Set(companyRecommendedPrograms.value.map(program => program.id))
)
const filteredPrograms = computed(() => {
  const recommendedProgramIds = companyRecommendedProgramIds.value

  return [...programs.value].sort((left, right) => {
    const leftRecommended = recommendedProgramIds.has(left.id) ? 1 : 0
    const rightRecommended = recommendedProgramIds.has(right.id) ? 1 : 0

    if (leftRecommended !== rightRecommended) {
      return rightRecommended - leftRecommended
    }

    return Number(left.orderId || 0) - Number(right.orderId || 0)
  })
})
const hasMorePrograms = computed(() => programsPagination.value.hasNext)
const totalPrograms = computed(() => programsPagination.value.totalItems)

const heroProgram = computed(() =>
  filteredPrograms.value.find(program => companyRecommendedProgramIds.value.has(program.id))
  ?? filteredPrograms.value[0]
  ?? null
)
const hasCompanyRecommendations = computed(() => companyRecommendedPrograms.value.length > 0)

const isCompanyRecommended = (programId: string) =>
  companyRecommendedProgramIds.value.has(programId)

const loadCompanyRecommendedPrograms = async () => {
  if (!companyContext.value.companyId) {
    companyRecommendedPrograms.value = []
    return
  }

  try {
    const response = await companyApi.getRecommendedPrograms(companyContext.value.companyId)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load company recommendations.')
    }

    companyRecommendedPrograms.value = response.data.data?.programs || []
    recommendedProgramsError.value = null
  } catch (error: any) {
    console.error('Failed to load company recommended programs:', error)
    recommendedProgramsError.value =
      error?.response?.data?.message
      || error?.message
      || 'Unable to load company recommended programs.'
  }
}

const viewProgram = (programId: string) => {
  router.push(`/app/mentors/programs/${programId}`)
}

const loadMorePrograms = async () => {
  await mentorsStore.loadMorePrograms()
}

watch(searchQuery, (val) => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(async () => {
    await mentorsStore.loadPrograms({ page: 0, size: 20, searchTerm: val || undefined })
  }, 500)
})

onMounted(async () => {
  if (!canViewPrograms.value) {
    router.push('/app/dashboard')
    return
  }

  await Promise.all([
    mentorsStore.loadPrograms({ page: 0, size: 20 }),
    loadCompanyRecommendedPrograms(),
  ])
})
</script>

<template>
  <div class="page-wrapper">
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Programs</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Discover expert-led programs designed to help you grow professionally and personally
        </p>
        <p v-if="recommendedProgramsError" class="text-xs text-amber-700 mt-2">
          {{ recommendedProgramsError }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search"
            class="pl-9 w-52"
          />
        </div>
      </div>
    </div>

    <div v-if="hasCompanyRecommendations" class="company-recommendations-banner mb-6">
      <p class="company-recommendations-label">Recommended by {{ companyContext.companyName }}</p>
      <h2 class="company-recommendations-title">
        {{ companyRecommendedPrograms.length }} program{{ companyRecommendedPrograms.length === 1 ? '' : 's' }} selected for your learning path
      </h2>
      <div class="company-recommendations-list">
        <button
          v-for="program in companyRecommendedPrograms"
          :key="`recommended-${program.id}`"
          type="button"
          class="company-recommendation-chip"
          @click="viewProgram(program.id)"
        >
          {{ program.name }}
        </button>
      </div>
    </div>

    <!-- Hero Banner (hidden during search) -->
    <div v-if="!searchQuery" class="hero-banner mb-8">
      <!-- Background image (program image or placeholder gradient) -->
      <img
        v-if="heroProgram?.imgUrl"
        :src="heroProgram.imgUrl"
        class="hero-bg-image"
        alt="Featured program"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="hero-overlay" />
      <div class="hero-content">
        <h2 class="text-xl font-bold text-white leading-snug">
          {{ heroProgram?.name ?? 'Explore Our Programs' }}
        </h2>
        <p class="text-sm text-white/80 mt-1 max-w-sm line-clamp-2">
          {{ heroProgram?.tagLine ? heroProgram.tagLine.replace(/"/g, '') : 'Creatively balancing interests to make joint decisions on resource allocation and get the best deal.' }}
        </p>
      </div>
    </div>


    <!-- Search result count -->
    <p v-if="searchQuery && !isLoading" class="text-sm text-muted-foreground mb-4">
      <template v-if="filteredPrograms.length">
        {{ filteredPrograms.length }} result{{ filteredPrograms.length !== 1 ? 's' : '' }} for "<span class="font-medium text-foreground">{{ searchQuery }}</span>"
      </template>
    </p>

    <!-- Loading State -->
    <div v-if="isLoading" class="programs-grid">
      <div v-for="i in 8" :key="i" class="program-card">
        <Skeleton class="w-full aspect-video" />
        <div class="p-4 space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-5/6" />
          <div class="flex gap-2 pt-1">
            <Skeleton class="h-8 w-24 rounded-md" />
            <Skeleton class="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!isLoading && filteredPrograms.length === 0" class="empty-state">
      <Search class="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
      <p class="text-base font-medium text-foreground">No programs found</p>
      <p class="text-sm text-muted-foreground mt-1">
        Try a different search term
      </p>
      <Button variant="outline" size="sm" class="mt-4" @click="searchQuery = ''">
        Clear search
      </Button>
    </div>

    <!-- Programs Grid -->
    <div v-else class="programs-grid">
      <div
        v-for="program in filteredPrograms"
        :key="program.id"
        class="program-card"
        :class="{ 'program-card--recommended': isCompanyRecommended(program.id) }"
        @click="viewProgram(program.id)"
      >
        <!-- Thumbnail -->
        <div class="relative aspect-video overflow-hidden">
          <img
            :src="program.imgUrl"
            :alt="program.name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            @error="($event.target as HTMLImageElement).src = '/images/placeholder-program.jpg'"
          />
          <span v-if="isCompanyRecommended(program.id)" class="recommended-badge">
            Recommended
          </span>
          <span v-if="program.duration" class="duration-badge">
            {{ program.duration }} min
          </span>
        </div>

        <!-- Body -->
        <div class="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 class="font-semibold text-sm leading-snug line-clamp-2">
              {{ program.name }}
            </h3>
            <p v-if="isCompanyRecommended(program.id)" class="text-[11px] font-medium text-[#8a337f] mt-1">
              Selected by {{ companyContext.companyName }}
            </p>
            <p class="text-xs text-muted-foreground mt-1 line-clamp-3">
              {{ (program.tagLine || '').replace(/"/g, '') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-auto">
            <Button
              size="sm"
              class="see-details-btn"
              @click.stop="viewProgram(program.id)"
            >
              See Details
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMorePrograms && !isLoading" class="flex items-center justify-center gap-4 mt-8">
      <Button variant="outline" size="lg" @click="loadMorePrograms">
        Load More
      </Button>
      <span class="text-sm text-muted-foreground">
        Showing {{ programs.length }} of {{ totalPrograms }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 64px 24px;
}

/* ── Hero ── */
.hero-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 220px;
  background: linear-gradient(135deg, #6b21a8 0%, #9333ea 60%, #c026d3 100%);
}

.hero-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(88, 28, 135, 0.75) 0%, rgba(88, 28, 135, 0.35) 100%);
}

.hero-content {
  position: absolute;
  bottom: 28px;
  left: 28px;
}

.company-recommendations-banner {
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: linear-gradient(135deg, #fcf4fa 0%, #fff9fd 100%);
  padding: 20px 22px;
}

.company-recommendations-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a337f;
}

.company-recommendations-title {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
  color: #2d1730;
}

.company-recommendations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.company-recommendation-chip {
  border: 1px solid #d8abd0;
  border-radius: 999px;
  background: #fff;
  color: #8a337f;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
}

/* ── Grid ── */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .programs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .programs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ── Card ── */
.program-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.program-card--recommended {
  border-color: rgba(160, 59, 147, 0.32);
  box-shadow: 0 18px 48px -24px rgba(160, 59, 147, 0.45);
}

.program-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.recommended-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  border-radius: 999px;
  background: rgba(160, 59, 147, 0.94);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 10px;
}

/* Duration badge */
.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  color: #111;
}

/* See Details button */
.see-details-btn {
  background-color: #a03b93;
  color: white;
  font-size: 12px;
  height: 32px;
  padding: 0 14px;
}

.see-details-btn:hover {
  background-color: #882f7c;
}

/* Heart button */
.heart-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e9d5ff;
  color: #7c3aed;
  flex-shrink: 0;
}

.heart-btn:hover {
  background-color: #f3e8ff;
}
</style>
