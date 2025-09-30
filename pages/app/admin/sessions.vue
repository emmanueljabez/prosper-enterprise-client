<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Download, RefreshCw, Search, Clock, Users, Calendar, Video, Phone, MessageCircle, Star } from 'lucide-vue-next'
import { useAppToast } from '@/composables/services/toastService'

definePageMeta({
  title: 'Session Monitoring',
  description: 'Track and analyze mentorship sessions across your organization',
  requiresAuth: true,
  permissions: ['admin:reports']
})

type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending_approval'
type Platform = 'zoom' | 'google-meet' | 'teams' | 'phone' | 'chat'

type SessionRow = {
  id: string
  employeeId: string
  employeeName: string
  department: string
  mentorId: string
  mentorName: string
  status: SessionStatus
  platform: Platform
  scheduledStart: string // ISO
  scheduledEnd: string // ISO
  durationMin: number
  rating?: number
  costUsd?: number
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const { success, error: toastError } = useAppToast()

// Mock sessions (replace with API)
const sessions = ref<SessionRow[]>([
  { id: 'sess-1001', employeeId: 'emp-001', employeeName: 'Alice Wanjiru', department: 'Engineering', mentorId: '60ea94d2d5efdc75988d09f5', mentorName: 'Thrity Engineer', status: 'completed', platform: 'zoom', scheduledStart: '2025-08-10T09:00:00+03:00', scheduledEnd: '2025-08-10T10:00:00+03:00', durationMin: 60, rating: 5, costUsd: 75 },
  { id: 'sess-1002', employeeId: 'emp-002', employeeName: 'Brian Otieno', department: 'Product', mentorId: '60ea94d3d5efdc75988d09fe', mentorName: 'Achieng Butler', status: 'pending_approval', platform: 'google-meet', scheduledStart: '2025-08-12T11:00:00+03:00', scheduledEnd: '2025-08-12T12:00:00+03:00', durationMin: 60 },
  { id: 'sess-1003', employeeId: 'emp-003', employeeName: 'Cynthia Mwangi', department: 'Design', mentorId: '60ea94d6d5efdc75988d0a3f', mentorName: 'Faith Nkatha Gitonga', status: 'pending_approval', platform: 'teams', scheduledStart: '2025-08-15T15:00:00+03:00', scheduledEnd: '2025-08-15T16:00:00+03:00', durationMin: 60 },
  { id: 'sess-1004', employeeId: 'emp-004', employeeName: 'David Kim', department: 'Sales', mentorId: '60ea94d4d5efdc75988d0a11', mentorName: 'Dick Omondi', status: 'cancelled', platform: 'zoom', scheduledStart: '2025-08-03T10:00:00+03:00', scheduledEnd: '2025-08-03T11:00:00+03:00', durationMin: 60 },
  { id: 'sess-1005', employeeId: 'emp-005', employeeName: 'Eunice K', department: 'HR', mentorId: '60ea94d4d5efdc75988d0a14', mentorName: 'Susan Kiamba', status: 'completed', platform: 'zoom', scheduledStart: '2025-08-05T14:00:00+03:00', scheduledEnd: '2025-08-05T15:00:00+03:00', durationMin: 60, rating: 4, costUsd: 75 },
  { id: 'sess-1006', employeeId: 'emp-006', employeeName: 'Farida Hassan', department: 'People Ops', mentorId: '60ea94d5d5efdc75988d0a2b', mentorName: 'Paul Muhami', status: 'no_show', platform: 'phone', scheduledStart: '2025-08-07T10:00:00+03:00', scheduledEnd: '2025-08-07T10:30:00+03:00', durationMin: 30 },
  { id: 'sess-1007', employeeId: 'emp-001', employeeName: 'Alice Wanjiru', department: 'Engineering', mentorId: '60ea94d3d5efdc75988d0a02', mentorName: 'Topyster Muga', status: 'completed', platform: 'zoom', scheduledStart: '2025-07-30T09:00:00+03:00', scheduledEnd: '2025-07-30T10:00:00+03:00', durationMin: 60, rating: 5, costUsd: 85 },
])

// Filters
const q = ref('')
const dept = ref('all')
const status = ref<'all' | SessionStatus>('all')
const platform = ref<'all' | Platform>('all')
const mentor = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

const departments = computed(() => ['all', ...new Set(sessions.value.map(s => s.department))])
const mentors = computed(() => ['all', ...new Set(sessions.value.map(s => s.mentorName))])

const filtered = computed(() => {
  const start = dateFrom.value ? new Date(dateFrom.value) : null
  const end = dateTo.value ? new Date(dateTo.value) : null
  const query = q.value.trim().toLowerCase()
  return sessions.value.filter(s => {
    const inDept = dept.value === 'all' || s.department === dept.value
    const inStatus = status.value === 'all' || s.status === status.value
    const inPlatform = platform.value === 'all' || s.platform === platform.value
    const inMentor = mentor.value === 'all' || s.mentorName === mentor.value
    const inQuery = !query || [s.employeeName, s.mentorName, s.department].some(v => v.toLowerCase().includes(query))
    const startTime = new Date(s.scheduledStart)
    const inDateRange = (!start || startTime >= start) && (!end || startTime <= end)
    return inDept && inStatus && inPlatform && inMentor && inQuery && inDateRange
  })
})

// KPIs
const kpiTotal = computed(() => filtered.value.length)
const kpiCompleted = computed(() => filtered.value.filter(s => s.status === 'completed').length)
const kpiUpcoming = computed(() => filtered.value.filter(s => s.status === 'scheduled' || s.status === 'confirmed' || s.status === 'pending_approval').length)
const kpiPendingApprovals = computed(() => filtered.value.filter(s => s.status === 'pending_approval').length)
const kpiCancelledRate = computed(() => {
  const total = filtered.value.length || 1
  const cancelled = filtered.value.filter(s => s.status === 'cancelled' || s.status === 'no_show').length
  return Math.round((cancelled / total) * 100)
})
const kpiAvgRating = computed(() => {
  const rated = filtered.value.filter(s => typeof s.rating === 'number')
  if (rated.length === 0) return 0
  const sum = rated.reduce((a, b) => a + (b.rating || 0), 0)
  return Math.round((sum / rated.length) * 10) / 10
})
const kpiAvgDuration = computed(() => {
  if (!filtered.value.length) return 0
  const sum = filtered.value.reduce((a, b) => a + b.durationMin, 0)
  return Math.round(sum / filtered.value.length)
})

// Details dialog
const showDetails = ref(false)
const selected = ref<SessionRow | null>(null)
const openDetails = (row: SessionRow) => {
  selected.value = row
  showDetails.value = true
}

// Approvals
const approveSession = (row: SessionRow) => {
  try {
    row.status = 'confirmed'
    success(`Session ${row.id} approved`)
  } catch (e) {
    toastError('Failed to approve session')
  }
}
const declineSession = (row: SessionRow) => {
  try {
    row.status = 'cancelled'
    success(`Session ${row.id} declined`)
  } catch (e) {
    toastError('Failed to decline session')
  }
}

// Export CSV
const exportCsv = () => {
  const rows = filtered.value
  const header = ['Session ID','Employee','Department','Mentor','Status','Platform','Start','End','Duration (min)','Rating']
  const lines = rows.map(r => [r.id, r.employeeName, r.department, r.mentorName, r.status, r.platform, r.scheduledStart, r.scheduledEnd, String(r.durationMin), r.rating ?? ''])
  const csv = [header, ...lines].map(arr => arr.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sessions.csv'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // TODO: Replace with API fetch
  isLoading.value = false
})

const statusVariant = (s: SessionStatus) => {
  switch (s) {
    case 'confirmed': return 'secondary'
    case 'scheduled': return 'outline'
    case 'completed': return 'default'
    case 'cancelled': return 'destructive'
    case 'no_show': return 'destructive'
    case 'pending_approval': return 'secondary'
    default: return 'secondary'
  }
}

const platformIcon = (p: Platform) => ({ 'zoom': Video, 'google-meet': Video, 'teams': Video, 'phone': Phone, 'chat': MessageCircle }[p] || Video)

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Session Monitoring</h1>
        <p class="text-muted-foreground">Monitor mentorship sessions across departments and mentors</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="gap-2" @click="exportCsv"><Download class="h-4 w-4" /> Export CSV</Button>
        <Button variant="outline" class="gap-2"><RefreshCw class="h-4 w-4" /> Refresh</Button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

    <!-- Filters -->
    <Card>
      <CardContent class="p-6 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="relative lg:w-1/3">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input v-model="q" placeholder="Search employee, mentor, department" class="pl-9" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
            <Select v-model="dept">
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in departments" :key="d" :value="d">{{ d === 'all' ? 'All Departments' : d }}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select v-model="mentor">
              <SelectTrigger><SelectValue placeholder="Mentor" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in mentors" :key="m" :value="m">{{ m === 'all' ? 'All Mentors' : m }}</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="status">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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

    <!-- Error -->
    <Alert v-if="error" variant="destructive"><AlertDescription>{{ error }}</AlertDescription></Alert>

    <!-- Sessions Table -->
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
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in filtered" :key="row.id" class="hover:bg-muted/50 cursor-pointer" @click="openDetails(row)">
                <TableCell class="font-medium">{{ row.employeeName }}</TableCell>
                <TableCell>{{ row.department }}</TableCell>
                <TableCell>{{ row.mentorName }}</TableCell>
                
                
                <TableCell>{{ fmt(row.scheduledStart) }}</TableCell>
                <TableCell>{{ fmt(row.scheduledEnd) }}</TableCell>
                <TableCell>
                  <Badge :variant="statusVariant(row.status) as any">{{ row.status }}</Badge>
                </TableCell>
                <TableCell>
                  <component :is="platformIcon(row.platform)" class="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell class="text-right">{{ row.durationMin }} min</TableCell>
                <TableCell class="text-right">{{ row.rating ?? '—' }}</TableCell>
                <TableCell class="text-right" @click.stop>
                  <div v-if="row.status === 'pending_approval'" class="flex justify-end gap-2">
                    <Button size="sm" variant="default" @click="approveSession(row)">Approve</Button>
                    <Button size="sm" variant="outline" @click="declineSession(row)">Decline</Button>
                  </div>
                  <div v-else class="text-muted-foreground text-sm">—</div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Details Dialog -->
    <Dialog v-model:open="showDetails">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session {{ selected?.id }}</DialogTitle>
          <DialogDescription>Detailed session information for compliance and insights</DialogDescription>
        </DialogHeader>
        <div v-if="selected" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader class="pb-2"><CardTitle class="text-base">Participant</CardTitle></CardHeader>
              <CardContent>
                <div class="text-sm"><span class="text-muted-foreground">Employee:</span> {{ selected.employeeName }} ({{ selected.department }})</div>
                <div class="text-sm"><span class="text-muted-foreground">Mentor:</span> {{ selected.mentorName }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2"><CardTitle class="text-base">Session</CardTitle></CardHeader>
              <CardContent>
                
                
                <div class="text-sm"><span class="text-muted-foreground">Status:</span> <Badge :variant="statusVariant(selected.status) as any">{{ selected.status }}</Badge></div>
              </CardContent>
            </Card>
            <Card class="md:col-span-2">
              <CardHeader class="pb-2"><CardTitle class="text-base">Timing</CardTitle></CardHeader>
              <CardContent class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div><span class="text-muted-foreground">Start:</span> {{ fmt(selected.scheduledStart) }}</div>
                <div><span class="text-muted-foreground">End:</span> {{ fmt(selected.scheduledEnd) }}</div>
                <div><span class="text-muted-foreground">Duration:</span> {{ selected.durationMin }} min</div>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div class="flex items-center justify-between text-sm">
            <div class="space-x-2">
              <Badge variant="outline">Platform: {{ selected.platform }}</Badge>
              <Badge v-if="selected.costUsd" variant="outline">Cost: ${{ selected.costUsd }}</Badge>
              <Badge v-if="selected.rating" variant="outline">Rating: {{ selected.rating }}</Badge>
            </div>
            <div class="space-x-2">
              <Button variant="outline">View Employee</Button>
              <Button variant="outline">View Mentor</Button>
            </div>
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
.container { max-width: 1300px; }
</style>


