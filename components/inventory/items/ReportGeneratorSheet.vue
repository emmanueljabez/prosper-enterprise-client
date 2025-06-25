<template>
  <SheetContent side="right" class="sm:max-w-[600px]">
    <SheetHeader>
      <SheetTitle>Generate Inventory Report</SheetTitle>
      <SheetDescription>
        Configure and generate comprehensive inventory reports with custom filters and formats.
      </SheetDescription>
    </SheetHeader>

    <div class="space-y-6 py-4">
      <!-- Report Type -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Report Type</Label>
        <RadioGroup v-model="reportConfig.type" class="grid grid-cols-1 gap-3">
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="stock-levels" id="stock-levels" />
            <Label for="stock-levels" class="flex-1 cursor-pointer">
              <div class="font-medium">Stock Levels Report</div>
              <div class="text-sm text-muted-foreground">Current stock quantities and values</div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="valuation" id="valuation" />
            <Label for="valuation" class="flex-1 cursor-pointer">
              <div class="font-medium">Inventory Valuation</div>
              <div class="text-sm text-muted-foreground">Total inventory value by category and item</div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="movement" id="movement" />
            <Label for="movement" class="flex-1 cursor-pointer">
              <div class="font-medium">Movement Report</div>
              <div class="text-sm text-muted-foreground">Stock movements and transactions history</div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="aging" id="aging" />
            <Label for="aging" class="flex-1 cursor-pointer">
              <div class="font-medium">Inventory Aging</div>
              <div class="text-sm text-muted-foreground">Items by age and expiration dates</div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="abc-analysis" id="abc-analysis" />
            <Label for="abc-analysis" class="flex-1 cursor-pointer">
              <div class="font-medium">ABC Analysis</div>
              <div class="text-sm text-muted-foreground">Items classified by value and usage</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <!-- Date Range -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Date Range</Label>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              v-model="reportConfig.startDate"
            />
          </div>
          <div class="space-y-2">
            <Label for="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              v-model="reportConfig.endDate"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            @click="setDateRange('last-30-days')"
          >
            Last 30 Days
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="setDateRange('last-quarter')"
          >
            Last Quarter
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="setDateRange('last-year')"
          >
            Last Year
          </Button>
        </div>
      </div>

      <!-- Filters -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Filters</Label>
        
        <!-- Categories -->
        <div class="space-y-2">
          <Label>Categories</Label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="category in categories"
              :key="category.id"
              size="sm"
              :variant="reportConfig.categories.includes(category.id) ? 'default' : 'outline'"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </Button>
          </div>
        </div>

        <!-- Stock Status -->
        <div class="space-y-2">
          <Label>Stock Status</Label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                :checked="reportConfig.stockStatus.includes('in-stock')"
                @update:checked="toggleStockStatus('in-stock')"
              />
              <Label for="in-stock">In Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="low-stock"
                :checked="reportConfig.stockStatus.includes('low-stock')"
                @update:checked="toggleStockStatus('low-stock')"
              />
              <Label for="low-stock">Low Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="out-of-stock"
                :checked="reportConfig.stockStatus.includes('out-of-stock')"
                @update:checked="toggleStockStatus('out-of-stock')"
              />
              <Label for="out-of-stock">Out of Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="expired"
                :checked="reportConfig.stockStatus.includes('expired')"
                @update:checked="toggleStockStatus('expired')"
              />
              <Label for="expired">Expired Items</Label>
            </div>
          </div>
        </div>

        <!-- Value Range -->
        <div class="space-y-2">
          <Label>Value Range</Label>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <Label for="min-value" class="text-sm">Min Value</Label>
              <Input
                id="min-value"
                type="number"
                placeholder="0"
                v-model.number="reportConfig.minValue"
              />
            </div>
            <div class="space-y-1">
              <Label for="max-value" class="text-sm">Max Value</Label>
              <Input
                id="max-value"
                type="number"
                placeholder="No limit"
                v-model.number="reportConfig.maxValue"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Output Format -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Output Format</Label>
        <RadioGroup v-model="reportConfig.format" class="grid grid-cols-2 gap-3">
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label for="pdf" class="cursor-pointer">
              <div class="flex items-center space-x-2">
                <FileTextIcon class="h-4 w-4" />
                <span>PDF</span>
              </div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="excel" id="excel" />
            <Label for="excel" class="cursor-pointer">
              <div class="flex items-center space-x-2">
                <FileSpreadsheetIcon class="h-4 w-4" />
                <span>Excel</span>
              </div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label for="csv" class="cursor-pointer">
              <div class="flex items-center space-x-2">
                <FileIcon class="h-4 w-4" />
                <span>CSV</span>
              </div>
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label for="json" class="cursor-pointer">
              <div class="flex items-center space-x-2">
                <CodeIcon class="h-4 w-4" />
                <span>JSON</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <!-- Additional Options -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Additional Options</Label>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="include-images"
              v-model="reportConfig.includeImages"
            />
            <Label for="include-images">Include item images</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="include-costs"
              v-model="reportConfig.includeCosts"
            />
            <Label for="include-costs">Include cost information</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="include-suppliers"
              v-model="reportConfig.includeSuppliers"
            />
            <Label for="include-suppliers">Include supplier details</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="group-by-category"
              v-model="reportConfig.groupByCategory"
            />
            <Label for="group-by-category">Group by category</Label>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="reportConfig.type" class="space-y-3">
        <Label class="text-base font-medium">Report Preview</Label>
        <div class="p-4 bg-muted rounded-lg">
          <div class="text-sm space-y-1">
            <div><strong>Type:</strong> {{ getReportTypeLabel(reportConfig.type) }}</div>
            <div><strong>Period:</strong> {{ reportConfig.startDate }} to {{ reportConfig.endDate }}</div>
            <div><strong>Categories:</strong> {{ reportConfig.categories.length || 'All' }}</div>
            <div><strong>Format:</strong> {{ reportConfig.format.toUpperCase() }}</div>
            <div><strong>Estimated size:</strong> {{ estimatedItems }} items</div>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button @click="handlePreviewReport" variant="outline">
        <EyeIcon class="h-3 w-3 mr-1" />
        Preview
      </Button>
      <Button @click="handleGenerateReport" :disabled="!isValid || isGenerating">
        <RefreshCwIcon v-if="isGenerating" class="h-3 w-3 mr-1 animate-spin" />
        <DownloadIcon v-else class="h-3 w-3 mr-1" />
        {{ isGenerating ? 'Generating...' : 'Generate' }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  FileTextIcon, FileSpreadsheetIcon, FileIcon, CodeIcon,
  EyeIcon, DownloadIcon, RefreshCwIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'generate-report'])

// Local state
const isGenerating = ref(false)

const reportConfig = ref({
  type: 'stock-levels',
  startDate: '',
  endDate: '',
  categories: [],
  stockStatus: ['in-stock', 'low-stock', 'out-of-stock'],
  minValue: null,
  maxValue: null,
  format: 'pdf',
  includeImages: false,
  includeCosts: false,
  includeSuppliers: false,
  groupByCategory: true
})

// Mock categories
const categories = ref([
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Hardware' },
  { id: '3', name: 'Software' },
  { id: '4', name: 'Accessories' }
])

// Computed properties
const isValid = computed(() => {
  return reportConfig.value.type && 
         reportConfig.value.startDate && 
         reportConfig.value.endDate &&
         reportConfig.value.format
})

const estimatedItems = computed(() => {
  // This would be calculated based on filters
  return Math.floor(props.items.length * 0.8) // Mock estimation
})

// Methods
const setDateRange = (range) => {
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  
  let startDate
  switch (range) {
    case 'last-30-days':
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'last-quarter':
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'last-year':
      startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return
  }
  
  reportConfig.value.startDate = startDate.toISOString().split('T')[0]
  reportConfig.value.endDate = endDate
}

const toggleCategory = (categoryId) => {
  const index = reportConfig.value.categories.indexOf(categoryId)
  if (index > -1) {
    reportConfig.value.categories.splice(index, 1)
  } else {
    reportConfig.value.categories.push(categoryId)
  }
}

const toggleStockStatus = (status) => {
  const index = reportConfig.value.stockStatus.indexOf(status)
  if (index > -1) {
    reportConfig.value.stockStatus.splice(index, 1)
  } else {
    reportConfig.value.stockStatus.push(status)
  }
}

const getReportTypeLabel = (type) => {
  const labels = {
    'stock-levels': 'Stock Levels Report',
    'valuation': 'Inventory Valuation',
    'movement': 'Movement Report',
    'aging': 'Inventory Aging',
    'abc-analysis': 'ABC Analysis'
  }
  return labels[type] || type
}

const handlePreviewReport = () => {
  // This would show a preview of the report
  console.log('Previewing report with config:', reportConfig.value)
}

const handleGenerateReport = async () => {
  if (!isValid.value) return
  
  isGenerating.value = true
  
  try {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create mock report data based on configuration
    const reportData = {
      config: reportConfig.value,
      generatedAt: new Date().toISOString(),
      items: props.items.filter(item => {
        // Apply filters based on configuration
        if (reportConfig.value.categories.length > 0) {
          return reportConfig.value.categories.includes(item.category?.id)
        }
        return true
      })
    }
    
    // Generate and download report based on format
    if (reportConfig.value.format === 'csv') {
      downloadCSVReport(reportData)
    } else if (reportConfig.value.format === 'json') {
      downloadJSONReport(reportData)
    } else {
      // For PDF/Excel, this would typically call a backend service
      console.log('Generating', reportConfig.value.format, 'report:', reportData)
    }
    
    emit('generate-report', reportData)
    emit('close')
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isGenerating.value = false
  }
}

const downloadCSVReport = (reportData) => {
  const headers = ['Item Code', 'Name', 'Category', 'Current Stock', 'Unit Price', 'Total Value']
  const csvContent = [
    headers.join(','),
    ...reportData.items.map(item => [
      item.itemCode,
      item.name,
      item.category?.name || '',
      item.currentStock,
      item.unitPrice || 0,
      (item.currentStock * (item.unitPrice || 0)).toFixed(2)
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadJSONReport = (reportData) => {
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Initialize with default date range
setDateRange('last-30-days')
</script>
