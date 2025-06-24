<template>
  <div class="p-6 space-y-6">    <!-- Breadcrumb Navigation -->
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
            <PackageIcon class="h-4 w-4" />
            Inventory Configuration
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Configuration</h2>
        <p class="text-muted-foreground">Manage your inventory system settings</p>
      </div>      <div class="flex items-center gap-2">
        <Button variant="outline" @click="handleRefreshConfiguration" :disabled="isLoading">
          <RefreshCwIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="handleExportConfiguration" :disabled="!activeSettings">
          <DownloadIcon class="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button @click="handleSaveConfiguration" :disabled="!activeSettings || !hasChanges" v-if="activeSettings">
          <SaveIcon class="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button @click="handleInitializeConfiguration" :disabled="!!activeSettings" v-else>
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Initialize Settings
        </Button>
      </div>
    </div>    <!-- Loading State -->
    <div v-if="isLoading" class="grid gap-6">
      <!-- Header Skeleton -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-6 w-48" />
          </div>
          <Skeleton class="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-10 w-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-36" />
                <Skeleton class="h-3 w-40" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-28" />
                <Skeleton class="h-3 w-44" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- Additional skeleton cards -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-6 w-40" />
          </div>
          <Skeleton class="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-36" />
                <Skeleton class="h-3 w-40" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-6 w-44" />
          </div>
          <Skeleton class="h-4 w-68 mt-2" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-36" />
                <Skeleton class="h-3 w-40" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-28" />
                <Skeleton class="h-3 w-44" />
              </div>
              <Skeleton class="h-6 w-11 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- No Configuration State -->
    <Card v-else-if="!activeSettings" class="text-center py-12">
      <CardContent>
        <AlertCircleIcon class="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">No Configuration Found</h3>
        <p class="text-muted-foreground mb-6">
          Initialize default inventory settings to get started with your inventory management system.
        </p>
        <Button @click="handleInitializeConfiguration" size="lg">
          <RefreshCwIcon class="h-5 w-5 mr-2" />
          Initialize Default Settings
        </Button>
      </CardContent>
    </Card>

    <!-- Configuration Form -->
    <div v-else class="grid gap-6">
      <!-- Inventory Valuation Settings -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <DollarSignIcon class="h-5 w-5" />
            Inventory Valuation
          </CardTitle>
          <CardDescription>Configure how inventory costs are calculated</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Valuation Method</Label>
              <Select v-model="formData.defaultValuationMethod">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                  <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                  <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
                  <SelectItem value="STANDARD_COST">Standard Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Default Currency</Label>
              <Select v-model="formData.defaultCurrency">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Allow Negative Stock</Label>
                <p class="text-sm text-muted-foreground">Permit inventory to go below zero</p>
              </div>
              <Switch v-model:checked="formData.allowNegativeStock" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Auto Create Purchase Orders</Label>
                <p class="text-sm text-muted-foreground">Automatically generate POs</p>
              </div>
              <Switch v-model:checked="formData.autoCreatePurchaseOrders" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Include Freight in Cost</Label>
                <p class="text-sm text-muted-foreground">Add freight charges to item cost</p>
              </div>
              <Switch v-model:checked="formData.includeFreightInCost" class="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Default Markup Percentage</Label>
              <div class="flex items-center gap-2">
                <Input
                  type="number"
                  v-model.number="formData.defaultMarkupPercentage"
                  min="0"
                  max="1000"
                  step="0.1"
                />
                <span class="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Stock Management -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PackageIcon class="h-5 w-5" />
            Stock Management
          </CardTitle>
          <CardDescription>Configure reorder points and stock alerts</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable Auto Reorder</Label>
                <p class="text-sm text-muted-foreground">Automatically reorder when low</p>
              </div>
              <Switch v-model:checked="formData.enableAutoReorder" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable Low Stock Alerts</Label>
                <p class="text-sm text-muted-foreground">Get notified when stock is low</p>
              </div>
              <Switch v-model:checked="formData.enableLowStockAlerts" class="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>Default Reorder Point</Label>
              <Input
                type="number"
                v-model.number="formData.defaultReorderPoint"
                min="0"
                step="0.1"
              />
            </div>
            <div class="space-y-2">
              <Label>Default Reorder Quantity</Label>
              <Input
                type="number"
                v-model.number="formData.defaultReorderQuantity"
                min="0"
                step="0.1"
              />
            </div>
            <div class="space-y-2">
              <Label>Low Stock Threshold (%)</Label>
              <Input
                type="number"
                v-model.number="formData.lowStockThresholdPercentage"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div class="space-y-2" v-if="formData.enableLowStockAlerts">
            <Label>Alert Frequency (Hours)</Label>
            <Input
              type="number"
              v-model.number="formData.lowStockAlertFrequencyHours"
              min="1"
              max="168"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Barcode & Tracking -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <QrCodeIcon class="h-5 w-5" />
            Barcode & Tracking
          </CardTitle>
          <CardDescription>Configure barcode generation and tracking options</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Auto Generate Barcodes</Label>
                <p class="text-sm text-muted-foreground">Automatically create barcodes</p>
              </div>
              <Switch v-model:checked="formData.autoGenerateBarcodes" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enforce Location Tracking</Label>
                <p class="text-sm text-muted-foreground">Require location for all items</p>
              </div>
              <Switch v-model:checked="formData.enforceLocationTracking" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Allow Multi-Location Items</Label>
                <p class="text-sm text-muted-foreground">Items can exist in multiple locations</p>
              </div>
              <Switch v-model:checked="formData.allowMultiLocationItems" class="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="formData.autoGenerateBarcodes">
            <div class="space-y-2">
              <Label>Barcode Prefix</Label>
              <Input
                v-model="formData.barcodePrefix"
                maxlength="10"
                placeholder="ITM"
              />
            </div>
            <div class="space-y-2">
              <Label>Barcode Format</Label>
              <Select v-model="formData.barcodeFormat">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ITM{000000000}">ITM{000000000}</SelectItem>
                  <SelectItem value="PRD{000000}">PRD{000000}</SelectItem>
                  <SelectItem value="SKU{00000000}">SKU{00000000}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Approval Workflows -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ShieldCheckIcon class="h-5 w-5" />
            Approval Workflows
          </CardTitle>
          <CardDescription>Configure approval requirements for inventory operations</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Require Approval for Adjustments</Label>
                <p class="text-sm text-muted-foreground">Approve inventory adjustments</p>
              </div>
              <Switch v-model:checked="formData.requireApprovalForAdjustments" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Require Approval for Transfers</Label>
                <p class="text-sm text-muted-foreground">Approve inventory transfers</p>
              </div>
              <Switch v-model:checked="formData.requireApprovalForTransfers" class="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2" v-if="formData.requireApprovalForAdjustments">
              <Label>Adjustment Approval Threshold</Label>
              <div class="flex items-center gap-2">
                <Input
                  type="number"
                  v-model.number="formData.adjustmentApprovalThreshold"
                  min="0"
                  step="0.01"
                />
                <span class="text-sm text-muted-foreground">{{ formData.defaultCurrency }}</span>
              </div>
            </div>
            <div class="space-y-2" v-if="formData.requireApprovalForTransfers">
              <Label>Transfer Approval Threshold</Label>
              <div class="flex items-center gap-2">
                <Input
                  type="number"
                  v-model.number="formData.transferApprovalThreshold"
                  min="0"
                  step="0.01"
                />
                <span class="text-sm text-muted-foreground">{{ formData.defaultCurrency }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Advanced Features -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <SettingsIcon class="h-5 w-5" />
            Advanced Features
          </CardTitle>
          <CardDescription>Configure advanced inventory management features</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable Expiration Tracking</Label>
                <p class="text-sm text-muted-foreground">Track item expiration dates</p>
              </div>
              <Switch v-model:checked="formData.enableExpirationTracking" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable FEFO Allocation</Label>
                <p class="text-sm text-muted-foreground">First Expired, First Out</p>
              </div>
              <Switch v-model:checked="formData.enableFefoAllocation" :disabled="!formData.enableExpirationTracking" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable Cycle Counting</Label>
                <p class="text-sm text-muted-foreground">Periodic inventory counts</p>
              </div>
              <Switch v-model:checked="formData.enableCycleCounting" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable Real-Time Reporting</Label>
                <p class="text-sm text-muted-foreground">Live inventory reports</p>
              </div>
              <Switch v-model:checked="formData.enableRealTimeReporting" class="data-[state=checked]:bg-green-500" />
            </div>
            
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label class="font-medium">Enable QuickBooks Sync</Label>
                <p class="text-sm text-muted-foreground">Sync with QuickBooks</p>
              </div>
              <Switch v-model:checked="formData.enableQuickbooksSync" class="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2" v-if="formData.enableExpirationTracking">
              <Label>Expiration Alert Days Before</Label>
              <Input
                type="number"
                v-model.number="formData.expirationAlertDaysBefore"
                min="1"
              />
            </div>
            <div class="space-y-2" v-if="formData.enableCycleCounting">
              <Label>Cycle Count Frequency (Days)</Label>
              <Input
                type="number"
                v-model.number="formData.cycleCountFrequencyDays"
                min="1"
              />
            </div>
            <div class="space-y-2" v-if="formData.enableCycleCounting">
              <Label>Cycle Count Variance Threshold (%)</Label>
              <Input
                type="number"
                v-model.number="formData.cycleCountVarianceThreshold"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2" v-if="formData.enableRealTimeReporting">
              <Label>Report Retention Days</Label>
              <Input
                type="number"
                v-model.number="formData.reportRetentionDays"
                min="1"
                max="3650"
              />
            </div>
            <div class="space-y-2" v-if="formData.enableQuickbooksSync">
              <Label>Sync Frequency (Hours)</Label>
              <Input
                type="number"
                v-model.number="formData.syncFrequencyHours"
                min="1"
                max="168"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from 'nuxt/app'
import { 
  SettingsIcon, DownloadIcon, RefreshCwIcon, SaveIcon, Loader2Icon,
  AlertCircleIcon, DollarSignIcon, PackageIcon, QrCodeIcon, ShieldCheckIcon,
  ChevronRightIcon, HomeIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'

// Stores
import { useInventorySettingsStore } from '@/store/modules/inventory/settings'

// Initialize stores
const settingsStore = useInventorySettingsStore()
const { toast } = useToast()

// Access store state through computed properties
const activeSettings = computed(() => settingsStore.getActiveSettings)
const isLoading = computed(() => settingsStore.getIsLoading)
const error = computed(() => settingsStore.getError)

// Form data
const formData = ref({
  defaultValuationMethod: 'FIFO',
  allowNegativeStock: false,
  autoCreatePurchaseOrders: false,
  defaultReorderPoint: 0,
  defaultReorderQuantity: 0,
  enableAutoReorder: false,
  lowStockThresholdPercentage: 0,
  enableLowStockAlerts: false,
  lowStockAlertFrequencyHours: 24,
  autoGenerateBarcodes: false,
  barcodePrefix: 'ITM',
  barcodeFormat: 'ITM{000000000}',
  requireApprovalForAdjustments: false,
  adjustmentApprovalThreshold: 0,
  requireApprovalForTransfers: false,
  transferApprovalThreshold: 0,
  includeFreightInCost: false,
  includeTaxInCost: false,
  defaultMarkupPercentage: 0,
  enableExpirationTracking: false,
  expirationAlertDaysBefore: 30,
  enableFefoAllocation: false,
  enableCycleCounting: false,
  cycleCountFrequencyDays: 90,
  cycleCountVarianceThreshold: 5.0,
  enforceLocationTracking: false,
  allowMultiLocationItems: false,
  defaultCurrency: 'USD',
  enableRealTimeReporting: false,
  reportRetentionDays: 365,
  enableQuickbooksSync: false,
  syncFrequencyHours: 6
})

// Track if there are changes
const hasChanges = computed(() => {
  if (!activeSettings.value) return false
  
  return Object.keys(formData.value).some(key => {
    return formData.value[key] !== activeSettings.value[key]
  })
})

// Watch for activeSettings changes and update form data
watch(activeSettings, (newSettings) => {
  if (newSettings) {
    Object.keys(formData.value).forEach(key => {
      if (newSettings[key] !== undefined) {
        formData.value[key] = newSettings[key]
      }
    })
  }
}, { immediate: true })

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

// Refresh configuration
const handleRefreshConfiguration = async () => {
  try {
    await fetchActiveConfiguration()
    toast({
      title: 'Configuration Refreshed',
      description: 'Configuration data has been refreshed successfully.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error refreshing configuration:', error)
    toast({
      title: 'Error',
      description: 'Failed to refresh configuration. Please try again.',
      variant: 'destructive'
    })
  }
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

async function handleSaveConfiguration() {
  try {
    if (!activeSettings.value?.id) return
    
    await settingsStore.updateSettings(activeSettings.value.id, formData.value)
    toast({
      title: 'Configuration Saved',
      description: 'Inventory configuration has been updated successfully.',
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

// Initialize component
onMounted(async () => {
  await fetchActiveConfiguration()
})
</script>
