<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { BookOpen, Compass, RefreshCw, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'My Programs',
  description: 'View the company mentorship programs you are enrolled in',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.view === 'all' ? 'all' : 'mine')

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Dates will be shared when your program is scheduled.'

  const format = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'

  return `${format(startsAt)} - ${format(endsAt)}`
}

const loadPrograms = async () => {
  try {
    await Promise.all([
      companyProgramsStore.loadMyCompanyPrograms(),
      companyProgramsStore.loadCatalogPrograms(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load your programs')
  }
}

const participantTone = (status: string) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const enrolledProgramsByCatalogProgramId = computed(() => {
  const mapping = new Map<string, any>()

  for (const program of companyProgramsStore.employeePrograms) {
    const stageProgramIds = program.catalogStages?.map(stage => stage.programId) || []
    const allProgramIds = stageProgramIds.length ? stageProgramIds : (program.templateProgramId ? [program.templateProgramId] : [])
    for (const programId of allProgramIds) {
      if (!mapping.has(programId)) {
        mapping.set(programId, program)
      }
    }
  }

  return mapping
})

const viewCatalogProgram = (programId: string) => {
  router.push(`/app/mentors/programs/${programId}`)
}

const openEnrolledProgram = () => {
  router.push('/app/employee/journey')
}

watch(activeTab, value => {
  router.replace({
    query: value === 'all' ? { ...route.query, view: 'all' } : { ...route.query, view: undefined },
  })
})

onMounted(() => {
  loadPrograms()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">My Programs</h1>
        <p class="text-sm text-muted-foreground">
          Switch between your employer-sponsored journeys and the wider Prosper program catalog.
        </p>
      </div>

      <Button variant="outline" @click="loadPrograms" :disabled="companyProgramsStore.employeeProgramsLoading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.employeeProgramsLoading }" />
        Refresh
      </Button>
    </div>

    <Alert v-if="companyProgramsStore.employeeProgramsError" variant="destructive">
      <AlertDescription>{{ companyProgramsStore.employeeProgramsError }}</AlertDescription>
    </Alert>

    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList>
        <TabsTrigger value="mine">My Programs</TabsTrigger>
        <TabsTrigger value="all">All Programs</TabsTrigger>
      </TabsList>

      <TabsContent value="mine" class="space-y-4">
        <div v-if="companyProgramsStore.employeeProgramsLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton class="h-56 w-full" />
          <Skeleton class="h-56 w-full" />
          <Skeleton class="h-56 w-full" />
        </div>

        <div v-else-if="!companyProgramsStore.employeePrograms.length" class="rounded-lg border border-dashed p-10 text-center">
          <BookOpen class="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 class="mt-4 text-lg font-medium">No enrolled programs yet</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            When your employer enrolls you into a mentorship program, it will show up here with status and timing.
          </p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card v-for="program in companyProgramsStore.employeePrograms" :key="program.participantId" class="h-full">
            <CardHeader class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <CardTitle class="text-lg">{{ program.name }}</CardTitle>
                  <CardDescription>{{ program.companyName || 'Employer program' }}</CardDescription>
                </div>
                <Badge :variant="participantTone(program.participantStatus)">
                  {{ companyProgramsStore.participantStatusLabel(program.participantStatus) }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-sm text-muted-foreground">
                {{ program.objective || program.targetAudienceDescription || 'Your company has opened this mentorship program for employee growth.' }}
              </p>

              <div class="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                <div class="font-medium text-foreground">Prosper journey</div>
                <div class="mt-1">
                  {{ companyProgramsStore.catalogJourneyLabel(program.catalogStages, program.catalogJourneySummary) }}
                </div>
              </div>

              <div class="space-y-2 text-sm text-muted-foreground">
                <div class="flex items-center gap-2">
                  <Users class="h-4 w-4" />
                  <span>{{ companyProgramsStore.matchingModeLabel(program.matchingMode) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BookOpen class="h-4 w-4" />
                  <span>{{ formatDateRange(program.startsAt, program.endsAt) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <RefreshCw class="h-4 w-4" />
                  <span>Enrolled {{ program.enrolledAt ? new Date(program.enrolledAt).toLocaleDateString() : 'recently' }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="all" class="space-y-4">
        <div v-if="companyProgramsStore.catalogProgramsLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton class="h-56 w-full" />
          <Skeleton class="h-56 w-full" />
          <Skeleton class="h-56 w-full" />
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card v-for="program in companyProgramsStore.catalogPrograms" :key="program.id" class="h-full">
            <CardHeader class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <CardTitle class="text-lg">{{ program.name }}</CardTitle>
                  <CardDescription>
                    {{ enrolledProgramsByCatalogProgramId.get(program.id)?.companyName ? `Employer-sponsored in ${enrolledProgramsByCatalogProgramId.get(program.id)?.companyName}` : 'Prosper catalog' }}
                  </CardDescription>
                </div>
                <Badge :variant="enrolledProgramsByCatalogProgramId.get(program.id) ? 'default' : 'outline'">
                  {{ enrolledProgramsByCatalogProgramId.get(program.id) ? 'Enrolled' : 'Available' }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-sm text-muted-foreground">
                {{ program.description || 'Explore this ProsperMentor program and the mentors attached to it.' }}
              </p>

              <div class="space-y-2 text-sm text-muted-foreground">
                <div class="flex items-center gap-2">
                  <Users class="h-4 w-4" />
                  <span>{{ companyProgramsStore.catalogMentorCount(program) }} mentors attached</span>
                </div>
                <div class="flex items-center gap-2">
                  <Compass class="h-4 w-4" />
                  <span>{{ program.focusAreas?.slice(0, 2).join(', ') || 'General growth program' }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <Button v-if="enrolledProgramsByCatalogProgramId.get(program.id)" variant="outline" size="sm" @click="openEnrolledProgram">
                  Open My Program
                </Button>
                <Button size="sm" @click="viewCatalogProgram(program.id)">
                  View Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
