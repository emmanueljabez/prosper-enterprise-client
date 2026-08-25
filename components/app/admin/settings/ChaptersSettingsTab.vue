<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyLocationCatalogStore } from '~/store/modules/company-location-catalog'
import type { CompanyChapterRecord } from '~/http/requests/app/companyLocationCatalog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Textarea } from '~/components/ui/textarea'
import { AlertCircle, ChevronLeft, ChevronRight, GitBranch, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  companyId?: string
  canManage?: boolean
}>(), {
  companyId: '',
  canManage: false,
})

type ChapterDialogMode = 'create' | 'edit'

const ALL_REGIONS = '__ALL_REGIONS__'
const NO_REGION = '__NO_REGION__'

const locationCatalogStore = useCompanyLocationCatalogStore()
const {
  chaptersLoading,
  chaptersSaving,
  regionsLoading,
  error,
  chapters,
  activeRegions,
  chaptersPagination,
} = storeToRefs(locationCatalogStore)

const chapterSearch = ref('')
const chapterRegionFilter = ref(ALL_REGIONS)
const chapterDialogOpen = ref(false)
const chapterDialogMode = ref<ChapterDialogMode>('create')
const editingChapterId = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const pendingDeleteChapter = ref<CompanyChapterRecord | null>(null)
const chapterForm = ref({
  name: '',
  code: '',
  description: '',
  regionId: NO_REGION,
  isActive: true,
})

const isChapterFormValid = computed(() => chapterForm.value.name.trim().length >= 2)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const selectedFilterRegionId = computed(() =>
  chapterRegionFilter.value === ALL_REGIONS ? null : chapterRegionFilter.value,
)

const resetChapterForm = (chapter?: CompanyChapterRecord | null) => {
  chapterForm.value = {
    name: chapter?.name || '',
    code: String(chapter?.code || ''),
    description: String(chapter?.description || ''),
    regionId: chapter?.regionId || NO_REGION,
    isActive: chapter?.isActive !== false,
  }
}

const loadChaptersWorkspace = async (page = 0) => {
  if (!props.companyId) return
  try {
    await locationCatalogStore.loadChapters({
      companyId: props.companyId,
      page,
      size: chaptersPagination.value.pageSize || 100,
      search: chapterSearch.value,
      regionId: selectedFilterRegionId.value,
    })
  } catch {
    // Store error state already set.
  }
}

const loadReferenceRegions = async () => {
  if (!props.companyId) return
  try {
    await locationCatalogStore.loadRegions({
      companyId: props.companyId,
      page: 0,
      size: 100,
      search: '',
    })
  } catch {
    // Store error state already set.
  }
}

const openCreateChapterDialog = () => {
  chapterDialogMode.value = 'create'
  editingChapterId.value = null
  resetChapterForm(null)
  chapterDialogOpen.value = true
}

const openEditChapterDialog = (chapter: CompanyChapterRecord) => {
  chapterDialogMode.value = 'edit'
  editingChapterId.value = chapter.id
  resetChapterForm(chapter)
  chapterDialogOpen.value = true
}

const saveChapter = async () => {
  if (!props.companyId || !isChapterFormValid.value) return

  const payload = {
    name: chapterForm.value.name.trim(),
    code: chapterForm.value.code.trim(),
    description: chapterForm.value.description.trim(),
    regionId: chapterForm.value.regionId === NO_REGION ? null : chapterForm.value.regionId,
    ...(chapterDialogMode.value === 'edit' ? { isActive: chapterForm.value.isActive } : {}),
  }

  try {
    if (chapterDialogMode.value === 'create') {
      await locationCatalogStore.createChapter(props.companyId, payload)
    } else if (editingChapterId.value) {
      await locationCatalogStore.updateChapter(props.companyId, editingChapterId.value, payload)
    }

    chapterDialogOpen.value = false
    await loadChaptersWorkspace(chaptersPagination.value.currentPage || 0)
    await loadReferenceRegions()
  } catch {
    // Store error + toast handled in store.
  }
}

const requestDeleteChapter = (chapter: CompanyChapterRecord) => {
  pendingDeleteChapter.value = chapter
  deleteDialogOpen.value = true
}

const deleteChapter = async () => {
  if (!props.companyId || !pendingDeleteChapter.value?.id) return

  try {
    await locationCatalogStore.deleteChapter(props.companyId, pendingDeleteChapter.value.id)
    deleteDialogOpen.value = false
    pendingDeleteChapter.value = null
    await loadChaptersWorkspace(chaptersPagination.value.currentPage || 0)
    await loadReferenceRegions()
  } catch {
    // Store error + toast handled in store.
  }
}

const goToChapterPage = async (page: number) => {
  if (page < 0 || page >= chaptersPagination.value.totalPages) return
  await loadChaptersWorkspace(page)
}

watch(() => props.companyId, async companyId => {
  if (companyId) {
    await Promise.all([
      loadReferenceRegions(),
      loadChaptersWorkspace(0),
    ])
  }
}, { immediate: true })

watch(chapterSearch, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => loadChaptersWorkspace(0), 300)
})

watch(chapterRegionFilter, () => {
  loadChaptersWorkspace(0)
})
</script>

<template>
  <Card>
    <CardHeader class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <CardTitle>Chapters</CardTitle>
        <CardDescription>Manage the chapters or sites that participants can be assigned to inside a region.</CardDescription>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="chaptersLoading || !companyId" @click="loadChaptersWorkspace(chaptersPagination.currentPage || 0)">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': chaptersLoading }" />
          Refresh
        </Button>
        <Button :disabled="!canManage || !companyId" @click="openCreateChapterDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create chapter
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
        <AlertDescription>Corporate admin access is required to manage chapters.</AlertDescription>
      </Alert>

      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr),260px]">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="chapterSearch" class="pl-9" placeholder="Search chapters" />
        </div>

        <Select v-model="chapterRegionFilter">
          <SelectTrigger>
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_REGIONS">All regions</SelectItem>
            <SelectItem v-for="region in activeRegions" :key="region.id" :value="region.id">
              {{ region.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="chaptersLoading || regionsLoading" class="space-y-3">
        <Skeleton v-for="index in 4" :key="`chapter-skeleton-${index}`" class="h-12 w-full" />
      </div>

      <div v-else-if="!chapters.length" class="rounded-lg border border-dashed p-10 text-center">
        <GitBranch class="mx-auto h-9 w-9 text-muted-foreground" />
        <p class="mt-3 text-sm font-medium">No chapters configured yet.</p>
        <p class="mt-1 text-sm text-muted-foreground">Create chapters such as Nairobi, Mombasa, or KQ HQ before setting up cohorts.</p>
        <Button class="mt-4" :disabled="!canManage || !companyId" @click="openCreateChapterDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create chapter
        </Button>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead class="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="chapter in chapters" :key="chapter.id">
              <TableCell>
                <div class="font-medium">{{ chapter.name }}</div>
                <div v-if="chapter.description" class="text-xs text-muted-foreground">{{ chapter.description }}</div>
              </TableCell>
              <TableCell>{{ chapter.code || '-' }}</TableCell>
              <TableCell>{{ chapter.regionName || '-' }}</TableCell>
              <TableCell>
                <Badge :variant="chapter.isActive === false ? 'outline' : 'default'">
                  {{ chapter.isActive === false ? 'Inactive' : 'Active' }}
                </Badge>
              </TableCell>
              <TableCell>{{ formatDate(chapter.updatedAt || chapter.createdAt) }}</TableCell>
              <TableCell>
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" :disabled="!canManage" @click="openEditChapterDialog(chapter)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" :disabled="!canManage" @click="requestDeleteChapter(chapter)">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div v-if="chaptersPagination.totalPages > 1" class="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!chaptersPagination.hasPrevious"
          @click="goToChapterPage((chaptersPagination.currentPage || 0) - 1)"
        >
          <ChevronLeft class="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span class="text-sm text-muted-foreground">
          Page {{ (chaptersPagination.currentPage || 0) + 1 }} of {{ chaptersPagination.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!chaptersPagination.hasNext"
          @click="goToChapterPage((chaptersPagination.currentPage || 0) + 1)"
        >
          Next
          <ChevronRight class="ml-1 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>

  <Dialog v-model:open="chapterDialogOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ chapterDialogMode === 'create' ? 'Create chapter' : 'Edit chapter' }}</DialogTitle>
        <DialogDescription>Chapters keep cohort setup and participant intake aligned to configured sites.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid gap-2">
          <Label for="chapter-name">Name</Label>
          <Input id="chapter-name" v-model="chapterForm.name" placeholder="Nairobi" />
        </div>

        <div class="grid gap-2">
          <Label for="chapter-code">Code</Label>
          <Input id="chapter-code" v-model="chapterForm.code" placeholder="NBO" />
        </div>

        <div class="grid gap-2">
          <Label for="chapter-region">Region</Label>
          <Select v-model="chapterForm.regionId">
            <SelectTrigger id="chapter-region">
              <SelectValue placeholder="No region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="NO_REGION">No region</SelectItem>
              <SelectItem v-for="region in activeRegions" :key="region.id" :value="region.id">
                {{ region.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="chapter-description">Description</Label>
          <Textarea id="chapter-description" v-model="chapterForm.description" placeholder="Optional notes for admins" />
        </div>

        <div v-if="chapterDialogMode === 'edit'" class="rounded-lg border p-4">
          <div class="flex items-start gap-3">
            <Checkbox
              :checked="chapterForm.isActive"
              @update:checked="value => chapterForm.isActive = value === true"
            />
            <div>
              <div class="text-sm font-medium">Active</div>
              <p class="text-xs text-muted-foreground">Inactive chapters stay in history but are hidden from new cohort dropdowns.</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="chaptersSaving" @click="chapterDialogOpen = false">Cancel</Button>
        <Button :disabled="chaptersSaving || !isChapterFormValid" @click="saveChapter">
          {{ chapterDialogMode === 'create' ? 'Create chapter' : 'Save chapter' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="deleteDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete chapter</DialogTitle>
        <DialogDescription>
          Delete {{ pendingDeleteChapter?.name || 'this chapter' }} from the catalog. Existing cohort snapshots keep their saved text.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="chaptersSaving" @click="deleteDialogOpen = false">Cancel</Button>
        <Button variant="destructive" :disabled="chaptersSaving" @click="deleteChapter">Delete chapter</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
