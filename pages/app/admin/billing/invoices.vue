<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Calendar, Users, Eye } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

definePageMeta({
  title: 'Invoices',
  description: 'Invoices for mentorship usage by employees',
  requiresAuth: true,
  permissions: ['admin:billing']
})

// Mock session data (reuse simplified structure from sessions page)
type SessionRow = {
  id: string
  employeeId: string
  employeeName: string
  department: string
  mentorId: string
  mentorName: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending_approval'
  platform: 'zoom' | 'google-meet' | 'teams' | 'phone' | 'chat'
  scheduledStart: string
  scheduledEnd: string
  durationMin: number
  rating?: number
  costUsd?: number
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const sessions = ref<SessionRow[]>([])
// Pricing config
const SESSION_USD_PRICE = 30
const USD_TO_KES_RATE = 130

// Example bootstrapping with a few completed sessions
onMounted(() => {
  sessions.value = [
    { id: 'sess-1001', employeeId: 'emp-001', employeeName: 'Alice Wanjiru', department: 'Engineering', mentorId: '60ea94d2d5efdc75988d09f5', mentorName: 'Thrity Engineer', status: 'completed', platform: 'zoom', scheduledStart: '2025-08-10T09:00:00+03:00', scheduledEnd: '2025-08-10T10:00:00+03:00', durationMin: 60, rating: 5, costUsd: 75 },
    { id: 'sess-1007', employeeId: 'emp-001', employeeName: 'Alice Wanjiru', department: 'Engineering', mentorId: '60ea94d3d5efdc75988d0a02', mentorName: 'Topyster Muga', status: 'completed', platform: 'zoom', scheduledStart: '2025-07-30T09:00:00+03:00', scheduledEnd: '2025-07-30T10:00:00+03:00', durationMin: 60, rating: 5, costUsd: 85 },
    { id: 'sess-1005', employeeId: 'emp-005', employeeName: 'Eunice K', department: 'HR', mentorId: '60ea94d4d5efdc75988d0a14', mentorName: 'Susan Kiamba', status: 'completed', platform: 'zoom', scheduledStart: '2025-08-05T14:00:00+03:00', scheduledEnd: '2025-08-05T15:00:00+03:00', durationMin: 60, rating: 4, costUsd: 75 },
  ]
  isLoading.value = false
})

// Filters and groupings
const q = ref('')
const dept = ref('all')
const month = ref('all') // YYYY-MM

const monthsAvailable = computed(() => {
  const set = new Set<string>()
  sessions.value.forEach(s => set.add(s.scheduledStart.slice(0,7)))
  return ['all', ...Array.from(set).sort().reverse()]
})

const departments = computed(() => ['all', ...new Set(sessions.value.map(s => s.department))])

const filteredCompleted = computed(() => {
  const query = q.value.trim().toLowerCase()
  return sessions.value.filter(s => {
    if (s.status !== 'completed') return false
    const matchesDept = dept.value === 'all' || s.department === dept.value
    const matchesMonth = month.value === 'all' || s.scheduledStart.startsWith(month.value)
    const matchesQuery = !query || [s.employeeName, s.mentorName, s.department].some(v => v.toLowerCase().includes(query))
    return matchesDept && matchesMonth && matchesQuery
  })
})

// Aggregate by mentee (employee)
type InvoiceRow = {
  employeeId: string
  employeeName: string
  department: string
  sessionsCount: number
  totalMinutes: number
  totalCost: number
}

const invoices = computed<InvoiceRow[]>(() => {
  const byEmp = new Map<string, InvoiceRow>()
  filteredCompleted.value.forEach(s => {
    const key = s.employeeId
    const item = byEmp.get(key) || { employeeId: s.employeeId, employeeName: s.employeeName, department: s.department, sessionsCount: 0, totalMinutes: 0, totalCost: 0 }
    item.sessionsCount += 1
    item.totalMinutes += s.durationMin
    item.totalCost += SESSION_USD_PRICE * USD_TO_KES_RATE
    byEmp.set(key, item)
  })
  return Array.from(byEmp.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName))
})

const exportCsv = () => {
  const header = ['Employee ID','Employee','Department','Sessions','Total Minutes','Total Cost (KES)']
  const lines = invoices.value.map(i => [i.employeeId, i.employeeName, i.department, String(i.sessionsCount), String(i.totalMinutes), String(i.totalCost)])
  const csv = [header, ...lines].map(arr => arr.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'invoices.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(n)

// Details dialog state
const showDetails = ref(false)
const selectedInvoice = ref<InvoiceRow | null>(null)
const openDetails = (row: InvoiceRow) => {
  selectedInvoice.value = row
  showDetails.value = true
}
const monthLabel = computed(() => month.value === 'all' ? 'All Months' : month.value)
const sessionsForSelected = computed(() => {
  if (!selectedInvoice.value) return [] as SessionRow[]
  return filteredCompleted.value.filter(s => s.employeeId === selectedInvoice.value!.employeeId)
})
const exportInvoiceCsv = () => {
  if (!selectedInvoice.value) return
  const header = ['Session ID','Date','Mentor','Platform','Duration (min)','Cost (KES)']
  const lines = sessionsForSelected.value.map(s => [s.id, s.scheduledStart, s.mentorName, s.platform, String(s.durationMin), String(SESSION_USD_PRICE * USD_TO_KES_RATE)])
  const csv = [header, ...lines].map(arr => arr.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice_${selectedInvoice.value.employeeId}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Invoices</h1>
        <p class="text-muted-foreground">Aggregated by mentee. Shows number of completed sessions per employee.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="gap-2" @click="exportCsv"><Download class="h-4 w-4" /> Export CSV</Button>
      </div>
    </div>

    <!-- Controls -->
    <Card>
      <CardContent class="p-6 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="lg:w-1/3">
            <Input v-model="q" placeholder="Search by employee, mentor, department" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            <Select v-model="dept">
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in departments" :key="d" :value="d">{{ d === 'all' ? 'All Departments' : d }}</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="month">
              <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in monthsAvailable" :key="m" :value="m">{{ m === 'all' ? 'All Months' : m }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Invoices table -->
    <Card>
      <CardHeader>
        <CardTitle>Invoices by employee</CardTitle>
        <CardDescription>{{ invoices.length }} invoice{{ invoices.length === 1 ? '' : 's' }} • {{ filteredCompleted.length }} completed sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-3">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div v-else>
          <Table>
            <TableCaption v-if="invoices.length === 0">No completed sessions found for current filters.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead class="text-right">Sessions</TableHead>
                <TableHead class="text-right">Total Minutes</TableHead>
                <TableHead class="text-right">Total Cost (KES)</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in invoices" :key="row.employeeId">
                <TableCell class="font-medium">{{ row.employeeName }}</TableCell>
                <TableCell>{{ row.department }}</TableCell>
                <TableCell class="text-right">{{ row.sessionsCount }}</TableCell>
                <TableCell class="text-right">{{ row.totalMinutes }}</TableCell>
                <TableCell class="text-right">{{ fmtCurrency(row.totalCost) }}</TableCell>
                <TableCell class="text-right">
                  <Button size="sm" variant="outline" class="gap-1" @click="openDetails(row)">
                    <Eye class="h-4 w-4" /> View
                  </Button>
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
          <DialogTitle>Invoice • {{ selectedInvoice?.employeeName }}</DialogTitle>
          <DialogDescription>
            {{ selectedInvoice?.department }} • {{ sessionsForSelected.length }} session(s) • {{ monthLabel }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-base">Summary</CardTitle></CardHeader>
            <CardContent class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span class="text-muted-foreground">Sessions:</span> {{ sessionsForSelected.length }}</div>
              <div><span class="text-muted-foreground">Minutes:</span> {{ sessionsForSelected.reduce((a,b)=>a+b.durationMin,0) }}</div>
              <div><span class="text-muted-foreground">Cost:</span> {{ fmtCurrency(sessionsForSelected.length * SESSION_USD_PRICE * USD_TO_KES_RATE) }}</div>
              <div><span class="text-muted-foreground">Employee ID:</span> {{ selectedInvoice?.employeeId }}</div>
            </CardContent>
          </Card>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead class="text-right">Minutes</TableHead>
                  <TableHead class="text-right">Cost (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in sessionsForSelected" :key="s.id">
                  <TableCell>{{ s.id }}</TableCell>
                  <TableCell>{{ s.scheduledStart }}</TableCell>
                  <TableCell>{{ s.mentorName }}</TableCell>
                  <TableCell>{{ s.platform }}</TableCell>
                  <TableCell class="text-right">{{ s.durationMin }}</TableCell>
                  <TableCell class="text-right">{{ fmtCurrency(SESSION_USD_PRICE * USD_TO_KES_RATE) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="exportInvoiceCsv">Export CSV</Button>
          <Button @click="showDetails = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container { max-width: 1200px; }
</style>


