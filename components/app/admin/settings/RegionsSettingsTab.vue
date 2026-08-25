<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyLocationCatalogStore } from '~/store/modules/company-location-catalog'
import type { CompanyRegionRecord } from '~/http/requests/app/companyLocationCatalog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Textarea } from '~/components/ui/textarea'
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  companyId?: string
  canManage?: boolean
}>(), {
  companyId: '',
  canManage: false,
})

type RegionDialogMode = 'create' | 'edit'

const locationCatalogStore = useCompanyLocationCatalogStore()
const {
  regionsLoading,
  regionsSaving,
  error,
  regions,
  regionsPagination,
} = storeToRefs(locationCatalogStore)

const regionSearch = ref('')
const regionDialogOpen = ref(false)
const regionDialogMode = ref<RegionDialogMode>('create')
const editingRegionId = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const pendingDeleteRegion = ref<CompanyRegionRecord | null>(null)
const regionForm = ref({
  name: '',
  code: '',
  description: '',
  isActive: true,
})

const isRegionFormValid = computed(() => regionForm.value.name.trim().length >= 2)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const resetRegionForm = (region?: CompanyRegionRecord | null) => {
  regionForm.value = {
    name: region?.name || '',
    code: String(region?.code || ''),
    description: String(region?.description || ''),
    isActive: region?.isActive !== false,
  }
}

const loadRegionsWorkspace = async (page = 0) => {
  if (!props.companyId) return
  try {
    await locationCatalogStore.loadRegions({
      companyId: props.companyId,
      page,
      size: regionsPagination.value.pageSize || 100,
      search: regionSearch.value,
    })
  } catch {
    // Store error state already set.
  }
}

const openCreateRegionDialog = () => {
  regionDialogMode.value = 'create'
  editingRegionId.value = null
  resetRegionForm(null)
  regionDialogOpen.value = true
}

const openEditRegionDialog = (region: CompanyRegionRecord) => {
  regionDialogMode.value = 'edit'
  editingRegionId.value = region.id
  resetRegionForm(region)
  regionDialogOpen.value = true
}

const saveRegion = async () => {
  if (!props.companyId || !isRegionFormValid.value) return

  const payload = {
    name: regionForm.value.name.trim(),
    code: regionForm.value.code.trim(),
    description: regionForm.value.description.trim(),
    ...(regionDialogMode.value === 'edit' ? { isActive: regionForm.value.isActive } : {}),
  }

  try {
    if (regionDialogMode.value === 'create') {
      await locationCatalogStore.createRegion(props.companyId, payload)
    } else if (editingRegionId.value) {
      await locationCatalogStore.updateRegion(props.companyId, editingRegionId.value, payload)
    }

    regionDialogOpen.value = false
    await loadRegionsWorkspace(regionsPagination.value.currentPage || 0)
  } catch {
    // Store error + toast handled in store.
  }
}

const requestDeleteRegion = (region: CompanyRegionRecord) => {
  pendingDeleteRegion.value = region
  deleteDialogOpen.value = true
}

const deleteRegion = async () => {
  if (!props.companyId || !pendingDeleteRegion.value?.id) return

  try {
    await locationCatalogStore.deleteRegion(props.companyId, pendingDeleteRegion.value.id)
    deleteDialogOpen.value = false
    pendingDeleteRegion.value = null
    await loadRegionsWorkspace(regionsPagination.value.currentPage || 0)
  } catch {
    // Store error + toast handled in store.
  }
}

const goToRegionPage = async (page: number) => {
  if (page < 0 || page >= regionsPagination.value.totalPages) return
  await loadRegionsWorkspace(page)
}

watch(() => props.companyId, async companyId => {
  if (companyId) {
    await loadRegionsWorkspace(0)
  }
}, { immediate: true })

watch(regionSearch, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => loadRegionsWorkspace(0), 300)
})
</script>

<template>
  <Card>
    <CardHeader class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <CardTitle>Regions</CardTitle>
        <CardDescription>Manage the regions used for cohort setup, self-join intake, and reporting.</CardDescription>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="regionsLoading || !companyId" @click="loadRegionsWorkspace(regionsPagination.currentPage || 0)">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': regionsLoading }" />
          Refresh
        </Button>
        <Button :disabled="!canManage || !companyId" @click="openCreateRegionDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create region
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <Alert v-if="error" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Alert v-if="!canManage" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>Corporate admin access is required to manage regions.</AlertDescription>
      </Alert>

      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="regionSearch" class="pl-9" placeholder="Search regions" />
      </div>

      <div v-if="regionsLoading" class="space-y-3">
        <Skeleton v-for="index in 4" :key="`region-skeleton-${index}`" class="h-12 w-full" />
      </div>

      <div v-else-if="!regions.length" class="rounded-lg border border-dashed p-10 text-center">
        <MapPin class="mx-auto h-9 w-9 text-muted-foreground" />
        <p class="mt-3 text-sm font-medium">No regions configured yet.</p>
        <p class="mt-1 text-sm text-muted-foreground">Create regions such as Kenya, Uganda, or East Africa before setting up cohorts.</p>
        <Button class="mt-4" :disabled="!canManage || !companyId" @click="openCreateRegionDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create region
        </Button>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Chapters</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead class="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="region in regions" :key="region.id">
              <TableCell>
                <div class="font-medium">{{ region.name }}</div>
                <div v-if="region.description" class="text-xs text-muted-foreground">{{ region.description }}</div>
              </TableCell>
              <TableCell>{{ region.code || '-' }}</TableCell>
              <TableCell>{{ region.chapterCount || 0 }}</TableCell>
              <TableCell>
                <Badge :variant="region.isActive === false ? 'outline' : 'default'">
                  {{ region.isActive === false ? 'Inactive' : 'Active' }}
                </Badge>
              </TableCell>
              <TableCell>{{ formatDate(region.updatedAt || region.createdAt) }}</TableCell>
              <TableCell>
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" :disabled="!canManage" @click="openEditRegionDialog(region)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" :disabled="!canManage" @click="requestDeleteRegion(region)">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div v-if="regionsPagination.totalPages > 1" class="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!regionsPagination.hasPrevious"
          @click="goToRegionPage((regionsPagination.currentPage || 0) - 1)"
        >
          <ChevronLeft class="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span class="text-sm text-muted-foreground">
          Page {{ (regionsPagination.currentPage || 0) + 1 }} of {{ regionsPagination.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!regionsPagination.hasNext"
          @click="goToRegionPage((regionsPagination.currentPage || 0) + 1)"
        >
          Next
          <ChevronRight class="ml-1 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>

  <Dialog v-model:open="regionDialogOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ regionDialogMode === 'create' ? 'Create region' : 'Edit region' }}</DialogTitle>
        <DialogDescription>Regions keep cohort setup and reporting consistent across cycles.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid gap-2">
          <Label for="region-name">Name</Label>
          <Input id="region-name" v-model="regionForm.name" placeholder="Kenya" />
        </div>

        <div class="grid gap-2">
          <Label for="region-code">Code</Label>
          <Input id="region-code" v-model="regionForm.code" placeholder="KE" />
        </div>

        <div class="grid gap-2">
          <Label for="region-description">Description</Label>
          <Textarea id="region-description" v-model="regionForm.description" placeholder="Optional notes for admins" />
        </div>

        <div v-if="regionDialogMode === 'edit'" class="rounded-lg border p-4">
          <div class="flex items-start gap-3">
            <Checkbox
              :checked="regionForm.isActive"
              @update:checked="value => regionForm.isActive = value === true"
            />
            <div>
              <div class="text-sm font-medium">Active</div>
              <p class="text-xs text-muted-foreground">Inactive regions stay in history but are hidden from new cohort dropdowns.</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="regionsSaving" @click="regionDialogOpen = false">Cancel</Button>
        <Button :disabled="regionsSaving || !isRegionFormValid" @click="saveRegion">
          {{ regionDialogMode === 'create' ? 'Create region' : 'Save region' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="deleteDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete region</DialogTitle>
        <DialogDescription>
          Delete {{ pendingDeleteRegion?.name || 'this region' }} from the catalog. Existing cohort snapshots keep their saved text.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="regionsSaving" @click="deleteDialogOpen = false">Cancel</Button>
        <Button variant="destructive" :disabled="regionsSaving" @click="deleteRegion">Delete region</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
