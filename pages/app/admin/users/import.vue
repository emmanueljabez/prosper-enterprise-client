<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-vue-next'
import { useAppToast } from '@/composables/services/toastService'

definePageMeta({
  title: 'Import Employees',
  description: 'Import employees via CSV or JSON with validation',
  requiresAuth: true,
  permissions: ['admin:users']
})

const router = useRouter()
const { success, error: toastError } = useAppToast()

type Employee = {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: 'active' | 'inactive' | 'invited' | 'pending_approval'
  joinedAt: string
}

// Wizard steps
const step = ref<1 | 2 | 3 | 4>(1)
const fileName = ref('')
const rawRows = ref<any[]>([])
const parsedRows = ref<Employee[]>([])
const invalidRows = ref<{ index: number, reason: string }[]>([])
const options = ref({
  defaultDepartment: 'General',
  defaultRole: 'Employee',
  missingStatus: 'invited' as Employee['status'],
  setJoinedTodayIfMissing: true,
  requireApprovalForNew: false,
})

const fileInput = ref<HTMLInputElement | null>(null)
const triggerSelect = () => fileInput.value?.click()

const allowedStatuses = new Set<Employee['status']>(['active','inactive','invited','pending_approval'])

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

const normalize = (raw: any): Employee | null => {
  const name = String(raw.name || '').trim()
  const email = String(raw.email || '').trim().toLowerCase()
  if (!name || !email) return null
  const id = String(raw.id || '')
  const department = String(raw.department || options.value.defaultDepartment)
  const role = String(raw.role || options.value.defaultRole)
  let status = String(raw.status || options.value.missingStatus) as Employee['status']
  if (!allowedStatuses.has(status)) status = options.value.missingStatus
  let joinedAt = String(raw.joinedAt || '')
  if (!joinedAt && options.value.setJoinedTodayIfMissing) {
    const today = new Date()
    joinedAt = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  }
  return { id: id || `emp-${Math.random().toString(36).slice(2, 9)}`, name, email, department, role, status, joinedAt: joinedAt || '—' }
}

const handleFile = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    fileName.value = file.name
    const text = await file.text()
    let rows: any[] = []
    if (file.name.toLowerCase().endsWith('.json')) {
      const json = JSON.parse(text)
      rows = Array.isArray(json) ? json : (Array.isArray(json?.employees) ? json.employees : [])
    } else {
      rows = parseCsvText(text)
    }
    rawRows.value = rows
    step.value = 2
    runValidation()
  } catch (err) {
    toastError('Failed to read file')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

const runValidation = () => {
  parsedRows.value = []
  invalidRows.value = []
  rawRows.value.forEach((r, idx) => {
    const norm = normalize(r)
    if (norm) parsedRows.value.push(norm)
    else invalidRows.value.push({ index: idx + 1, reason: 'Missing name or email' })
  })
}

const readyToImport = computed(() => parsedRows.value.length > 0)

// Department options (combine common set with any found in file)
const commonDepartments = ['General','Engineering','Product','Design','Sales','HR','People Ops','Finance','Marketing','Operations','Legal']
const departmentOptions = computed(() => {
  const set = new Set<string>(commonDepartments)
  parsedRows.value.forEach(r => { if (r.department) set.add(r.department) })
  return Array.from(set)
})

const commonRoles = ['Employee','Software Engineer','Product Manager','UX Designer','HR Business Partner','L&D Specialist','Account Executive','Finance Analyst','Marketing Manager','Operations Manager','Legal Counsel','Data Analyst','Customer Support']
const roleOptions = computed(() => {
  const set = new Set<string>(commonRoles)
  parsedRows.value.forEach(r => { if (r.role) set.add(r.role) })
  return Array.from(set)
})

// Simulated import persistence. In a real app, POST to API.
const confirmImport = async () => {
  try {
    // TODO: API call
    success(`Imported ${parsedRows.value.length} employees`)
    router.push('/app/admin/users')
  } catch (e) {
    toastError('Failed to import employees')
  }
}

// Templates
const download = (filename: string, content: string, type = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const downloadCsvTemplate = () => {
  const header = ['id','name','email','department','role','status','joinedAt']
  const sample = ['emp-001','Jane Doe','jane@example.com','Engineering','Software Engineer','invited','2024-11-01']
  const csv = `${header.join(',')}\n${sample.join(',')}`
  download('employees_template.csv', csv, 'text/csv;charset=utf-8;')
}

const downloadJsonTemplate = () => {
  const sample = [
    { id: 'emp-001', name: 'Jane Doe', email: 'jane@example.com', department: 'Engineering', role: 'Software Engineer', status: 'invited', joinedAt: '2024-11-01' },
    { id: 'emp-002', name: 'John Smith', email: 'john@example.com', department: 'HR', role: 'HRBP', status: 'active', joinedAt: '2023-05-10' }
  ]
  download('employees_template.json', JSON.stringify(sample, null, 2), 'application/json;charset=utf-8;')
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Import Employees</h1>
        <p class="text-muted-foreground">Upload a CSV or JSON file, review, and confirm import</p>
      </div>
      <Button variant="outline" class="gap-2" @click="router.push('/app/admin/users')"><ArrowLeft class="h-4 w-4" /> Back</Button>
    </div>

    <!-- Step 1: Upload -->
    <Card v-if="step === 1">
      <CardHeader>
        <CardTitle>Upload file</CardTitle>
        <CardDescription>Accepted formats: .csv, .json</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <input ref="fileInput" type="file" accept=".csv,.json" class="hidden" @change="handleFile" />
        <div class="flex flex-wrap gap-2">
          <Button class="gap-2" @click="triggerSelect"><Upload class="h-4 w-4" /> Choose file</Button>
          <Button variant="outline" class="gap-2" @click="downloadCsvTemplate"><Download class="h-4 w-4" /> CSV template</Button>
          <Button variant="outline" class="gap-2" @click="downloadJsonTemplate"><Download class="h-4 w-4" /> JSON template</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 2: Validate/Preview -->
    <Card v-if="step === 2">
      <CardHeader>
        <CardTitle>Preview & validation</CardTitle>
        <CardDescription>File: {{ fileName }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="invalidRows.length">
          <AlertDescription>
            {{ invalidRows.length }} invalid rows will be skipped. First issue at row {{ invalidRows[0].index }} ({{ invalidRows[0].reason }}).
          </AlertDescription>
        </Alert>
        <div class="overflow-x-auto">
          <Table>
            <TableCaption v-if="!parsedRows.length">No valid rows to display.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(row, i) in parsedRows.slice(0, 20)" :key="i">
                <TableCell>{{ row.name }}</TableCell>
                <TableCell>{{ row.email }}</TableCell>
                <TableCell>{{ row.department }}</TableCell>
                <TableCell>{{ row.role }}</TableCell>
                <TableCell><Badge variant="outline">{{ row.status }}</Badge></TableCell>
                <TableCell>{{ row.joinedAt }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">Showing first 20 of {{ parsedRows.length }} rows</div>
          <div class="space-x-2">
            <Button variant="outline" @click="step = 1">Choose another file</Button>
            <Button :disabled="!readyToImport" @click="step = 3">Continue</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Step 3: Options -->
    <Card v-if="step === 3">
      <CardHeader>
        <CardTitle>Import options</CardTitle>
        <CardDescription>Control how missing values are handled</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-muted-foreground">Default Department</label>
            <Select v-model="options.defaultDepartment">
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm text-muted-foreground">Default Role</label>
            <Select v-model="options.defaultRole">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roleOptions" :key="role" :value="role">{{ role }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm text-muted-foreground">Missing Status</label>
            <Input v-model="options.missingStatus" />
          </div>
          <div class="flex items-center gap-2">
            <input id="joinedToday" type="checkbox" v-model="options.setJoinedTodayIfMissing" class="h-4 w-4" />
            <label for="joinedToday" class="text-sm">Set today's date when joinedAt is missing</label>
          </div>
          <div class="flex items-center gap-2">
            <input id="reqApproval" type="checkbox" v-model="options.requireApprovalForNew" class="h-4 w-4" />
            <label for="reqApproval" class="text-sm">Mark new employees as pending_approval</label>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <Button variant="outline" @click="step = 2">Back</Button>
          <Button @click="step = 4">Review</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 4: Review & Confirm -->
    <Card v-if="step === 4">
      <CardHeader>
        <CardTitle>Review & confirm</CardTitle>
        <CardDescription>Ready to import {{ parsedRows.length }} employees</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ul class="text-sm list-disc pl-5 text-muted-foreground">
          <li>Duplicates will be matched by email and updated</li>
          <li>New records will be created</li>
          <li v-if="options.requireApprovalForNew">New employees will be marked as pending_approval</li>
        </ul>
        <div class="flex items-center justify-between">
          <Button variant="outline" @click="step = 3">Back</Button>
          <Button @click="confirmImport">Confirm Import</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.container { max-width: 1100px; }
</style>


