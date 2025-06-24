<template>
  <div class="p-6 space-y-6">
    <!-- Breadcrumb Navigation -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            @click="() => navigateTo('/app')" 
            class="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
          >
            <HomeIcon class="h-4 w-4" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink 
            @click="() => navigateTo('/app/settings')" 
            class="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
          >
            <SettingsIcon class="h-4 w-4" />
            Settings
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage class="flex items-center gap-1">
            <RulerIcon class="h-4 w-4" />
            Units of Measure
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Units of Measure</h2>
        <p class="text-muted-foreground">Manage measurement units, conversions, and unit families for your inventory</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="refreshUnits" :disabled="isLoading">
          <RefreshCwIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileUp class="h-4 w-4 mr-2" />
              Import
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openImportSheet('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Import Excel
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('json')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Import JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportUnits('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportUnits('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportUnits('json')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Export JSON
            </DropdownMenuItem>
          </DropdownMenuContent>        </DropdownMenu>
        <Button @click="openUnitWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Unit
        </Button>
      </div>
    </div>

    <!-- View Mode Selector -->
    <div class="flex items-center justify-between border-b">
      <div class="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="viewMode = 'table'"
          :class="{ 'bg-muted': viewMode === 'table' }"
        >
          <TableIcon class="h-4 w-4 mr-2" />
          Table View
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="viewMode = 'hierarchy'"
          :class="{ 'bg-muted': viewMode === 'hierarchy' }"
        >
          <NetworkIcon class="h-4 w-4 mr-2" />
          Family Hierarchy
        </Button>
      </div>
      <div v-if="viewMode === 'table'" class="text-sm text-muted-foreground">
        {{ units.length }} units • {{ baseUnits.length }} families
      </div>
      <div v-else class="text-sm text-muted-foreground">
        {{ baseUnits.length }} unit families • {{ units.length - baseUnits.length }} conversion units
      </div>
    </div>

    <!-- Table View -->
    <UnitsOfMeasureTable
      v-if="viewMode === 'table'"
      :units="units"
      :base-units="baseUnits"
      :categories="categories"
      :loading="isLoading"
      @view-unit="openUnitDetails"
      @edit-unit="openUnitEditor"
      @duplicate-unit="handleDuplicateUnit"
      @delete-unit="openDeleteUnitDialog"
      @activate-unit="handleActivateUnit"
      @deactivate-unit="handleDeactivateUnit"
      @view-family="switchToHierarchyView"
      @convert-units="openConversionDialog"
      @refresh="refreshUnits"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Hierarchy View -->
    <UnitsHierarchyViewer
      v-else-if="viewMode === 'hierarchy'"
      :units="units"
      :loading="isLoading"
      :error="error"
      @view-unit="openUnitDetails"
      @edit-unit="openUnitEditor"
      @duplicate-unit="handleDuplicateUnit"
      @delete-unit="openDeleteUnitDialog"
      @create-unit="openUnitWizard"
      @convert-units="openConversionDialog"
      @refresh="refreshUnits"
    />
    
    <!-- Unit Creation Wizard Dialog -->
    <Sheet v-model:open="showUnitWizard" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Create Unit of Measure</SheetTitle>
          <SheetDescription>
            Create a new unit of measure with conversions and settings
          </SheetDescription>
        </SheetHeader>
        <div class="flex-1 min-h-0">
          <UnitCreationWizard
            v-if="showUnitWizard"
            :open="showUnitWizard"
            :base-units="baseUnits"
            :categories="categories"
            @update:open="showUnitWizard = $event"
            @created="handleUnitCreated"
          />
        </div>
      </SheetContent>
    </Sheet>
    
    <!-- Unit Details Dialog -->
    <UnitDetailsDialog
      :open="showUnitDetailsDialog"
      :unit="selectedUnit"
      :unit-family="selectedUnitFamily"
      @update:open="showUnitDetailsDialog = $event"
      @edit="openUnitEditor"
    />    
    
    <!-- Unit Editor Sheet -->
    <Sheet v-model:open="showUnitEditorSheet" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Edit Unit of Measure</SheetTitle>
          <SheetDescription>
            Update unit information and settings
          </SheetDescription>
        </SheetHeader>        
        <div class="flex-1 min-h-0">
          <UnitEditorSheet
            :open="showUnitEditorSheet"
            :unit="selectedUnit"
            :base-units="baseUnits"
            @update:open="showUnitEditorSheet = $event"
            @updated="handleUnitUpdated"
          />
        </div>      </SheetContent>
    </Sheet>

    <!-- Add Conversion Dialog -->
    <Dialog v-model:open="showAddConversionDialog">
      <AddConversionUnitDialog
        v-if="showAddConversionDialog"
        :base-unit="selectedBaseUnit"
        @conversion-added="handleConversionAdded"
        @close="showAddConversionDialog = false"
      />
    </Dialog>   
    
    <!-- Unit Conversion Dialog -->
    <Dialog v-model:open="showConversionDialog">
      <UnitConversionDialog
        v-if="showConversionDialog"
        :open="showConversionDialog"
        :units="units"
        :categories="categories"
        @update:open="showConversionDialog = $event"
      />
    </Dialog>

    <!-- Delete Unit Dialog -->
    <Dialog v-model:open="showDeleteUnitDialog">
      <DeleteUnitDialog
        v-if="showDeleteUnitDialog"
        :unit="selectedUnit"
        @delete="handleUnitDeleted"
        @close="showDeleteUnitDialog = false"
      />
    </Dialog>
      
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditUnitsDialog
        v-if="showBulkEditDialog"
        :open="showBulkEditDialog"
        :selected-units="selectedBulkUnits"
        :base-units="baseUnits"
        :categories="categories"
        @update:open="showBulkEditDialog = $event"
        @units-updated="handleBulkUpdate"
      />
    </Dialog>    
    
    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SheetContent class="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Import Units of Measure</SheetTitle>
          <SheetDescription>
            Import units from CSV, Excel, or template files
          </SheetDescription>
        </SheetHeader>
        <div class="flex-1 min-h-0">
          <UnitImportSheet
            v-if="showImportSheet"
            :import-type="importType"
            :categories="categories"
            @import-complete="handleImportComplete"
            @close="showImportSheet = false"
          />
        </div>
      </SheetContent>
    </Sheet>

    <!-- Unit Templates Dialog -->
    <Dialog v-model:open="showTemplatesDialog" class="sm:max-w-[700px]">
      <UnitTemplatesDialog
        v-if="showTemplatesDialog"
        @template-applied="handleTemplateApplied"
        @close="showTemplatesDialog = false"
      />
    </Dialog>

    <!-- Unit Statistics Dialog -->
    <Dialog v-model:open="showStatisticsDialog" class="sm:max-w-[600px]">
      <UnitStatisticsDialog
        v-if="showStatisticsDialog"
        :statistics="statistics"
        @close="showStatisticsDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { navigateTo } from 'nuxt/app'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet, Table2, FileTextIcon,
  DownloadIcon, RefreshCwIcon, HomeIcon, SettingsIcon, ChevronRightIcon,
  RulerIcon, TableIcon, NetworkIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import UnitsOfMeasureTable from '@/components/inventory/uom/UnitsOfMeasureTable.vue'
import UnitsHierarchyViewer from '@/components/inventory/uom/UnitsHierarchyViewer.vue'
import UnitCreationWizard from '@/components/inventory/uom/UnitCreationWizard.vue'
import UnitFamilyTreeNode from '@/components/inventory/uom/UnitFamilyTreeNode.vue'
import UnitDetailsDialog from '@/components/inventory/uom/UnitDetailsDialog.vue'
import UnitEditorSheet from '@/components/inventory/uom/UnitEditorSheet.vue'
import AddConversionUnitDialog from '@/components/inventory/uom/AddConversionUnitDialog.vue'
import UnitConversionDialog from '@/components/inventory/uom/UnitConversionDialog.vue'
import DeleteUnitDialog from '@/components/inventory/uom/DeleteUnitDialog.vue'
import BulkEditUnitsDialog from '@/components/inventory/uom/BulkEditUnitsDialog.vue'
import UnitImportSheet from '@/components/inventory/uom/UnitImportSheet.vue'
import UnitTemplatesDialog from '@/components/inventory/uom/UnitTemplatesDialog.vue'
import UnitStatisticsDialog from '@/components/inventory/uom/UnitStatisticsDialog.vue'

// Stores
import { useUomStore } from '@/store/modules/inventory/uom'

// Initialize stores
const uomStore = useUomStore()
const { toast } = useToast()

// Access store state through computed properties
const units = computed(() => uomStore.getUnitsList)
const baseUnits = computed(() => uomStore.getBaseUnits)
const categories = computed(() => uomStore.getCategories)
const statistics = computed(() => uomStore.getStatistics)
const isLoading = computed(() => uomStore.getIsLoading)
const error = computed(() => uomStore.getError)

// State management
const selectedUnit = ref(null)
const selectedBaseUnit = ref(null)
const selectedUnitFamily = ref(null)
const selectedBulkUnits = ref([])

// UI control
const viewMode = ref('table')
const showUnitWizard = ref(false)
const showUnitDetailsDialog = ref(false)
const showUnitEditorSheet = ref(false)
const showAddConversionDialog = ref(false)
const showConversionDialog = ref(false)
const showDeleteUnitDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const showTemplatesDialog = ref(false)
const showStatisticsDialog = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const refreshUnits = async () => {
  try {
    await uomStore.refreshAllData()
  } catch (error) {
    console.error('Error refreshing units:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openUnitWizard = () => {
  showUnitWizard.value = true
}

const openUnitDetails = async (unit) => {
  selectedUnit.value = unit
  
  // Fetch unit family if it's a base unit or part of a family
  if (unit.baseUnit) {
    try {
      const family = await uomStore.fetchUnitFamily(unit.id)
      selectedUnitFamily.value = family
    } catch (error) {
      console.error('Error fetching unit family:', error)
    }
  } else if (unit.baseUnitOfMeasure) {
    try {
      const family = await uomStore.fetchUnitFamily(unit.baseUnitOfMeasure.id)
      selectedUnitFamily.value = family
    } catch (error) {
      console.error('Error fetching unit family:', error)
    }
  }
  
  showUnitDetailsDialog.value = true
}

const openUnitEditor = (unit) => {
  selectedUnit.value = unit
  showUnitEditorSheet.value = true
}

const switchToHierarchyView = async (baseUnit) => {
  selectedBaseUnit.value = baseUnit
  viewMode.value = 'hierarchy'
  
  // Optional: Could add logic to expand the specific family in hierarchy view
  try {
    const family = await uomStore.fetchUnitFamily(baseUnit.id)
    selectedUnitFamily.value = family
  } catch (error) {
    console.error('Error fetching unit family:', error)
    toast({
      title: 'Info',
      description: 'Switched to hierarchy view to show unit family.',
      variant: 'default'
    })
  }
}

const openAddConversionDialog = (baseUnit) => {
  selectedBaseUnit.value = baseUnit
  showAddConversionDialog.value = true
}

const openConversionDialog = () => {
  showConversionDialog.value = true
}

const openDeleteUnitDialog = (unit) => {
  selectedUnit.value = unit
  showDeleteUnitDialog.value = true
}

const openBulkEditDialog = (units) => {
  selectedBulkUnits.value = units
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

const openTemplatesDialog = () => {
  showTemplatesDialog.value = true
}

const openStatisticsDialog = async () => {
  try {
    await uomStore.fetchStatistics()
    showStatisticsDialog.value = true
  } catch (error) {
    console.error('Error fetching statistics:', error)
    toast({
      title: 'Error',
      description: 'Failed to load statistics. Please try again.',
      variant: 'destructive'
    })
  }
}

// CRUD operation handlers
const handleUnitCreated = async (newUnit) => {
  try {
    await uomStore.createUnit(newUnit)
    showUnitWizard.value = false
    
    toast({
      title: 'Unit Created',
      description: `${newUnit.name} (${newUnit.code}) has been created successfully.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error creating unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to create unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleUnitUpdated = async (updateData) => {
  try {
    await uomStore.updateUnit(selectedUnit.value.id, updateData)
    showUnitEditorSheet.value = false
    
    toast({
      title: 'Unit Updated',
      description: `${updateData.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error updating unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to update unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleUnitDeleted = async (unit) => {
  try {
    await uomStore.deleteUnit(unit.id)
    showDeleteUnitDialog.value = false
    
    toast({
      title: 'Unit Deleted',
      description: `${unit.name} has been deleted.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error deleting unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateUnit = async (unit) => {
  try {
    const newCode = `${unit.code}_COPY`
    const newName = `${unit.name} (Copy)`
    
    await uomStore.cloneUnit(unit.id, newCode, newName)
    
    toast({
      title: 'Unit Duplicated',
      description: `A copy of ${unit.name} has been created.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error duplicating unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleActivateUnit = async (unit) => {
  try {
    await uomStore.activateUnit(unit.id)
    
    toast({
      title: 'Unit Activated',
      description: `${unit.name} has been activated.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error activating unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to activate unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDeactivateUnit = async (unit) => {
  try {
    await uomStore.deactivateUnit(unit.id)
    
    toast({
      title: 'Unit Deactivated',
      description: `${unit.name} has been deactivated.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error deactivating unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to deactivate unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleConversionAdded = async (conversionUnit) => {
  try {
    await uomStore.createUnit(conversionUnit)
    showAddConversionDialog.value = false
    
    toast({
      title: 'Conversion Unit Added',
      description: `${conversionUnit.name} has been added to the unit family.`,
      variant: 'success'
    })    
    await refreshUnits()
  } catch (error) {
    console.error('Error adding conversion unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to add conversion unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleRemoveConversion = async (conversionUnit) => {
  try {
    await uomStore.deleteUnit(conversionUnit.id)
    
    toast({
      title: 'Conversion Unit Removed',
      description: `${conversionUnit.name} has been removed from the unit family.`,
      variant: 'success'    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error removing conversion unit:', error)
    toast({
      title: 'Error',
      description: 'Failed to remove conversion unit. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleConversionPerformed = async (conversionParams) => {
  try {
    const result = await uomStore.convertQuantity(conversionParams)
    
    toast({
      title: 'Conversion Complete',
      description: `${conversionParams.quantity} converted successfully.`,
      variant: 'success'
    })
    
    return result
  } catch (error) {
    console.error('Error performing conversion:', error)
    toast({
      title: 'Error',
      description: 'Failed to perform conversion. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (units, updates) => {
  try {
    const updateRequests = units.map(unit => ({
      id: unit.id,
      unit: updates
    }))
    
    await uomStore.bulkUpdateUnits(updateRequests)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Units Updated',
      description: `${units.length} units have been updated.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error bulk updating units:', error)
    toast({
      title: 'Error',
      description: 'Failed to update units. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.imported} units imported, ${result.skipped} skipped.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } else {
    toast({
      title: 'Import Failed',
      description: result.errors?.join(', ') || 'Failed to import units. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTemplateApplied = async (template) => {
  try {
    await uomStore.applyUnitTemplate(template.name)
    showTemplatesDialog.value = false
    
    toast({
      title: 'Template Applied',
      description: `${template.name} template has been applied successfully.`,
      variant: 'success'
    })
    
    await refreshUnits()
  } catch (error) {
    console.error('Error applying template:', error)
    toast({
      title: 'Error',
      description: 'Failed to apply template. Please try again.',
      variant: 'destructive'
    })
  }
}

// Export functionality
const exportUnits = async (format) => {
  try {
    const blob = await uomStore.exportUnits(format)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `units-of-measure-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Complete',
      description: `Units exported in ${format.toUpperCase()} format.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error exporting units:', error)
    toast({
      title: 'Error',
      description: 'Failed to export units. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(async () => {
  await refreshUnits()
})
</script>
