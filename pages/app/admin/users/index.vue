<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Skeleton } from '~/components/ui/skeleton'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Search, Plus, Users, CheckCircle, X, Upload } from 'lucide-vue-next'
import { useAppToast } from '~/composables/services/toastService'

definePageMeta({
  title: 'Employees',
  description: 'Manage your organization\'s employees',
  requiresAuth: true,
  permissions: ['admin:users']
})

const router = useRouter()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const departmentFilter = ref('all')
const statusFilter = ref('all')

// Mock employees data (replace with API later)
type Employee = {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: 'active' | 'inactive' | 'invited' | 'pending_approval'
  joinedAt: string
}

const employees = ref<Employee[]>([
  { id: 'emp-001', name: 'Alice Wanjiru', email: 'alice@company.com', department: 'Engineering', role: 'Software Engineer', status: 'active', joinedAt: '2023-02-10' },
  { id: 'emp-002', name: 'Brian Otieno', email: 'brian@company.com', department: 'Product', role: 'Product Manager', status: 'active', joinedAt: '2022-11-05' },
  { id: 'emp-003', name: 'Cynthia Mwangi', email: 'cynthia@company.com', department: 'Design', role: 'UX Designer', status: 'inactive', joinedAt: '2021-08-21' },
  { id: 'emp-004', name: 'David Kim', email: 'david@company.com', department: 'Sales', role: 'Account Executive', status: 'invited', joinedAt: '—' },
  { id: 'emp-006', name: 'Farida Hassan', email: 'farida@company.com', department: 'People Ops', role: 'L&D Specialist', status: 'pending_approval', joinedAt: '—' },
  { id: 'emp-005', name: 'Eunice K', email: 'eunice@company.com', department: 'HR', role: 'HR Business Partner', status: 'active', joinedAt: '2022-01-13' }
])

const departments = computed(() => {
  const set = new Set<string>()
  employees.value.forEach(e => set.add(e.department))
  return ['all', ...Array.from(set)]
})

const filteredEmployees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return employees.value.filter(e => {
    const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
    const matchesDept = departmentFilter.value === 'all' || e.department === departmentFilter.value
    const matchesStatus = statusFilter.value === 'all' || e.status === statusFilter.value
    return matchesQuery && matchesDept && matchesStatus
  })
})

const statusVariant = (status: Employee['status']) => {
  if (status === 'active') return 'secondary'
  if (status === 'invited') return 'outline'
  if (status === 'pending_approval') return 'default'
  return 'destructive'
}

const openEmployee = (id: string) => {
  router.push(`/app/admin/users/${id}`)
}

// Mentorship approval workflow actions
const { success, error: toastError } = useAppToast()

const approveMentorship = (id: string) => {
  const idx = employees.value.findIndex(e => e.id === id)
  if (idx !== -1) {
    employees.value[idx] = { ...employees.value[idx], status: 'active' }
    success('Mentorship request approved')
  } else {
    toastError('Employee not found')
  }
}

// Import employees (CSV or JSON)
const importInputRef = ref<HTMLInputElement | null>(null)
const triggerImport = () => importInputRef.value?.click()

const allowedStatuses = new Set<Employee['status']>(['active','inactive','invited','pending_approval'])

const normalizeEmployee = (raw: any, idx: number): Employee | null => {
  const name = String(raw.name || '').trim()
  const email = String(raw.email || '').trim().toLowerCase()
  if (!name || !email) return null
  const id = String(raw.id || `emp-${Date.now()}-${idx}`)
  const department = String(raw.department || 'General')
  const role = String(raw.role || 'Employee')
  const status = allowedStatuses.has(raw.status) ? raw.status as Employee['status'] : 'invited'
  const joinedAt = String(raw.joinedAt ?? '—')
  return { id, name, email, department, role, status, joinedAt }
}

const parseCsvText = (text: string) => {
  const lines = text.trim().split(/\r?\n/)
  if (!lines.length) return [] as any[]
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = cols[i] ?? '' })
    return obj
  })
}

const handleFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    let rawList: any[] = []
    if (file.name.toLowerCase().endsWith('.json')) {
      const json = JSON.parse(text)
      rawList = Array.isArray(json) ? json : (Array.isArray(json?.employees) ? json.employees : [])
    } else {
      rawList = parseCsvText(text)
    }
    if (!rawList.length) {
      toastError('No records found in the imported file')
      return
    }
    let added = 0
    let updated = 0
    rawList.forEach((raw, idx) => {
      const emp = normalizeEmployee(raw, idx)
      if (!emp) return
      const byEmailIdx = employees.value.findIndex(e => e.email.toLowerCase() === emp.email)
      if (byEmailIdx !== -1) {
        employees.value[byEmailIdx] = { ...employees.value[byEmailIdx], ...emp, id: employees.value[byEmailIdx].id }
        updated++
      } else {
        employees.value.push(emp)
        added++
      }
    })
    success(`Import complete: ${added} added, ${updated} updated`)
  } catch (err) {
    toastError('Failed to import employees')
  } finally {
    if (importInputRef.value) importInputRef.value.value = ''
  }
}

const declineMentorship = (id: string) => {
  const idx = employees.value.findIndex(e => e.id === id)
  if (idx !== -1) {
    employees.value[idx] = { ...employees.value[idx], status: 'inactive' }
    success('Mentorship request declined')
  } else {
    toastError('Employee not found')
  }
}

onMounted(async () => {
  try {
    // TODO: Replace with API call
    isLoading.value = false
  } catch (e) {
    error.value = 'Failed to load employees.'
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users class="h-7 w-7" /> Employees
        </h1>
        <p class="text-muted-foreground">Manage access, roles, and departments</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="gap-2" asChild>
          <NuxtLink to="/app/admin/users/import">
            <Upload class="h-4 w-4" /> Import
          </NuxtLink>
        </Button>
        <Button class="gap-2">
          <Plus class="h-4 w-4" /> Add Employee
        </Button>
      </div>
    </div>

    <!-- Controls -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Search -->
          <div class="relative md:w-1/2">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Search by name, email, role..." class="pl-9" />
          </div>

          <!-- Department Filter -->
          <div class="md:w-1/4">
            <Select v-model="departmentFilter">
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in departments" :key="dept" :value="dept">{{ dept === 'all' ? 'All Departments' : dept }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status Filter -->
          <div class="md:w-1/4">
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Error -->
    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Table -->
    <Card>
      <CardHeader>
        <CardTitle>All Employees</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div v-if="isLoading" class="space-y-3">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div v-else>
          <Table>
            <TableCaption v-if="filteredEmployees.length === 0">No employees match your criteria.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Joined</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow 
                v-for="emp in filteredEmployees" 
                :key="emp.id"
                class="hover:bg-muted/50"
              >
                <TableCell class="font-medium cursor-pointer" @click="openEmployee(emp.id)">{{ emp.name }}</TableCell>
                <TableCell class="cursor-pointer" @click="openEmployee(emp.id)">{{ emp.email }}</TableCell>
                <TableCell class="cursor-pointer" @click="openEmployee(emp.id)">{{ emp.department }}</TableCell>
                <TableCell class="cursor-pointer" @click="openEmployee(emp.id)">{{ emp.role }}</TableCell>
                <TableCell>
                  <Badge :variant="statusVariant(emp.status) as any">{{ emp.status }}</Badge>
                </TableCell>
                <TableCell class="text-right cursor-pointer" @click="openEmployee(emp.id)">{{ emp.joinedAt }}</TableCell>
                <TableCell class="text-right">
                  <div v-if="emp.status === 'pending_approval'" class="flex justify-end gap-2">
                    <Button size="sm" class="gap-1" @click.stop="approveMentorship(emp.id)">
                      <CheckCircle class="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" class="gap-1" @click.stop="declineMentorship(emp.id)">
                      <X class="h-4 w-4" /> Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>


