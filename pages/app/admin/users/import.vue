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
import { useCompanyStore } from '@/store/modules/company'

definePageMeta({
  title: 'Import Employees',
  description: 'Import employees via CSV or JSON with validation',
  requiresAuth: true,
  permissions: ['admin:users']
})

const router = useRouter()
const { success, error: toastError } = useAppToast()
const companyStore = useCompanyStore()

// Company ID - this should ideally come from user context/auth
const COMPANY_ID = 'bf65f6fa-be7d-4225-9880-a19d9e612e09'

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
const step = ref<1 | 2 | 3 | 4 | 5>(1)
const fileName = ref('')
const uploadedFile = ref<File | null>(null)
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

  // Validate file type
  const allowedExtensions = ['.csv', '.json', '.xlsx', '.xls']
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

  if (!allowedExtensions.includes(fileExtension)) {
    toastError('Please upload a CSV, JSON, or Excel file')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  try {
    fileName.value = file.name
    uploadedFile.value = file

    // For Excel files, we'll skip the preview and go straight to options
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      step.value = 3
      return
    }

    // For CSV/JSON, parse and show preview
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

// Import via API
const confirmImport = async () => {
  if (!uploadedFile.value) {
    toastError('No file selected')
    return
  }

  try {
    const result = await companyStore.bulkUploadWhitelist(COMPANY_ID, uploadedFile.value)
    step.value = 5 // Move to results step
  } catch (e) {
    // Error is already handled in the store
    console.error('Import failed:', e)
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
  const header = ['email','name']
  const sample = ['jane@example.com','Jane Doe']
  const csv = `${header.join(',')}\n${sample.join(',')}`
  download('whitelist_template.csv', csv, 'text/csv;charset=utf-8;')
}

const downloadJsonTemplate = () => {
  const sample = [
    { email: 'jane@example.com', name: 'Jane Doe' },
    { email: 'john@example.com', name: 'John Smith' }
  ]
  download('whitelist_template.json', JSON.stringify(sample, null, 2), 'application/json;charset=utf-8;')
}

const startOver = () => {
  step.value = 1
  fileName.value = ''
  uploadedFile.value = null
  rawRows.value = []
  parsedRows.value = []
  invalidRows.value = []
  companyStore.clearUploadResult()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Import Employees</h1>
        <p class="text-muted-foreground">Upload a CSV, JSON, or Excel file to bulk import employees</p>
      </div>
      <Button variant="outline" class="gap-2" @click="router.push('/app/admin/users')"><ArrowLeft class="h-4 w-4" /> Back</Button>
    </div>

    <!-- Step 1: Upload -->
    <Card v-if="step === 1">
      <CardHeader>
        <CardTitle>Upload file</CardTitle>
        <CardDescription>Accepted formats: .csv, .json, .xlsx, .xls</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <input ref="fileInput" type="file" accept=".csv,.json,.xlsx,.xls" class="hidden" @change="handleFile" />
        <div class="flex flex-wrap gap-2">
          <Button class="gap-2" @click="triggerSelect"><Upload class="h-4 w-4" /> Choose file</Button>
          <Button variant="outline" class="gap-2" @click="downloadCsvTemplate"><Download class="h-4 w-4" /> CSV template</Button>
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
        <CardDescription>Ready to import from {{ fileName }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ul class="text-sm list-disc pl-5 text-muted-foreground">
          <li>Duplicates will be matched by email and updated</li>
          <li>New records will be created</li>
          <li v-if="options.requireApprovalForNew">New employees will be marked as pending_approval</li>
        </ul>
        <div class="flex items-center justify-between">
          <Button variant="outline" @click="step = 3" :disabled="companyStore.isLoading">Back</Button>
          <Button @click="confirmImport" :disabled="companyStore.isLoading">
            {{ companyStore.isLoading ? 'Uploading...' : 'Confirm Import' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 5: Results -->
    <Card v-if="step === 5">
      <CardHeader>
        <CardTitle>Import Results</CardTitle>
        <CardDescription>Upload completed</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="companyStore.lastUploadResult" class="space-y-4">
          <!-- Summary Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 border rounded-lg">
              <div class="text-2xl font-bold">{{ companyStore.lastUploadResult.totalProcessed }}</div>
              <div class="text-sm text-muted-foreground">Total Processed</div>
            </div>
            <div class="p-4 border rounded-lg bg-green-50">
              <div class="text-2xl font-bold text-green-600">{{ companyStore.lastUploadResult.successCount }}</div>
              <div class="text-sm text-muted-foreground">Successful</div>
            </div>
            <div class="p-4 border rounded-lg bg-red-50" v-if="companyStore.lastUploadResult.failureCount > 0">
              <div class="text-2xl font-bold text-red-600">{{ companyStore.lastUploadResult.failureCount }}</div>
              <div class="text-sm text-muted-foreground">Failed</div>
            </div>
            <div class="p-4 border rounded-lg bg-yellow-50" v-if="companyStore.lastUploadResult.duplicateCount > 0">
              <div class="text-2xl font-bold text-yellow-600">{{ companyStore.lastUploadResult.duplicateCount }}</div>
              <div class="text-sm text-muted-foreground">Duplicates</div>
            </div>
          </div>

          <!-- Success List -->
          <div v-if="companyStore.lastUploadResult.successEmails.length" class="space-y-2">
            <h3 class="font-semibold flex items-center gap-2">
              <CheckCircle class="h-5 w-5 text-green-600" />
              Successfully Added ({{ companyStore.lastUploadResult.successEmails.length }})
            </h3>
            <div class="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div class="space-y-1">
                <div v-for="email in companyStore.lastUploadResult.successEmails" :key="email" class="text-sm">
                  <Badge variant="outline" class="gap-1">
                    <CheckCircle class="h-3 w-3" />
                    {{ email }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Error List -->
          <div v-if="companyStore.lastUploadResult.errors.length" class="space-y-2">
            <h3 class="font-semibold flex items-center gap-2">
              <XCircle class="h-5 w-5 text-red-600" />
              Errors ({{ companyStore.lastUploadResult.errors.length }})
            </h3>
            <div class="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div class="space-y-2">
                <Alert v-for="(error, idx) in companyStore.lastUploadResult.errors" :key="idx" class="bg-red-50">
                  <AlertDescription>
                    <span v-if="error.email" class="font-semibold">{{ error.email }}:</span>
                    {{ error.reason }}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <Button variant="outline" @click="startOver">Import Another File</Button>
          <Button @click="router.push('/app/admin/users')">Go to Users</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.container { max-width: 1100px; }
</style>


