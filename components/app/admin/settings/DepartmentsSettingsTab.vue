<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDepartmentsStore } from '~/store/modules/departments'
import type { CompanyDepartmentRecord, CompanyProfileRecord, DepartmentMemberRecord } from '~/http/requests/app/departments'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Textarea } from '~/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  companyId?: string
  canManage?: boolean
}>(), {
  companyId: '',
  canManage: false,
})

type DepartmentDialogMode = 'create' | 'edit'

const departmentsStore = useDepartmentsStore()
const {
  departmentsLoading,
  departmentsSaving,
  membersLoading,
  membersSaving,
  employeesLoading,
  error,
  departments,
  selectedDepartmentId,
  members,
  assignableEmployees,
  departmentsPagination,
  membersPagination,
} = storeToRefs(departmentsStore)

const departmentSearch = ref('')
const memberSearch = ref('')
const employeeSearch = ref('')
const departmentDialogOpen = ref(false)
const departmentDialogMode = ref<DepartmentDialogMode>('create')
const editingDepartmentId = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const membersDialogOpen = ref(false)
const assignDialogOpen = ref(false)
const pendingDeleteDepartment = ref<CompanyDepartmentRecord | null>(null)
const selectedAssignableProfileIds = ref<string[]>([])
const departmentForm = ref({
  name: '',
  code: '',
  description: '',
})

const selectedDepartment = computed(() => departmentsStore.selectedDepartment)
const totalDepartments = computed(() => departments.value.length)
const totalMembers = computed(() =>
  departments.value.reduce((total, department) => total + Number(department.memberCount || 0), 0),
)
const isDepartmentFormValid = computed(() => departmentForm.value.name.trim().length >= 2)

let departmentSearchDebounce: ReturnType<typeof setTimeout> | null = null
let memberSearchDebounce: ReturnType<typeof setTimeout> | null = null
let employeeSearchDebounce: ReturnType<typeof setTimeout> | null = null

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const resolveProfileName = (profile: CompanyProfileRecord) => {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile.username || profile.email || 'Employee'
}

const resolveMemberName = (member: DepartmentMemberRecord) =>
  member.profileName || member.profileEmail || 'Employee'

const initials = (value: string) => {
  const tokens = String(value || '').trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return 'E'
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
  return `${tokens[0][0]}${tokens[tokens.length - 1][0]}`.toUpperCase()
}

const selectedAssignableIdSet = computed(() => new Set(selectedAssignableProfileIds.value))

const toggleAssignableProfile = (profileId: string, checked: boolean | 'indeterminate') => {
  const nextChecked = checked === true
  if (nextChecked) {
    if (!selectedAssignableIdSet.value.has(profileId)) {
      selectedAssignableProfileIds.value = [...selectedAssignableProfileIds.value, profileId]
    }
    return
  }

  selectedAssignableProfileIds.value = selectedAssignableProfileIds.value.filter(id => id !== profileId)
}

const resetDepartmentForm = (department?: CompanyDepartmentRecord | null) => {
  departmentForm.value = {
    name: department?.name || '',
    code: String(department?.code || ''),
    description: String(department?.description || ''),
  }
}

const loadDepartmentsWorkspace = async (options?: { preserveSelection?: boolean; page?: number }) => {
  if (!props.companyId) return

  try {
    await departmentsStore.loadDepartments({
      companyId: props.companyId,
      page: options?.page ?? 0,
      size: departmentsPagination.value.pageSize || 20,
      search: departmentSearch.value,
      preserveSelection: options?.preserveSelection ?? true,
    })
  } catch {
    return
  }
}

const loadAssignableEmployees = async () => {
  if (!props.companyId || !selectedDepartmentId.value) return

  try {
    await departmentsStore.searchAssignableEmployees({
      companyId: props.companyId,
      departmentId: selectedDepartmentId.value,
      search: employeeSearch.value,
    })
  } catch {
    // Store error state already set.
  }
}

const openCreateDepartmentDialog = () => {
  departmentDialogMode.value = 'create'
  editingDepartmentId.value = null
  resetDepartmentForm(null)
  departmentDialogOpen.value = true
}

const openEditDepartmentDialog = (department: CompanyDepartmentRecord) => {
  departmentDialogMode.value = 'edit'
  editingDepartmentId.value = department.id
  resetDepartmentForm(department)
  departmentDialogOpen.value = true
}

const saveDepartment = async () => {
  if (!props.companyId || !isDepartmentFormValid.value) return

  const payload = {
    name: departmentForm.value.name.trim(),
    code: departmentForm.value.code.trim() || undefined,
    description: departmentForm.value.description.trim() || undefined,
  }

  try {
    if (departmentDialogMode.value === 'create') {
      const createdDepartment = await departmentsStore.createDepartment(props.companyId, payload)
      departmentDialogOpen.value = false
      await loadDepartmentsWorkspace({ preserveSelection: true, page: 0 })

      if (createdDepartment?.id) {
        await departmentsStore.selectDepartment({
          companyId: props.companyId,
          departmentId: createdDepartment.id,
        })
      }
      return
    }

    if (!editingDepartmentId.value) return
    await departmentsStore.updateDepartment(props.companyId, editingDepartmentId.value, payload)
    departmentDialogOpen.value = false
    await loadDepartmentsWorkspace({
      preserveSelection: true,
      page: departmentsPagination.value.currentPage || 0,
    })
  } catch {
    // Store error + toast handled in store.
  }
}

const requestDeleteDepartment = (department: CompanyDepartmentRecord) => {
  pendingDeleteDepartment.value = department
  deleteDialogOpen.value = true
}

const deleteDepartment = async () => {
  if (!props.companyId || !pendingDeleteDepartment.value?.id) return

  try {
    await departmentsStore.deleteDepartment(props.companyId, pendingDeleteDepartment.value.id)
    deleteDialogOpen.value = false
    pendingDeleteDepartment.value = null
    await loadDepartmentsWorkspace({
      preserveSelection: true,
      page: departmentsPagination.value.currentPage || 0,
    })
  } catch {
    // Store error + toast handled in store.
  }
}

const setActiveDepartment = async (departmentId: string) => {
  if (!props.companyId) return
  memberSearch.value = ''

  try {
    await departmentsStore.selectDepartment({
      companyId: props.companyId,
      departmentId,
    })
    return true
  } catch {
    // Store error state already set.
    return false
  }
}

const openDepartmentMembersDialog = async (department: CompanyDepartmentRecord) => {
  const didSelect = await setActiveDepartment(department.id)
  if (!didSelect) return

  membersDialogOpen.value = true
}

const openAssignEmployeesDialog = async (department: CompanyDepartmentRecord) => {
  const didSelect = await setActiveDepartment(department.id)
  if (!didSelect) return

  assignDialogOpen.value = true
}

const addEmployeesToDepartment = async () => {
  if (!props.companyId || !selectedDepartmentId.value || !selectedAssignableProfileIds.value.length) return

  try {
    await departmentsStore.addEmployeesToDepartment({
      companyId: props.companyId,
      departmentId: selectedDepartmentId.value,
      profileIds: selectedAssignableProfileIds.value,
    })
    selectedAssignableProfileIds.value = []
    employeeSearch.value = ''
    await loadAssignableEmployees()
  } catch {
    // Store error + toast handled in store.
  }
}

const removeEmployeeFromDepartment = async (member: DepartmentMemberRecord) => {
  if (!props.companyId || !selectedDepartmentId.value) return

  try {
    await departmentsStore.removeEmployeeFromDepartment({
      companyId: props.companyId,
      departmentId: selectedDepartmentId.value,
      profileId: member.profileId,
    })
    await loadAssignableEmployees()
  } catch {
    // Store error + toast handled in store.
  }
}

const goToDepartmentPage = async (direction: 'previous' | 'next') => {
  if (!props.companyId) return
  const page = direction === 'previous'
    ? Math.max(0, departmentsPagination.value.currentPage - 1)
    : departmentsPagination.value.currentPage + 1

  await loadDepartmentsWorkspace({
    preserveSelection: true,
    page,
  })
}

const goToMembersPage = async (direction: 'previous' | 'next') => {
  if (!props.companyId || !selectedDepartmentId.value) return

  const page = direction === 'previous'
    ? Math.max(0, membersPagination.value.currentPage - 1)
    : membersPagination.value.currentPage + 1

  try {
    await departmentsStore.loadDepartmentMembers({
      companyId: props.companyId,
      departmentId: selectedDepartmentId.value,
      page,
      size: membersPagination.value.pageSize || 20,
      search: memberSearch.value,
    })
  } catch {
    // Store error state already set.
  }
}

watch(() => props.companyId, async companyId => {
  departmentSearch.value = ''
  memberSearch.value = ''
  employeeSearch.value = ''
  selectedAssignableProfileIds.value = []

  if (!companyId) {
    departmentsStore.$reset()
    return
  }
  await loadDepartmentsWorkspace({
    preserveSelection: false,
    page: 0,
  })
}, { immediate: true })

watch(departmentSearch, () => {
  if (departmentSearchDebounce) clearTimeout(departmentSearchDebounce)
  departmentSearchDebounce = setTimeout(async () => {
    await loadDepartmentsWorkspace({
      preserveSelection: true,
      page: 0,
    })
  }, 350)
})

watch(memberSearch, value => {
  if (memberSearchDebounce) clearTimeout(memberSearchDebounce)
  memberSearchDebounce = setTimeout(async () => {
    if (!membersDialogOpen.value || !props.companyId || !selectedDepartmentId.value) return

    try {
      await departmentsStore.loadDepartmentMembers({
        companyId: props.companyId,
        departmentId: selectedDepartmentId.value,
        page: 0,
        size: membersPagination.value.pageSize || 20,
        search: value,
      })
    } catch {
      // Store error state already set.
    }
  }, 350)
})

watch(membersDialogOpen, isOpen => {
  if (isOpen) return
  memberSearch.value = ''
})

watch(assignDialogOpen, async isOpen => {
  if (!isOpen) {
    selectedAssignableProfileIds.value = []
    employeeSearch.value = ''
    return
  }

  await loadAssignableEmployees()
})

watch(employeeSearch, () => {
  if (employeeSearchDebounce) clearTimeout(employeeSearchDebounce)
  employeeSearchDebounce = setTimeout(async () => {
    if (!assignDialogOpen.value) return
    await loadAssignableEmployees()
  }, 350)
})
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="!companyId" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>
        Company context is missing. Refresh your session and try again.
      </AlertDescription>
    </Alert>

    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-2">
      <Card class="border-[#edd3e8] bg-[#fcf5fa]">
        <CardHeader class="pb-2">
          <CardDescription>Total Departments</CardDescription>
          <CardTitle class="text-3xl text-[#7f2f75]">{{ totalDepartments }}</CardTitle>
        </CardHeader>
      </Card>
      <Card class="border-[#edd3e8] bg-white">
        <CardHeader class="pb-2">
          <CardDescription>Total Assigned Employees</CardDescription>
          <CardTitle class="text-3xl text-slate-900">{{ totalMembers }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card class="border-[#ead8e6]">
      <CardHeader class="space-y-4 pb-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <CardTitle class="text-xl">Departments</CardTitle>
            <CardDescription>
              Create and organize company departments.
            </CardDescription>
          </div>
          <Button
            v-if="canManage"
            size="sm"
            class="gap-2"
            style="background-color: #a03b93;"
            :disabled="departmentsSaving || !companyId"
            @click="openCreateDepartmentDialog"
          >
            <Plus class="h-4 w-4" />
            New
          </Button>
        </div>

        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="departmentSearch"
            class="pl-9"
            placeholder="Search departments"
            :disabled="!companyId"
          />
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <div v-if="departmentsLoading" class="space-y-2">
          <Skeleton v-for="index in 6" :key="`department-skeleton-${index}`" class="h-12 w-full" />
        </div>

        <div v-else-if="departments.length" class="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="department in departments"
                :key="department.id"
                :class="selectedDepartmentId === department.id ? 'bg-[#fcf5fa]' : ''"
              >
                <TableCell class="font-medium">
                  {{ department.name }}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {{ department.code || '—' }}
                </TableCell>
                <TableCell class="max-w-[320px] truncate text-muted-foreground">
                  {{ department.description || 'No description' }}
                </TableCell>
                <TableCell>
                  {{ Number(department.memberCount || 0) }}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {{ formatDate(department.updatedAt || department.createdAt) }}
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="outline" size="icon" class="h-8 w-8">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-52">
                      <DropdownMenuItem @click="openDepartmentMembersDialog(department)">
                        <Users class="h-4 w-4" />
                        View more
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="canManage"
                        :disabled="membersSaving || departmentsSaving"
                        @click="openAssignEmployeesDialog(department)"
                      >
                        <UserPlus class="h-4 w-4" />
                        Add employees
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="canManage"
                        :disabled="departmentsSaving"
                        @click="openEditDepartmentDialog(department)"
                      >
                        <Pencil class="h-4 w-4" />
                        Edit department
                      </DropdownMenuItem>
                      <DropdownMenuSeparator v-if="canManage" />
                      <DropdownMenuItem
                        v-if="canManage"
                        class="text-red-600 focus:text-red-600"
                        :disabled="departmentsSaving"
                        @click="requestDeleteDepartment(department)"
                      >
                        <Trash2 class="h-4 w-4" />
                        Delete department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div v-else class="rounded-xl border border-dashed p-8 text-center">
          <Building2 class="mx-auto h-8 w-8 text-muted-foreground" />
          <p class="mt-3 text-sm font-medium">No departments found</p>
          <p class="mt-1 text-xs text-muted-foreground">
            Create your first department to organize employees.
          </p>
        </div>

        <div class="flex items-center justify-between border-t pt-3">
          <p class="text-xs text-muted-foreground">
            Page {{ (departmentsPagination.currentPage || 0) + 1 }} of {{ Math.max(1, departmentsPagination.totalPages || 1) }}
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8"
              :disabled="!departmentsPagination.hasPrevious || departmentsLoading"
              @click="goToDepartmentPage('previous')"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8"
              :disabled="!departmentsPagination.hasNext || departmentsLoading"
              @click="goToDepartmentPage('next')"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="membersDialogOpen">
      <DialogContent class="sm:max-w-5xl">
        <DialogHeader class="space-y-3">
          <DialogTitle>{{ selectedDepartment?.name || 'Department Members' }}</DialogTitle>
          <DialogDescription>
            <template v-if="selectedDepartment">
              {{ selectedDepartment.description || 'Manage employees assigned to this department.' }}
            </template>
            <template v-else>
              Select a department to view and manage members.
            </template>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="relative w-full max-w-md">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="memberSearch"
                class="pl-9"
                placeholder="Search department members"
                :disabled="!selectedDepartmentId || !companyId"
              />
            </div>

            <Button
              v-if="selectedDepartment && canManage"
              class="gap-2"
              style="background-color: #a03b93;"
              :disabled="membersSaving || departmentsSaving || !companyId"
              @click="assignDialogOpen = true"
            >
              <UserPlus class="h-4 w-4" />
              Add Employees
            </Button>
          </div>

          <div v-if="!selectedDepartmentId" class="rounded-xl border border-dashed p-10 text-center">
            <Users class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm font-medium">No department selected</p>
          </div>

          <div v-else-if="membersLoading" class="space-y-2">
            <Skeleton v-for="index in 8" :key="`member-skeleton-${index}`" class="h-14 w-full" />
          </div>

          <div v-else-if="members.length" class="space-y-4">
            <div class="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="member in members" :key="`${member.departmentId}-${member.profileId}`">
                    <TableCell class="font-medium">
                      <div class="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage :src="member.profileAvatarUrl || ''" />
                          <AvatarFallback>{{ initials(resolveMemberName(member)) }}</AvatarFallback>
                        </Avatar>
                        <div class="min-w-0">
                          <p class="truncate">{{ resolveMemberName(member) }}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="text-muted-foreground">
                      {{ member.profileEmail || '—' }}
                    </TableCell>
                    <TableCell>{{ member.profileRole || 'Employee' }}</TableCell>
                    <TableCell>{{ formatDate(member.joinedAt || member.createdAt) }}</TableCell>
                    <TableCell class="text-right">
                      <Button
                        v-if="canManage"
                        variant="outline"
                        size="sm"
                        class="h-8 gap-1 px-2 text-xs text-red-600 hover:text-red-700"
                        :disabled="membersSaving || !companyId"
                        @click="removeEmployeeFromDepartment(member)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-xs text-muted-foreground">
                Page {{ (membersPagination.currentPage || 0) + 1 }} of {{ Math.max(1, membersPagination.totalPages || 1) }}
              </p>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8"
                  :disabled="!membersPagination.hasPrevious || membersLoading"
                  @click="goToMembersPage('previous')"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8"
                  :disabled="!membersPagination.hasNext || membersLoading"
                  @click="goToMembersPage('next')"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="rounded-xl border border-dashed p-10 text-center">
            <Users class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm font-medium">No employees assigned</p>
            <p class="mt-1 text-xs text-muted-foreground">
              Add employees to this department to start organizing your directory.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="membersDialogOpen = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="departmentDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {{ departmentDialogMode === 'create' ? 'Create Department' : 'Edit Department' }}
          </DialogTitle>
          <DialogDescription>
            {{ departmentDialogMode === 'create'
              ? 'Add a new department for employee organization.'
              : 'Update department information.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="department-name">Name *</Label>
            <Input
              id="department-name"
              v-model="departmentForm.name"
              placeholder="e.g. Flight Operations"
            />
          </div>

          <div class="space-y-2">
            <Label for="department-code">Code</Label>
            <Input
              id="department-code"
              v-model="departmentForm.code"
              placeholder="e.g. OPS"
            />
          </div>

          <div class="space-y-2">
            <Label for="department-description">Description</Label>
            <Textarea
              id="department-description"
              v-model="departmentForm.description"
              rows="3"
              placeholder="Optional department description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="departmentDialogOpen = false">
            Cancel
          </Button>
          <Button
            style="background-color: #a03b93;"
            :disabled="!isDepartmentFormValid || departmentsSaving"
            @click="saveDepartment"
          >
            {{ departmentsSaving ? 'Saving...' : (departmentDialogMode === 'create' ? 'Create Department' : 'Save Changes') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>
            This removes <strong>{{ pendingDeleteDepartment?.name }}</strong> and unassigns its employees from the department.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            :disabled="departmentsSaving"
            @click="deleteDepartment"
          >
            {{ departmentsSaving ? 'Deleting...' : 'Delete Department' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="assignDialogOpen">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Employees To {{ selectedDepartment?.name || 'Department' }}</DialogTitle>
          <DialogDescription>
            Search employees and select one or more profiles to assign.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="employeeSearch"
              class="pl-9"
              placeholder="Search employees by name or email"
            />
          </div>

          <div v-if="employeesLoading" class="space-y-2">
            <Skeleton v-for="index in 6" :key="`employee-assign-skeleton-${index}`" class="h-12 w-full" />
          </div>

          <div v-else-if="assignableEmployees.length" class="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-2">
            <label
              v-for="profile in assignableEmployees"
              :key="profile.id"
              class="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 transition-colors hover:bg-muted/30"
            >
              <div class="flex min-w-0 items-center gap-3">
                <Checkbox
                  :checked="selectedAssignableIdSet.has(profile.id)"
                  @update:checked="value => toggleAssignableProfile(profile.id, value)"
                />
                <Avatar size="sm">
                  <AvatarImage :src="profile.avatarUrl || ''" />
                  <AvatarFallback>{{ initials(resolveProfileName(profile)) }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ resolveProfileName(profile) }}</p>
                  <p class="truncate text-xs text-muted-foreground">{{ profile.email || profile.username || '—' }}</p>
                </div>
              </div>
              <Badge variant="outline">
                {{ profile.role || 'Employee' }}
              </Badge>
            </label>
          </div>

          <div v-else class="rounded-xl border border-dashed p-8 text-center">
            <p class="text-sm font-medium">No assignable employees found</p>
            <p class="mt-1 text-xs text-muted-foreground">
              Try another search query or invite new employees.
            </p>
          </div>
        </div>

        <DialogFooter class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">
            {{ selectedAssignableProfileIds.length }} selected
          </p>
          <div class="flex gap-2">
            <Button variant="outline" @click="assignDialogOpen = false">
              Cancel
            </Button>
            <Button
              style="background-color: #a03b93;"
              :disabled="!selectedAssignableProfileIds.length || membersSaving"
              @click="addEmployeesToDepartment"
            >
              {{ membersSaving ? 'Assigning...' : 'Add To Department' }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
