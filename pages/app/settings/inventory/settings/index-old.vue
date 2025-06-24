<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Configuration</h2>
        <p class="text-muted-foreground">Manage your inventory system configuration</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex items-center border rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            :class="{ 'bg-muted': currentView === 'configuration' }"
            @click="currentView = 'configuration'"
          >
            <SettingsIcon class="h-4 w-4 mr-2" />
            Configuration
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            :class="{ 'bg-muted': currentView === 'history' }"
            @click="currentView = 'history'"
          >
            <HistoryIcon class="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
        
        <!-- Action Buttons -->
        <Button variant="outline" @click="handleExportConfiguration">
          <DownloadIcon class="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" @click="openImportDialog">
          <UploadIcon class="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button @click="handleInitializeConfiguration" :disabled="hasActiveConfiguration">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Initialize
        </Button>
      </div>
    </div>    <!-- Configuration Management View -->
    <div v-if="currentView === 'configuration'" class="space-y-6">
      <!-- Active Configuration Card -->
      <Card v-if="activeSettings">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <CheckCircleIcon class="h-5 w-5 text-green-600" />
                Active Configuration
              </CardTitle>
              <CardDescription>Current inventory system settings</CardDescription>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" @click="handleValidateConfiguration">
                <ShieldCheckIcon class="h-4 w-4 mr-2" />
                Validate
              </Button>
              <Button variant="outline" size="sm" @click="openEditConfigurationDialog">
                <EditIcon class="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm" @click="openCloneConfigurationDialog">
                <CopyIcon class="h-4 w-4 mr-2" />
                Clone
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Valuation Settings -->
            <div class="space-y-2">
              <h4 class="font-medium text-sm">Valuation</h4>
              <div class="text-sm text-muted-foreground space-y-1">
                <p>Method: {{ activeSettings.defaultValuationMethod }}</p>
                <p>Allow Negative: {{ activeSettings.allowNegativeStock ? 'Yes' : 'No' }}</p>
                <p>Include Freight: {{ activeSettings.includeFreightInCost ? 'Yes' : 'No' }}</p>
              </div>
            </div>
            
            <!-- Stock Management -->
            <div class="space-y-2">
              <h4 class="font-medium text-sm">Stock Management</h4>
              <div class="text-sm text-muted-foreground space-y-1">
                <p>Auto Reorder: {{ activeSettings.enableAutoReorder ? 'Enabled' : 'Disabled' }}</p>
                <p>Low Stock Alerts: {{ activeSettings.enableLowStockAlerts ? 'Enabled' : 'Disabled' }}</p>
                <p>Reorder Point: {{ activeSettings.defaultReorderPoint }}</p>
              </div>
            </div>
            
            <!-- Tracking & Controls -->
            <div class="space-y-2">
              <h4 class="font-medium text-sm">Tracking & Controls</h4>
              <div class="text-sm text-muted-foreground space-y-1">
                <p>Location Tracking: {{ activeSettings.enforceLocationTracking ? 'Required' : 'Optional' }}</p>
                <p>Expiration Tracking: {{ activeSettings.enableExpirationTracking ? 'Enabled' : 'Disabled' }}</p>
                <p>Cycle Counting: {{ activeSettings.enableCycleCounting ? 'Enabled' : 'Disabled' }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- No Configuration State -->
      <Card v-else-if="!isLoading">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <AlertCircleIcon class="h-5 w-5 text-amber-600" />
            No Configuration Found
          </CardTitle>
          <CardDescription>Initialize your inventory system configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col items-center justify-center py-8 space-y-4">
            <p class="text-muted-foreground text-center">
              No active inventory configuration found. Initialize default settings to get started.
            </p>
            <div class="flex items-center gap-3">
              <Button @click="handleInitializeConfiguration">
                <RefreshCwIcon class="h-4 w-4 mr-2" />
                Initialize Defaults
              </Button>
              <Button variant="outline" @click="openImportDialog">
                <UploadIcon class="h-4 w-4 mr-2" />
                Import Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- Configuration Presets -->
      <Card>
        <CardHeader>
          <CardTitle>Configuration Presets</CardTitle>
          <CardDescription>Quick start with predefined settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="preset in presets" :key="preset.id" class="border rounded-lg p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">{{ preset.name }}</h4>
                <Badge :variant="preset.category === 'CONSERVATIVE' ? 'secondary' : 'default'">
                  {{ preset.category }}
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground">{{ preset.description }}</p>
              <Button size="sm" variant="outline" @click="handleApplyPreset(preset)">
                Apply Preset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>    <!-- Configuration History View -->
    <div v-else-if="currentView === 'history'" class="space-y-6">
      <InventorySettingsHistoryTable
        :history="settingsHistory"
        :loading="isLoading"
        @view-details="openHistoryDetailsDialog"
        @rollback="openRollbackDialog"
        @compare="openCompareHistoryDialog"
        @refresh="handleRefreshHistory"
      />
    </div>    <!-- Configuration Edit Dialog -->
    <Dialog :open="showEditConfigurationDialog" @update:open="showEditConfigurationDialog = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Inventory Configuration</DialogTitle>
          <DialogDescription>
            Modify your inventory system settings to match your business needs
          </DialogDescription>
        </DialogHeader>
        
        <!-- Configuration Form would go here -->
        <div class="space-y-6 py-4">
          <!-- This would be replaced with a proper configuration form component -->
          <p class="text-muted-foreground">Configuration form will be implemented here...</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showEditConfigurationDialog = false">Cancel</Button>
          <Button @click="handleSaveConfiguration">Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clone Configuration Dialog -->
    <CloneSettingsDialog
      :open="showCloneDialog"
      :setting="activeSettings"
      @update:open="showCloneDialog = $event"
      @clone="handleConfigurationCloned"
    />    <!-- Compare Configurations Dialog -->
    <CompareSettingsDialog
      :open="showCompareDialog"
      :settings="settingsList"
      @update:open="showCompareDialog = $event"
    />

    <!-- History Details Dialog -->
    <HistoryDetailsDialog
        :open="showHistoryDetailsDialog"
        :historyEntry="selectedHistoryItem"
        @update:open="showHistoryDetailsDialog = $event"
        @rollback="openRollbackDialog"
    />

    <!-- Rollback Dialog -->
    <RollbackSettingsDialog
        :open="showRollbackDialog"
        :historyEntry="selectedHistoryItem"
        :currentSetting="selectedSettings"
        @update:open="showRollbackDialog = $event"
        @rollback="handleSettingsRolledBack"
    />

    <!-- Validation Results Dialog -->
    <ValidationResultsDialog
        :open="showValidationDialog"
        :validationResults="validationResult"
        @update:open="showValidationDialog = $event"
        @retry-validation="handleRetryValidation"
        @fix-issues="handleFixValidationIssues"
    />

    <!-- Import Settings Dialog -->
    <ImportSettingsDialog
        :open="showImportDialog"
        @update:open="showImportDialog = $event"
        @import="handleSettingsImported"
    />    <!-- Delete Settings Dialog -->
    <Dialog :open="showDeleteConfigurationDialog" @update:open="showDeleteConfigurationDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Configuration</DialogTitle>
          <DialogDescription>
            This will reset your inventory configuration to default settings. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteConfigurationDialog = false">Cancel</Button>
          <Button variant="destructive" @click="handleResetConfiguration">Reset to Defaults</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  SettingsIcon, HistoryIcon, DownloadIcon, UploadIcon, RefreshCwIcon,
  CheckCircleIcon, AlertCircleIcon, ShieldCheckIcon, EditIcon, CopyIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

// Components
import InventorySettingsHistoryTable from '@/components/inventory/settings/InventorySettingsHistoryTable.vue'
import CloneSettingsDialog from '@/components/inventory/settings/CloneSettingsDialog.vue'
import CompareSettingsDialog from '@/components/inventory/settings/CompareSettingsDialog.vue'
import HistoryDetailsDialog from '@/components/inventory/settings/HistoryDetailsDialog.vue'
import RollbackSettingsDialog from '@/components/inventory/settings/RollbackSettingsDialog.vue'
import ValidationResultsDialog from '@/components/inventory/settings/ValidationResultsDialog.vue'
import ImportSettingsDialog from '@/components/inventory/settings/ImportSettingsDialog.vue'

// Stores
import { useInventorySettingsStore } from '@/store/modules/inventory/settings'

// Initialize stores
const settingsStore = useInventorySettingsStore()
const { toast } = useToast()

// Access store state through computed properties
const settingsList = computed(() => settingsStore.getSettingsList)
const activeSettings = computed(() => settingsStore.getActiveSettings)
const settingsHistory = computed(() => settingsStore.getSettingsHistory)
const presets = computed(() => settingsStore.getPresets)
const isLoading = computed(() => settingsStore.getIsLoading)
const error = computed(() => settingsStore.getError)
const validationResult = computed(() => settingsStore.getValidationResult)

// Computed for checking if configuration exists
const hasActiveConfiguration = computed(() => !!activeSettings.value)

// State management
const selectedHistoryItem = ref(null)

// UI control
const showEditConfigurationDialog = ref(false)
const showCloneDialog = ref(false)
const showCompareDialog = ref(false)
const showHistoryDetailsDialog = ref(false)
const showRollbackDialog = ref(false)
const showValidationDialog = ref(false)
const showImportDialog = ref(false)
const showDeleteConfigurationDialog = ref(false)

// View control
const currentView = ref('configuration')

// Fetch active configuration
const fetchActiveConfiguration = async () => {
  try {
    await settingsStore.fetchActiveSettings()
  } catch (error) {
    console.error('Error fetching active configuration:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Fetch configuration history
const fetchConfigurationHistory = async () => {
  try {
    await settingsStore.fetchSettingsHistory()
  } catch (error) {
    console.error('Error fetching configuration history:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog handlers
function openEditConfigurationDialog() {
  showEditConfigurationDialog.value = true
}

function openCloneConfigurationDialog() {
  showCloneDialog.value = true
}

function openCompareDialog() {
  showCompareDialog.value = true
}

function openHistoryDetailsDialog(historyItem) {
  selectedHistoryItem.value = historyItem
  showHistoryDetailsDialog.value = true
}

function openRollbackDialog(historyItem) {
  selectedHistoryItem.value = historyItem
  showRollbackDialog.value = true
}

function openCompareHistoryDialog(historyItems) {
  // Logic for comparing historical configurations
  showCompareDialog.value = true
}

function openImportDialog() {
  showImportDialog.value = true
}

// Event handlers
function handleRefreshHistory() {
  fetchConfigurationHistory()
}

// Configuration operations
async function handleInitializeConfiguration() {
  try {
    await settingsStore.initializeSettings()
    toast({
      title: 'Configuration Initialized',
      description: 'Default inventory configuration has been set up.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error initializing configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to initialize configuration. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleValidateConfiguration() {
  try {
    if (!activeSettings.value) return
    
    const validationResult = await settingsStore.validateSettings(activeSettings.value)
    showValidationDialog.value = true
    
    toast({
      title: 'Validation Complete',
      description: validationResult.isValid ? 'Configuration is valid' : 'Validation issues found',
      variant: validationResult.isValid ? 'success' : 'destructive'
    })
  } catch (error) {
    console.error('Error validating configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to validate configuration. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleSaveConfiguration() {
  try {
    // This would save the modified configuration
    showEditConfigurationDialog.value = false
    toast({
      title: 'Configuration Saved',
      description: 'Inventory configuration has been updated.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error saving configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to save configuration. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleExportConfiguration() {
  try {
    const exportData = await settingsStore.exportSettings()
    
    // Create download link
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-configuration-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Configuration Exported',
      description: 'Configuration has been exported successfully.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error exporting configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to export configuration. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleApplyPreset(preset) {
  try {
    await settingsStore.applyPreset(preset)
    toast({
      title: 'Preset Applied',
      description: `${preset.name} configuration has been applied.`,
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error applying preset:', error)
    toast({
      title: 'Error',
      description: 'Failed to apply preset. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleResetConfiguration() {
  try {
    await settingsStore.resetSettings()
    showDeleteConfigurationDialog.value = false
    toast({
      title: 'Configuration Reset',
      description: 'Configuration has been reset to defaults.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error resetting configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to reset configuration. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleConfigurationCloned(clonedConfiguration) {
  try {
    showCloneDialog.value = false
    toast({
      title: 'Configuration Cloned',
      description: 'Configuration has been cloned successfully.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error handling cloned configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to handle cloned configuration. Please refresh the page.',
      variant: 'destructive'
    })
  }
}

async function handleConfigurationRolledBack(rolledBackConfiguration) {
  try {
    showRollbackDialog.value = false
    toast({
      title: 'Configuration Rolled Back',
      description: 'Configuration has been rolled back to the selected version.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
    await fetchConfigurationHistory()
  } catch (error) {
    console.error('Error handling rolled back configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to handle rollback. Please refresh the page.',
      variant: 'destructive'
    })
  }
}

async function handleConfigurationImported(importedConfiguration) {
  try {
    showImportDialog.value = false
    toast({
      title: 'Configuration Imported',
      description: 'Configuration has been imported successfully.',
      variant: 'success'
    })
    
    await fetchActiveConfiguration()
  } catch (error) {
    console.error('Error handling imported configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to handle imported configuration. Please refresh the page.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  settingsStore.initialize()
})
</script>
