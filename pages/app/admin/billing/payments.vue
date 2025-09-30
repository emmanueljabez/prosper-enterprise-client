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
import { Download, CreditCard, Building2 } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

definePageMeta({
  title: 'Payments',
  description: 'Incoming and outgoing payments for mentorship billing',
  requiresAuth: true,
  permissions: ['admin:billing']
})

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer'

type PaymentRow = {
  id: string
  reference: string
  organization: string
  amountKes: number
  method: PaymentMethod
  status: PaymentStatus
  createdAt: string // ISO
  settledAt?: string // ISO
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const payments = ref<PaymentRow[]>([])

onMounted(() => {
  // Mock data; replace with API
  payments.value = [
    { id: 'pay_1001', reference: 'INV-2025-001', organization: 'Prosper Corp', amountKes: 45000, method: 'mpesa', status: 'paid', createdAt: '2025-08-05T10:12:00+03:00', settledAt: '2025-08-05T11:00:00+03:00' },
    { id: 'pay_1002', reference: 'INV-2025-002', organization: 'Prosper Corp', amountKes: 30000, method: 'card', status: 'pending', createdAt: '2025-08-10T08:40:00+03:00' },
    { id: 'pay_1003', reference: 'INV-2025-003', organization: 'Acme Ltd', amountKes: 120000, method: 'bank_transfer', status: 'paid', createdAt: '2025-08-02T09:10:00+03:00', settledAt: '2025-08-02T16:20:00+03:00' },
    { id: 'pay_1004', reference: 'INV-2025-004', organization: 'Acme Ltd', amountKes: 30000, method: 'mpesa', status: 'failed', createdAt: '2025-08-12T12:05:00+03:00' },
  ]
  isLoading.value = false
})

const q = ref('')
const org = ref('all')
const status = ref<'all' | PaymentStatus>('all')
const method = ref<'all' | PaymentMethod>('all')
const month = ref('all')

const orgs = computed(() => ['all', ...new Set(payments.value.map(p => p.organization))])
const monthsAvailable = computed(() => ['all', ...new Set(payments.value.map(p => p.createdAt.slice(0,7))).values()])

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  return payments.value.filter(p => {
    const inOrg = org.value === 'all' || p.organization === org.value
    const inStatus = status.value === 'all' || p.status === status.value
    const inMethod = method.value === 'all' || p.method === method.value
    const inMonth = month.value === 'all' || p.createdAt.startsWith(month.value)
    const inQuery = !query || [p.reference, p.organization, p.method, p.status].some(v => String(v).toLowerCase().includes(query))
    return inOrg && inStatus && inMethod && inMonth && inQuery
  })
})

// KPIs
const kpiTotalKes = computed(() => filtered.value.filter(p => p.status === 'paid').reduce((a,b)=>a+b.amountKes,0))
const kpiPendingKes = computed(() => filtered.value.filter(p => p.status === 'pending').reduce((a,b)=>a+b.amountKes,0))
const kpiCount = computed(() => filtered.value.length)

const fmtKes = (n: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(n)

// Details dialog
const showDetails = ref(false)
const selected = ref<PaymentRow | null>(null)
const openDetails = (row: PaymentRow) => { selected.value = row; showDetails.value = true }

const exportCsv = () => {
  const header = ['Payment ID','Reference','Organization','Amount (KES)','Method','Status','Created At','Settled At']
  const lines = filtered.value.map(p => [p.id, p.reference, p.organization, String(p.amountKes), p.method, p.status, p.createdAt, p.settledAt ?? ''])
  const csv = [header, ...lines].map(arr => arr.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'payments.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Payments</h1>
        <p class="text-muted-foreground">Track invoices and payments by method, status, org, and month</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="gap-2" @click="exportCsv"><Download class="h-4 w-4" /> Export CSV</Button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader class="pb-2"><CardDescription>Total Paid</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ fmtKes(kpiTotalKes) }}</CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription>Pending</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ fmtKes(kpiPendingKes) }}</CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription>Payments</CardDescription></CardHeader>
        <CardContent class="text-3xl font-bold">{{ kpiCount }}</CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-6 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="lg:w-1/3">
            <Input v-model="q" placeholder="Search by reference, org, method, status" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
            <Select v-model="org">
              <SelectTrigger><SelectValue placeholder="Organization" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="o in orgs" :key="o" :value="o">{{ o === 'all' ? 'All Orgs' : o }}</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="status">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="method">
              <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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

    <!-- Table -->
    <Card>
      <CardHeader>
        <CardTitle>All Payments</CardTitle>
        <CardDescription>{{ filtered.length }} result(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-3">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div v-else>
          <Table>
            <TableCaption v-if="filtered.length === 0">No payments found.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Settled</TableHead>
                <TableHead class="text-right">Amount (KES)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in filtered" :key="row.id" class="hover:bg-muted/50 cursor-pointer" @click="openDetails(row)">
                <TableCell class="font-medium">{{ row.reference }}</TableCell>
                <TableCell>{{ row.organization }}</TableCell>
                <TableCell>{{ row.method }}</TableCell>
                <TableCell><Badge :variant="row.status === 'paid' ? 'default' : row.status === 'pending' ? 'outline' : 'destructive'">{{ row.status }}</Badge></TableCell>
                <TableCell>{{ new Date(row.createdAt).toLocaleString() }}</TableCell>
                <TableCell>{{ row.settledAt ? new Date(row.settledAt).toLocaleString() : '—' }}</TableCell>
                <TableCell class="text-right">{{ fmtKes(row.amountKes) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Details -->
    <Dialog v-model:open="showDetails">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment {{ selected?.reference }}</DialogTitle>
          <DialogDescription>{{ selected?.organization }}</DialogDescription>
        </DialogHeader>
        <div v-if="selected" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-base">Summary</CardTitle></CardHeader>
            <CardContent class="text-sm space-y-1">
              <div><span class="text-muted-foreground">Amount:</span> {{ fmtKes(selected.amountKes) }}</div>
              <div><span class="text-muted-foreground">Method:</span> {{ selected.method }}</div>
              <div><span class="text-muted-foreground">Status:</span> {{ selected.status }}</div>
              <div><span class="text-muted-foreground">Created:</span> {{ new Date(selected.createdAt).toLocaleString() }}</div>
              <div><span class="text-muted-foreground">Settled:</span> {{ selected.settledAt ? new Date(selected.settledAt).toLocaleString() : '—' }}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-base">Identifiers</CardTitle></CardHeader>
            <CardContent class="text-sm space-y-1">
              <div><span class="text-muted-foreground">Payment ID:</span> {{ selected.id }}</div>
              <div><span class="text-muted-foreground">Reference:</span> {{ selected.reference }}</div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button @click="showDetails = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container { max-width: 1200px; }
</style>



