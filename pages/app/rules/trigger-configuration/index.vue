<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Sync Rules</h2>
        <p class="text-muted-foreground">Configure rules for when inventory updates are pushed to the catalog</p>
      </div>
      <div class="flex items-center space-x-2">
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCreateRuleDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>
    </div>

    <!-- Rules Table -->
    <SyncRulesTable
      :rules="rules"
      :loading="isLoading"
      @view-rule="viewRuleDetails"
      @edit-rule="editRule"
      @duplicate-rule="duplicateRule"
      @delete-rule="confirmDeleteRule"
      @update-status="toggleRuleStatus"
      @refresh="fetchRules"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Create Rule Dialog -->
    <Dialog v-model:open="showCreateRuleDialog">
      <CreateSyncRuleDialog
        v-if="showCreateRuleDialog"
        :categories="categories"
        :products="products"
        :items="items"
        @rule-created="handleRuleCreated"
        @close="showCreateRuleDialog = false"
      />
    </Dialog>

    <!-- Rule Details Dialog -->
    <Dialog v-model:open="showRuleDetailsDialog">
      <SyncRuleDetailsDialog
        v-if="showRuleDetailsDialog"
        :rule="selectedRule"
        @edit-rule="editRule"
        @close="showRuleDetailsDialog = false"
      />
    </Dialog>

    <!-- Edit Rule Dialog -->
    <Dialog v-model:open="showEditRuleDialog">
      <EditSyncRuleDialog
        v-if="showEditRuleDialog"
        :rule="selectedRule"
        :categories="categories"
        :products="products"
        :items="items"
        @rule-updated="handleRuleUpdated"
        @close="showEditRuleDialog = false"
      />
    </Dialog>

    <!-- Delete Rule Dialog -->
    <Dialog v-model:open="showDeleteRuleDialog">
      <DeleteSyncRuleDialog
        v-if="showDeleteRuleDialog"
        :rule="selectedRule"
        @delete="handleRuleDeleted"
        @close="showDeleteRuleDialog = false"
      />
    </Dialog>

    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditSyncRulesDialog
        v-if="showBulkEditDialog"
        :selectedRules="selectedBulkRules"
        @rules-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SyncRulesImportSheet
        v-if="showImportSheet"
        :importType="importType"
        @import-complete="handleImportComplete"
        @close="showImportSheet = false"
      />
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet,
  Table2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import SyncRulesTable from '@/components/rules/trigger-configuration/SyncRulesTable.vue'
import CreateSyncRuleDialog from '@/components/rules/trigger-configuration/CreateSyncRuleDialog.vue'
import SyncRuleDetailsDialog from '@/components/rules/trigger-configuration/SyncRuleDetailsDialog.vue'
import EditSyncRuleDialog from '@/components/rules/trigger-configuration/EditSyncRuleDialog.vue'
import DeleteSyncRuleDialog from '@/components/rules/trigger-configuration/DeleteSyncRuleDialog.vue'
import BulkEditSyncRulesDialog from '@/components/rules/trigger-configuration/BulkEditSyncRulesDialog.vue'
import SyncRulesImportSheet from '@/components/rules/trigger-configuration/SyncRulesImportSheet.vue'

// Stores
import { useInventorySyncStore } from '@/store/modules/rules/sync'
import { useProductsStore } from '@/store/modules/catalog/products'
import { useCategoriesStore } from '@/store/modules/catalog/categories'
import { useInventoryStore } from '@/store/modules/inventory/items'

// Initialize stores
const syncStore = useInventorySyncStore()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const inventoryStore = useInventoryStore()
const { toast } = useToast()

// Access store state through computed properties
const rules = computed(() => syncStore.getSyncRules)
const products = computed(() => productsStore.getProducts)
const categories = computed(() => categoriesStore.getCategories)
const items = computed(() => inventoryStore.getItems)
const isLoading = computed(() => syncStore.getIsLoading)
const error = computed(() => syncStore.getError)

// State management
const selectedRule = ref(null)
const selectedBulkRules = ref([])

// UI control
const showCreateRuleDialog = ref(false)
const showRuleDetailsDialog = ref(false)
const showEditRuleDialog = ref(false)
const showDeleteRuleDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Fetch data from API
const fetchRules = async () => {
  try {
    await syncStore.fetchSyncRules()
  } catch (error) {
    console.error('Error fetching sync rules:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openCreateRuleDialog = () => {
  showCreateRuleDialog.value = true
}

const viewRuleDetails = (rule) => {
  selectedRule.value = rule
  showRuleDetailsDialog.value = true
}

const editRule = (rule) => {
  selectedRule.value = rule
  showEditRuleDialog.value = true
}

const confirmDeleteRule = (rule) => {
  selectedRule.value = rule
  showDeleteRuleDialog.value = true
}

const openBulkEditDialog = (rules) => {
  selectedBulkRules.value = rules
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleRuleCreated = async (newRule) => {
  try {
    await syncStore.createSyncRule(newRule)
    showCreateRuleDialog.value = false
    
    toast({
      title: 'Rule Created',
      description: `${newRule.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error creating sync rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to create rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleRuleUpdated = async (updatedRule) => {
  try {
    await syncStore.updateSyncRule(updatedRule)
    showEditRuleDialog.value = false
    
    toast({
      title: 'Rule Updated',
      description: `${updatedRule.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error updating sync rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleRuleDeleted = async (rule) => {
  try {
    await syncStore.deleteSyncRule(rule.id)
    showDeleteRuleDialog.value = false
    
    toast({
      title: 'Rule Deleted',
      description: `${rule.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error deleting sync rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const duplicateRule = async (rule) => {
  try {
    await syncStore.duplicateSyncRule(rule.id)
    
    toast({
      title: 'Rule Duplicated',
      description: `A copy of ${rule.name} has been created.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error duplicating sync rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const toggleRuleStatus = async (rule) => {
  try {
    const newStatus = !rule.active
    await syncStore.updateSyncRuleStatus(rule.id, newStatus)
    
    toast({
      title: 'Status Updated',
      description: `Rule status changed to ${newStatus ? 'active' : 'inactive'}.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error updating rule status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update rule status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (rules, updates) => {
  try {
    await syncStore.bulkUpdateSyncRules(rules.map(r => r.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Rules Updated',
      description: `${rules.length} rules have been updated.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error bulk updating sync rules:', error)
    toast({
      title: 'Error',
      description: 'Failed to update rules. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} rules have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchRules()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import rules. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchRules()
  // Fetch related data needed for rules
  productsStore.fetchProducts()
  categoriesStore.fetchCategories()
  inventoryStore.fetchItems()
})
</script>