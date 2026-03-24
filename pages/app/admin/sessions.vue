<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Separator } from '~/components/ui/separator'
import {
  Download,
  RefreshCw,
  Search,
  Clock,
  Users,
  Calendar,
  Video,
  Phone,
  MessageCircle,
  Star,
  Eye,
} from 'lucide-vue-next'
import companyApi, { type CompanySessionRecord } from '~/http/requests/app/company'
import { useAppToast } from '~/composables/services/toastService'
import { useAuthStore } from '~/store/modules/auth'

definePageMeta({
  title: 'Session Monitoring',
  description: 'Track and analyze mentorship sessions across your organization',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending_approval' | 'in_progress'
type Platform = 'zoom' | 'google-meet' | 'teams' | 'phone' | 'chat' | 'unknown'

type SessionRow = {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail?: string | null
  department: string
  mentorId: string
  mentorName: string
  status: SessionStatus
  platform: Platform
  platformLabel: string
  scheduledStart: string
  scheduledEnd: string
  durationMin: number
  rating?: number
  cost?: number
  currency?: string | null
  paid?: boolean | null
}

const authStore = useAuthStore()
const isLoading = ref(true)
const error = ref<string | null>(null)
const sessions = ref<SessionRow[]>([])
const showDetails = ref(false)
const selected = ref<SessionRow | null>(null)
const { error: toastError } = useAppToast()

const companyId = computed(() => {
  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsedProfile = JSON.parse(rawProfile)
        return parsedProfile?.company?.id || parsedProfile?.companyId || parsedProfile?.company_id || ''
      } catch {
        return authStore.loggedInUser?.companyId || ''
      }
    }
  }

  return authStore.loggedInUser?.companyId || ''
})

const q = ref('')
const dept = ref('all')
const status = ref<'all' | SessionStatus>('all')
const platform = ref<'all' | Platform>('all')
const mentor = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

const departments = computed(() => ['all', ...new Set(sessions.value.map(session => session.department))])
const mentors = computed(() => ['all', ...new Set(sessions.value.map(session => session.mentorName))])

const filtered = computed(() => {
  const start = dateFrom.value ? new Date(dateFrom.value) : null
  const end = dateTo.value ? new Date(dateTo.value) : null
  if (end) {
    end.setHours(23, 59, 59, 999)
  }

  const query = q.value.trim().toLowerCase()

  return sessions.value.filter(session => {
    const inDept = dept.value === 'all' || session.department === dept.value
    const inStatus = status.value === 'all' || session.status === status.value
    const inPlatform = platform.value === 'all' || session.platform === platform.value
    const inMentor = mentor.value === 'all' || session.mentorName === mentor.value
    const inQuery = !query || [
      session.employeeName,
      session.employeeEmail || '',
      session.mentorName,
      session.department,
    ].some(value => value.toLowerCase().includes(query))
    const startTime = new Date(session.scheduledStart)
    const inDateRange = (!start || startTime >= start) && (!end || startTime <= end)

    return inDept && inStatus && inPlatform && inMentor && inQuery && inDateRange
  })
})

const kpiTotal = computed(() => filtered.value.length)
const kpiCompleted = computed(() => filtered.value.filter(session => session.status === 'completed').length)
const kpiUpcoming = computed(() => filtered.value.filter(session => ['scheduled', 'confirmed', 'pending_approval'].includes(session.status)).length)
const kpiPendingApprovals = computed(() => filtered.value.filter(session => session.status === 'pending_approval').length)
const kpiCancelledRate = computed(() => {
  const total = filtered.value.length || 1
  const cancelled = filtered.value.filter(session => session.status === 'cancelled' || session.status === 'no_show').length
  return Math.round((cancelled / total) * 100)
})
const kpiAvgRating = computed(() => {
  const rated = filtered.value.filter(session => typeof session.rating === 'number')
  if (rated.length === 0) return 0

  const sum = rated.reduce((runningTotal, session) => runningTotal + (session.rating || 0), 0)
  return Math.round((sum / rated.length) * 10) / 10
})
const kpiAvgDuration = computed(() => {
  if (!filtered.value.length) return 0
  const sum = filtered.value.reduce((runningTotal, session) => runningTotal + session.durationMin, 0)
  return Math.round(sum / filtered.value.length)
})

const openDetails = (row: SessionRow) => {
  selected.value = row
  showDetails.value = true
}

const normalizeStatus = (statusValue?: string | null): SessionStatus => {
  switch (String(statusValue || '').trim().toUpperCase()) {
    case 'PENDING':
      return 'pending_approval'
    case 'CONFIRMED':
      return 'confirmed'
    case 'SCHEDULED':
      return 'scheduled'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'cancelled'
    case 'NO_SHOW':
      return 'no_show'
    case 'IN_PROGRESS':
      return 'in_progress'
    default:
      return 'scheduled'
  }
}

const normalizePlatform = (platformValue?: string | null): Platform => {
  switch (String(platformValue || '').trim().toUpperCase()) {
    case 'GOOGLE_MEET':
      return 'google-meet'
    case 'ZOOM':
      return 'zoom'
    case 'TEAMS':
    case 'MICROSOFT_TEAMS':
      return 'teams'
    case 'PHONE':
    case 'PHONE_CALL':
      return 'phone'
    case 'CHAT':
      return 'chat'
    default:
      return 'unknown'
  }
}

const normalizeSession = (session: CompanySessionRecord): SessionRow => {
  const platformValue = normalizePlatform(session.platform)
  const scheduledStart = session.scheduledStart || new Date().toISOString()
  const scheduledEnd = session.scheduledEnd || scheduledStart
  const durationMin = Number.isFinite(Number(session.durationMin))
    ? Number(session.durationMin)
    : Math.max(0, Math.round((new Date(scheduledEnd).getTime() - new Date(scheduledStart).getTime()) / 60000))
  const parsedCost = session.cost == null || session.cost === '' ? undefined : Number(session.cost)

  return {
    id: session.id,
    employeeId: session.employeeId,
    employeeName: session.employeeName || 'Employee',
    employeeEmail: session.employeeEmail || null,
    department: session.department || 'General',
    mentorId: session.mentorId,
    mentorName: session.mentorName || 'Mentor',
    status: normalizeStatus(session.status),
    platform: platformValue,
    platformLabel: session.platformDisplayName || platformLabel(platformValue),
    scheduledStart,
    scheduledEnd,
    durationMin,
    rating: typeof session.rating === 'number' ? session.rating : undefined,
    cost: Number.isFinite(parsedCost) ? parsedCost : undefined,
    currency: session.currency || null,
    paid: session.paid ?? null,
  }
}

const extractErrorMessage = (caughtError: any, fallback: string) =>
  caughtError?.response?.data?.message || caughtError?.message || fallback

const fetchSessions = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    error.value = 'Company ID not found for the current user'
    isLoading.value = false
    sessions.value = []
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await companyApi.getCompanySessions(resolvedCompanyId)
    sessions.value = (response.data.data?.sessions || []).map(normalizeSession)
  } catch (caughtError: any) {
    const message = extractErrorMessage(caughtError, 'Failed to load company sessions')
    error.value = message
    sessions.value = []
    toastError(message)
  } finally {
    isLoading.value = false
  }
}

const exportCsv = () => {
  const rows = filtered.value
  const header = ['Session ID', 'Employee', 'Employee Email', 'Department', 'Mentor', 'Status', 'Platform', 'Start', 'End', 'Duration (min)', 'Rating', 'Cost', 'Currency', 'Paid']
  const lines = rows.map(row => [
    row.id,
    row.employeeName,
    row.employeeEmail || '',
    row.department,
    row.mentorName,
    statusLabel(row.status),
    row.platformLabel,
    row.scheduledStart,
    row.scheduledEnd,
    String(row.durationMin),
    row.rating ?? '',
    row.cost ?? '',
    row.currency ?? '',
    row.paid == null ? '' : row.paid ? 'Yes' : 'No',
  ])
  const csv = [header, ...lines]
    .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'company-sessions.csv'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchSessions()
})

const statusVariant = (value: SessionStatus) => {
  switch (value) {
    case 'confirmed':
      return 'secondary'
    case 'scheduled':
      return 'outline'
    case 'completed':
      return 'default'
    case 'cancelled':
    case 'no_show':
      return 'destructive'
    case 'pending_approval':
    case 'in_progress':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const statusLabel = (value: SessionStatus) => {
  switch (value) {
    case 'pending_approval':
      return 'Pending Approval'
    case 'no_show':
      return 'No-show'
    case 'in_progress':
      return 'In Progress'
    default:
      return value.charAt(0).toUpperCase() + value.slice(1)
  }
}

const platformIcon = (value: Platform) => ({
  zoom: Video,
  'google-meet': Video,
  teams: Video,
  phone: Phone,
  chat: MessageCircle,
  unknown: Video,
}[value] || Video)

const platformLabel = (value: Platform) => {
  switch (value) {
    case 'google-meet':
      return 'Google Meet'
    case 'teams':
      return 'Microsoft Teams'
    case 'phone':
      return 'Phone'
    case 'chat':
      return 'Chat'
    case 'zoom':
      return 'Zoom'
    default:
      return 'Unknown'
  }
}

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatCost = (row: SessionRow) => {
  if (row.cost == null) {
    return '—'
  }

  const currency = row.currency || 'USD'
  return `${currency} ${row.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Session Monitoring</h1>
        <p class="text-muted-foreground">Monitor mentorship sessions booked by employees in your company.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="gap-2" @click="exportCsv" :disabled="isLoading">
          <Download class="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" class="gap-2" @click="fetchSessions" :disabled="isLoading">
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-2"><CardDescription>Total Sessions</CardDescription></CardHeader>
        <CardContent class="flex items-center justify-between"><span class="text-3xl font-bold">{{ kpiTotal }}</span><Calendar class="h-5 w-5 text-muted-foreground" /></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription>Completed</CardDescription></CardHeader>
        <CardContent class="flex items-center justify-between"><span class="text-3xl font-bold">{{ kpiCompleted }}</span><Star class="h-5 w-5 text-muted-foreground" /></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription>Upcoming</CardDescription></CardHeader>
        <CardContent class="flex items-center justify-between"><span class="text-3xl font-bold">{{ kpiUpcoming }}</span><Clock class="h-5 w-5 text-muted-foreground" /></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription>Cancel/No-show Rate</CardDescription></CardHeader>
        <CardContent class="flex items-center justify-between"><span class="text-3xl font-bold">{{ kpiCancelledRate }}%</span><Users class="h-5 w-5 text-muted-foreground" /></CardContent>
      </Card>
      <Card class="md:col-span-2">
        <CardHeader class="pb-2"><CardDescription>Average Rating</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ kpiAvgRating }}</CardContent>
      </Card>
      <Card class="md:col-span-2">
        <CardHeader class="pb-2"><CardDescription>Average Duration (min)</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ kpiAvgDuration }}</CardContent>
      </Card>
      <Card class="lg:col-span-4">
        <CardHeader class="pb-2"><CardDescription>Pending Approvals</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ kpiPendingApprovals }}</CardContent>
      </Card>
    </div>

    <Card>
      <CardContent class="space-y-4 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div class="relative lg:w-1/3">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="q" placeholder="Search employee, mentor, department" class="pl-9" />
          </div>
          <div class="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <Select v-model="dept">
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="department in departments" :key="department" :value="department">
                  {{ department === 'all' ? 'All Departments' : department }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="mentor">
              <SelectTrigger><SelectValue placeholder="Mentor" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="mentorName in mentors" :key="mentorName" :value="mentorName">
                  {{ mentorName === 'all' ? 'All Mentors' : mentorName }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="status">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No-show</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="platform">
              <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="google-meet">Google Meet</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="text-sm text-muted-foreground">From</label>
            <Input v-model="dateFrom" type="date" />
          </div>
          <div>
            <label class="text-sm text-muted-foreground">To</label>
            <Input v-model="dateTo" type="date" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive"><AlertDescription>{{ error }}</AlertDescription></Alert>

    <Card>
      <CardHeader>
        <CardTitle>All Sessions</CardTitle>
        <CardDescription>Filtered results: {{ filtered.length }} of {{ sessions.length }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-3">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div v-else>
          <Table>
            <TableCaption v-if="filtered.length === 0">No sessions found for current filters.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead class="text-right">Duration</TableHead>
                <TableHead class="text-right">Rating</TableHead>
                <TableHead class="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in filtered" :key="row.id" class="cursor-pointer hover:bg-muted/50" @click="openDetails(row)">
                <TableCell class="font-medium">
                  <div>{{ row.employeeName }}</div>
                  <div v-if="row.employeeEmail" class="text-xs text-muted-foreground">{{ row.employeeEmail }}</div>
                </TableCell>
                <TableCell>{{ row.department }}</TableCell>
                <TableCell>{{ row.mentorName }}</TableCell>
                <TableCell>{{ fmt(row.scheduledStart) }}</TableCell>
                <TableCell>{{ fmt(row.scheduledEnd) }}</TableCell>
                <TableCell>
                  <Badge :variant="statusVariant(row.status) as any">{{ statusLabel(row.status) }}</Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <component :is="platformIcon(row.platform)" class="h-4 w-4 text-muted-foreground" />
                    <span>{{ row.platformLabel }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-right">{{ row.durationMin }} min</TableCell>
                <TableCell class="text-right">{{ row.rating ?? '—' }}</TableCell>
                <TableCell class="text-right" @click.stop>
                  <Button size="sm" variant="ghost" class="gap-2" @click="openDetails(row)">
                    <Eye class="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="showDetails">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session {{ selected?.id }}</DialogTitle>
          <DialogDescription>Detailed session information for employee mentoring activity.</DialogDescription>
        </DialogHeader>
        <div v-if="selected" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader class="pb-2"><CardTitle class="text-base">Employee</CardTitle></CardHeader>
              <CardContent class="space-y-1 text-sm">
                <div><span class="text-muted-foreground">Employee:</span> {{ selected.employeeName }}</div>
                <div v-if="selected.employeeEmail"><span class="text-muted-foreground">Email:</span> {{ selected.employeeEmail }}</div>
                <div><span class="text-muted-foreground">Department:</span> {{ selected.department }}</div>
                <div><span class="text-muted-foreground">Mentor:</span> {{ selected.mentorName }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2"><CardTitle class="text-base">Session</CardTitle></CardHeader>
              <CardContent class="space-y-1 text-sm">
                <div><span class="text-muted-foreground">Status:</span> <Badge :variant="statusVariant(selected.status) as any">{{ statusLabel(selected.status) }}</Badge></div>
                <div><span class="text-muted-foreground">Platform:</span> {{ selected.platformLabel }}</div>
                <div><span class="text-muted-foreground">Payment:</span> {{ selected.paid == null ? '—' : selected.paid ? 'Paid' : 'Pending' }}</div>
              </CardContent>
            </Card>
            <Card class="md:col-span-2">
              <CardHeader class="pb-2"><CardTitle class="text-base">Timing</CardTitle></CardHeader>
              <CardContent class="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <div><span class="text-muted-foreground">Start:</span> {{ fmt(selected.scheduledStart) }}</div>
                <div><span class="text-muted-foreground">End:</span> {{ fmt(selected.scheduledEnd) }}</div>
                <div><span class="text-muted-foreground">Duration:</span> {{ selected.durationMin }} min</div>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">{{ selected.platformLabel }}</Badge>
            <Badge variant="outline">{{ formatCost(selected) }}</Badge>
            <Badge v-if="selected.rating" variant="outline">Rating: {{ selected.rating }}</Badge>
            <Badge variant="outline">{{ selected.paid == null ? 'Payment unknown' : selected.paid ? 'Paid' : 'Payment pending' }}</Badge>
          </div>
        </div>
        <DialogFooter>
          <Button @click="showDetails = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  max-width: 1300px;
}
</style>
