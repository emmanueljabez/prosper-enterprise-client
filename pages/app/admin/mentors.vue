<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Mentoring',
  description: 'Corporate mentor pool and matching operations',
  requiresAuth: true,
  permissions: ['admin:mentors'],
})

type MentorRow = {
  id: string
  name: string
  email: string
  profilePhoto?: string | null
  title: string
  company: string
  expertiseAreas: string[]
  isVerified: boolean
  isAvailable: boolean
  totalSessions: number
  averageRating: number
  companyId?: string | null
  source?: string | null
  isCompanyMentor?: boolean
}

const router = useRouter()
const mentorsStore = useMentorsStore()
const {
  mentorProfiles,
  mentorProfilesLoading,
  mentorProfilesError,
  mentorProfilesPagination,
} = storeToRefs(mentorsStore)

const searchTerm = ref('')
const activeMentorTab = ref<'prosper' | 'company'>('prosper')

const normalizeArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(item => String(item).trim()).filter(Boolean)
    : []

const normalizeMentor = (mentor: any): MentorRow => {
  const name = String(
    mentor.name
    || `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim()
    || mentor.email
    || 'Mentor',
  ).trim()

  return {
    id: String(mentor.id || mentor.profileId || mentor.userId || name),
    name,
    email: String(mentor.email || 'Email unavailable'),
    profilePhoto: mentor.profilePhoto || mentor.avatarUrl || null,
    title: String(mentor.title || mentor.industry || 'Professional Mentor'),
    company: String(mentor.company || mentor.location || mentor.country || 'Independent'),
    expertiseAreas: normalizeArray(mentor.expertiseAreas?.length ? mentor.expertiseAreas : mentor.expertise),
    isVerified: Boolean(mentor.isVerified),
    isAvailable: mentor.isAvailable !== false,
    totalSessions: Number(mentor.totalSessions || mentor.sessionCount || 0),
    averageRating: Number(mentor.averageRating || mentor.rating || 0),
    companyId: mentor.companyId || mentor.company_id || mentor.company?.id || null,
    source: mentor.source || null,
    isCompanyMentor: Boolean(mentor.isCompanyMentor || mentor.companyMentor),
  }
}

const mentorRows = computed(() => mentorProfiles.value.map(normalizeMentor))
const companyMentors = computed(() =>
  mentorRows.value.filter(mentor =>
    Boolean(
      mentor.companyId
      || mentor.isCompanyMentor
      || String(mentor.source || '').toLowerCase() === 'company',
    ),
  ),
)
const totalMentors = computed(() => Number(mentorProfilesPagination.value.totalItems || mentorRows.value.length))
const verifiedMentors = computed(() => mentorRows.value.filter(mentor => mentor.isVerified).length)
const availableMentors = computed(() => mentorRows.value.filter(mentor => mentor.isAvailable).length)
const ratedMentors = computed(() => mentorRows.value.filter(mentor => mentor.averageRating > 0))
const averageRating = computed(() => {
  if (!ratedMentors.value.length) return '0.0'

  const totalRating = ratedMentors.value.reduce((total, mentor) => total + mentor.averageRating, 0)
  return (totalRating / ratedMentors.value.length).toFixed(1)
})

const pageNumber = computed(() => Number(mentorProfilesPagination.value.currentPage || 0) + 1)
const totalPages = computed(() => Math.max(Number(mentorProfilesPagination.value.totalPages || 1), 1))
const canGoBack = computed(() => Boolean(mentorProfilesPagination.value.hasPrevious))
const canGoNext = computed(() => Boolean(mentorProfilesPagination.value.hasNext))
const visibleMentors = computed(() => activeMentorTab.value === 'company' ? companyMentors.value : mentorRows.value)
const activeMentorCount = computed(() => activeMentorTab.value === 'company' ? companyMentors.value.length : totalMentors.value)
const showPagination = computed(() => activeMentorTab.value === 'prosper')

const selectMentorTab = (tab: 'prosper' | 'company') => {
  activeMentorTab.value = tab
}

const loadMentors = async (page = 0) => {
  await mentorsStore.loadMentorProfiles({
    page,
    size: mentorProfilesPagination.value.pageSize || 20,
    searchTerm: searchTerm.value.trim() || undefined,
  })
}

const runSearch = () => loadMentors(0)

const clearSearch = () => {
  searchTerm.value = ''
  loadMentors(0)
}

const goToPreviousPage = () => {
  if (canGoBack.value) {
    loadMentors(Math.max(Number(mentorProfilesPagination.value.currentPage || 0) - 1, 0))
  }
}

const goToNextPage = () => {
  if (canGoNext.value) {
    loadMentors(Number(mentorProfilesPagination.value.currentPage || 0) + 1)
  }
}

const openMatchingWorkspace = () => {
  router.push('/app/admin/matches')
}

const openProgramWorkspace = () => {
  router.push('/app/admin/programs')
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PM'

const formatExpertise = (mentor: MentorRow) =>
  mentor.expertiseAreas.length
    ? mentor.expertiseAreas.slice(0, 3).join(', ')
    : 'Expertise pending'

const formatRating = (value: number) => value > 0 ? value.toFixed(1) : 'Unrated'

onMounted(() => {
  loadMentors()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-sm font-medium text-muted-foreground">Corporate Admin</p>
        <h1 class="text-2xl font-semibold tracking-tight">Mentoring</h1>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage the mentor pool used by company programs, matching reviews, and employee mentoring journeys.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="openProgramWorkspace">
          <Users class="h-4 w-4" />
          Company Programs
        </Button>
        <Button @click="openMatchingWorkspace">
          <GitBranch class="h-4 w-4" />
          Mentor Matching
        </Button>
      </div>
    </div>

    <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border bg-background p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase text-muted-foreground">Mentor Pool</p>
          <Users class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="mt-3 text-2xl font-semibold">{{ totalMentors.toLocaleString() }}</p>
      </div>

      <div class="rounded-lg border bg-background p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase text-muted-foreground">Verified</p>
          <ShieldCheck class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="mt-3 text-2xl font-semibold">{{ verifiedMentors.toLocaleString() }}</p>
      </div>

      <div class="rounded-lg border bg-background p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase text-muted-foreground">Available</p>
          <UserCheck class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="mt-3 text-2xl font-semibold">{{ availableMentors.toLocaleString() }}</p>
      </div>

      <div class="rounded-lg border bg-background p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase text-muted-foreground">Avg Rating</p>
          <BadgeCheck class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="mt-3 text-2xl font-semibold">{{ averageRating }}</p>
      </div>
    </section>

    <section class="rounded-lg border bg-background">
      <Tabs v-model="activeMentorTab" class="space-y-4 p-4">
        <div class="program-workspace-toolbar">
          <div class="program-view-toggle" aria-label="Mentor sections">
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeMentorTab === 'prosper' }"
              @click="selectMentorTab('prosper')"
            >
              Prosper Mentors
              <span>{{ totalMentors.toLocaleString() }}</span>
            </button>
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeMentorTab === 'company' }"
              @click="selectMentorTab('company')"
            >
              Company Mentors
              <span>{{ companyMentors.length.toLocaleString() }}</span>
            </button>
          </div>

          <div class="program-toolbar-actions">
            <div class="relative program-search">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="searchTerm"
                class="pl-9"
                placeholder="Search mentors"
                @keyup.enter="runSearch"
              />
            </div>
            <Button variant="outline" @click="runSearch" :disabled="mentorProfilesLoading">
              <Search class="h-4 w-4" />
              Search
            </Button>
            <Button variant="ghost" @click="clearSearch" :disabled="mentorProfilesLoading || !searchTerm">
              Clear
            </Button>
            <Button variant="outline" size="icon" @click="loadMentors(mentorProfilesPagination.currentPage || 0)" :disabled="mentorProfilesLoading">
              <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': mentorProfilesLoading }" />
            </Button>
          </div>
        </div>

        <Alert v-if="mentorProfilesError" variant="destructive" class="mb-4">
          <AlertDescription>{{ mentorProfilesError }}</AlertDescription>
        </Alert>

        <TabsContent value="prosper" class="space-y-4">
          <div class="mentor-section-heading">
            <div>
              <h2 class="text-base font-semibold">Prosper Mentors</h2>
              <p class="text-sm text-muted-foreground">Platform mentor directory available for company program matching.</p>
            </div>
            <Badge variant="secondary">{{ activeMentorCount.toLocaleString() }} mentors</Badge>
          </div>

          <div v-if="mentorProfilesLoading" class="prosper-mentor-card-grid">
            <div v-for="row in 8" :key="row" class="rounded-lg border bg-background p-4">
              <Skeleton class="aspect-[4/3] w-full rounded-md" />
              <div class="mt-4 space-y-3">
                <Skeleton class="h-5 w-2/3" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-4/5" />
                <Skeleton class="h-10 w-full" />
              </div>
            </div>
          </div>

          <div v-else-if="!visibleMentors.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No Prosper mentors found for the current filters.
          </div>

          <div v-else class="prosper-mentor-card-grid">
            <article
              v-for="mentor in visibleMentors"
              :key="mentor.id"
              class="flex h-full flex-col overflow-hidden rounded-lg border bg-background transition hover:border-[#d8b6d2] hover:shadow-sm"
            >
              <div class="relative aspect-[4/3] bg-[#f6edf4]">
                <img
                  v-if="mentor.profilePhoto"
                  :src="mentor.profilePhoto"
                  :alt="mentor.name"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-3xl font-semibold text-[#a03b93]">
                  {{ initials(mentor.name) }}
                </div>
              </div>

              <div class="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 class="text-sm font-semibold leading-snug text-[#a03b93]">{{ mentor.name }}</h3>
                  <p class="mt-1 text-xs text-muted-foreground">{{ mentor.title }}</p>
                </div>

                <p class="line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {{ formatExpertise(mentor) }}
                </p>

                <div class="flex flex-wrap gap-2">
                  <Badge :variant="mentor.isVerified ? 'success' : 'outline'">
                    {{ mentor.isVerified ? 'Verified' : 'Unverified' }}
                  </Badge>
                  <Badge :variant="mentor.isAvailable ? 'info' : 'warning'">
                    {{ mentor.isAvailable ? 'Available' : 'Needs review' }}
                  </Badge>
                </div>

                <div class="mt-auto grid grid-cols-2 gap-2 text-xs">
                  <div class="rounded-md bg-muted px-3 py-2">
                    <span class="block text-muted-foreground">Sessions</span>
                    <span class="font-semibold text-foreground">{{ mentor.totalSessions.toLocaleString() }}</span>
                  </div>
                  <div class="rounded-md bg-muted px-3 py-2">
                    <span class="block text-muted-foreground">Rating</span>
                    <span class="font-semibold text-foreground">{{ formatRating(mentor.averageRating) }}</span>
                  </div>
                </div>

                <Button variant="outline" class="w-full" @click="openMatchingWorkspace">
                  Review matches
                  <ArrowRight class="h-4 w-4" />
                </Button>
              </div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="company" class="space-y-4">
          <div class="mentor-section-heading">
            <div>
              <h2 class="text-base font-semibold">Company Mentors</h2>
              <p class="text-sm text-muted-foreground">Mentors already attached to your company programs or private mentor pool.</p>
            </div>
            <Badge variant="secondary">{{ companyMentors.length.toLocaleString() }} mentors</Badge>
          </div>

          <div v-if="mentorProfilesLoading" class="flex flex-col gap-3">
            <Skeleton v-for="row in 5" :key="row" class="h-16 w-full rounded-lg" />
          </div>

          <div v-else-if="!visibleMentors.length" class="rounded-lg border border-dashed p-8 text-center">
            <h3 class="text-lg font-medium">No company mentors yet</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Assign mentors through Mentor Matching or create company programs to build this list.
            </p>
            <Button class="mt-4" @click="openMatchingWorkspace">
              <Plus class="h-4 w-4" />
              Add new
            </Button>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead class="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="mentor in visibleMentors" :key="mentor.id">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <img
                      v-if="mentor.profilePhoto"
                      :src="mentor.profilePhoto"
                      :alt="mentor.name"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {{ initials(mentor.name) }}
                    </div>
                    <div>
                      <p class="font-medium">{{ mentor.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ mentor.email }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p class="font-medium">{{ mentor.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatExpertise(mentor) }}</p>
                </TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-2">
                    <Badge :variant="mentor.isVerified ? 'success' : 'outline'">
                      {{ mentor.isVerified ? 'Verified' : 'Unverified' }}
                    </Badge>
                    <Badge :variant="mentor.isAvailable ? 'info' : 'warning'">
                      {{ mentor.isAvailable ? 'Available' : 'Needs review' }}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{{ mentor.totalSessions.toLocaleString() }}</TableCell>
                <TableCell>{{ formatRating(mentor.averageRating) }}</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" @click="openMatchingWorkspace">
                    Review matches
                    <ArrowRight class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <div v-if="showPagination" class="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-muted-foreground">
            Page {{ pageNumber }} of {{ totalPages }}
          </p>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="goToPreviousPage" :disabled="!canGoBack || mentorProfilesLoading">
              <ChevronLeft class="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" @click="goToNextPage" :disabled="!canGoNext || mentorProfilesLoading">
              Next
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </section>
  </div>
</template>

<style scoped>
.program-workspace-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 1024px) {
  .program-workspace-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.program-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.program-search {
  flex: 1 1 220px;
  min-width: 220px;
}

@media (min-width: 1024px) {
  .program-search {
    width: 332px;
  }
}

.program-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: #fff;
  padding: 6px;
}

.program-view-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 13px;
  color: #6b5b6a;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  padding: 0 18px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.program-view-tab span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 24px;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 12px;
  padding: 0 8px;
}

.program-view-tab--active {
  background: #a03b93;
  color: white;
}

.program-view-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.mentor-section-heading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prosper-mentor-card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (min-width: 768px) {
  .mentor-section-heading {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
