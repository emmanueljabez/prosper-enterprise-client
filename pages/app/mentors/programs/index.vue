<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { 
  Search, 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp,
  Code,
  Briefcase,
  PaintBucket,
  BarChart3,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-vue-next'

definePageMeta({
  title: 'Mentorship Programs',
  description: 'Explore mentorship programs and find the perfect learning path',
  requiresAuth: true,
  permissions: ['mentors:read']
})

// Store and Router
const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const router = useRouter()

// Component State
const searchQuery = ref('')
const selectedCategory = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Check permissions
const canViewPrograms = computed(() => {
  return RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view') || true // Dev bypass
})

// Get data from store
const programs = computed(() => mentorsStore.programs)
const isLoading = computed(() => mentorsStore.programsLoading)
const programsPagination = computed(() => mentorsStore.programsPagination)

// Computed properties - removed client-side filtering since we're doing server-side search
const filteredPrograms = computed(() => programs.value)

const hasMorePrograms = computed(() => programsPagination.value.hasNext)
const totalPrograms = computed(() => programsPagination.value.totalItems)

// Navigation methods
const viewProgram = (programId: string, programName: string) => {
  console.log('🔵 viewProgram called:', { programId, programName })
  console.log('🔵 Target URL:', `/app/mentors/programs/${programId}`)
  try {
    // Navigate to dedicated program details page
    router.push(`/app/mentors/programs/${programId}`)
    console.log('🔵 Navigation initiated successfully')
  } catch (error) {
    console.error('❌ Navigation error:', error)
  }
}

const viewAllMentors = () => {
  router.push('/app/mentors')
}

const loadMorePrograms = async () => {
  await mentorsStore.loadMorePrograms()
}

// Search programs with debounce
const searchPrograms = async () => {
  // Reset to first page when searching
  await mentorsStore.loadPrograms({
    page: 0,
    size: 20,
    searchTerm: searchQuery.value || undefined
  })
}

// Watch search query with debounce
watch(searchQuery, (newValue) => {
  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Set new timeout for debounced search
  searchTimeout.value = setTimeout(async () => {
    await searchPrograms()
  }, 500) // 500ms debounce delay
})

// Initialize component
onMounted(async () => {
  if (!canViewPrograms.value) {
    router.push('/app/dashboard')
    return
  }

  // Load programs from store with pagination
  await mentorsStore.loadPrograms({ page: 0, size: 20 })
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-8">
    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Mentorship Programs</h1>
          <p class="text-muted-foreground">
            Discover structured learning paths with expert mentors in your field
          </p>
        </div>
        
        <Button @click="viewAllMentors" variant="outline" class="gap-2">
          <Users class="h-4 w-4" />
          Browse All Mentors
        </Button>
      </div>

    </div>

    <!-- Search Programs -->
    <section class="space-y-4">
      <div class="max-w-md">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search programs..."
            class="pl-10"
          />
        </div>
      </div>
    </section>

    <!-- All Programs -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold">All Programs</h2>
        <div class="text-sm text-muted-foreground">
          <template v-if="searchQuery">
            {{ filteredPrograms.length }} of {{ programs.length }} programs
          </template>
          <template v-else>
            Showing {{ programs.length }} of {{ totalPrograms }} programs
          </template>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg border overflow-hidden">
          <Skeleton class="aspect-video w-full" />
          <div class="p-6 space-y-4">
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <div class="flex gap-2">
              <Skeleton class="h-5 w-20" />
              <Skeleton class="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>

      <!-- Programs Grid -->
      <div v-else class="space-y-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="program in filteredPrograms"
            :key="program.id"
            class="bg-white rounded-lg border cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group overflow-hidden hover:border-primary/20 active:scale-95"
            @click="viewProgram(program.id, program.name)"
          >
            <div class="aspect-video relative overflow-hidden">
              <img
                :src="program.imgUrl"
                :alt="program.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="$event.target.src = '/images/placeholder-program.jpg'"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <h3 class="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {{ program.name }}
                  </h3>
                  <p class="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {{ (program.tagLine || '').replace(/"/g, '') }}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-2">
                  <div class="flex items-center gap-1">
                    <BookOpen class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm text-muted-foreground">Program</span>
                  </div>
                  <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMorePrograms" class="flex justify-center mt-8">
          <Button
            @click="loadMorePrograms"
            :disabled="isLoading"
            variant="outline"
            size="lg"
          >
            {{ isLoading ? 'Loading...' : 'Load More Programs' }}
          </Button>
          <p class="text-sm text-muted-foreground ml-4 flex items-center">
            Showing {{ programs.length }} of {{ totalPrograms }}
          </p>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}

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

.aspect-video {
  aspect-ratio: 16 / 9;
}
</style> 