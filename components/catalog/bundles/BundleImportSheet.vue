<template>
  <SheetContent class="sm:max-w-xl flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>Import Bundles</SheetTitle>
      <SheetDescription>
        Import bundles via {{ importTypeLabel }}
      </SheetDescription>
    </SheetHeader>
    
    <div class="flex-1 overflow-y-auto py-6 px-1">
      <div class="space-y-6">
        <!-- Import Type Selection -->
        <div class="space-y-2">
          <Label>Import Method</Label>
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="excel">Excel</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            
            <!-- CSV Import -->
            <TabsContent value="csv" class="space-y-4 mt-0 pt-4 px-1">
              <Alert>
                <FileTextIcon class="h-4 w-4" />
                <AlertTitle>CSV Import</AlertTitle>
                <AlertDescription>
                  Upload a CSV file with bundle data following our template format.
                </AlertDescription>
              </Alert>
              
              <div 
                class="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                :class="{ 'border-destructive': fileError, 'bg-muted/50': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
                @click="$refs.csvFileInput.click()"
              >
                <input
                  ref="csvFileInput"
                  type="file"
                  class="hidden"
                  accept=".csv,text/csv"
                  @change="handleFileSelected"
                  :disabled="importing"
                />

                <div v-if="!selectedFile" class="flex flex-col items-center">
                  <UploadIcon class="h-10 w-10 text-muted-foreground mb-2" />
                  <div class="text-sm font-medium">Click to upload or drag and drop</div>
                  <div class="text-xs text-muted-foreground mt-1">Upload a CSV file (.csv)</div>
                </div>

                <div v-else class="flex flex-col items-center">
                  <FileIcon class="h-10 w-10 text-primary mb-2" />
                  <div class="text-sm font-medium">{{ selectedFile.name }}</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ formatFileSize(selectedFile.size) }}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="mt-2"
                    @click.stop="selectedFile = null"
                  >
                    <XIcon class="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              
              <div class="flex flex-col gap-4">
                <Button variant="outline" asChild>
                  <a href="/templates/bundle-import-template.csv" download>
                    <DownloadIcon class="mr-2 h-4 w-4" />
                    Download Template
                  </a>
                </Button>
              </div>
            </TabsContent>
            
            <!-- Excel Import -->
            <TabsContent value="excel" class="space-y-4 mt-0 pt-4 px-1">
              <Alert>
                <TableIcon class="h-4 w-4" />
                <AlertTitle>Excel Import</AlertTitle>
                <AlertDescription>
                  Upload an Excel file with bundle data following our template format.
                </AlertDescription>
              </Alert>
              
              <div 
                class="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                :class="{ 'border-destructive': fileError, 'bg-muted/50': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
                @click="$refs.excelFileInput.click()"
              >
                <input
                  ref="excelFileInput"
                  type="file"
                  class="hidden"
                  accept=".xlsx,.xls"
                  @change="handleFileSelected"
                  :disabled="importing"
                />

                <div v-if="!selectedFile" class="flex flex-col items-center">
                  <UploadIcon class="h-10 w-10 text-muted-foreground mb-2" />
                  <div class="text-sm font-medium">Click to upload or drag and drop</div>
                  <div class="text-xs text-muted-foreground mt-1">Upload an Excel file (.xlsx, .xls)</div>
                </div>

                <div v-else class="flex flex-col items-center">
                  <FileIcon class="h-10 w-10 text-primary mb-2" />
                  <div class="text-sm font-medium">{{ selectedFile.name }}</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ formatFileSize(selectedFile.size) }}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="mt-2"
                    @click.stop="selectedFile = null"
                  >
                    <XIcon class="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              
              <div class="flex flex-col gap-4">
                <Button variant="outline" asChild>
                  <a href="/templates/bundle-import-template.xlsx" download>
                    <DownloadIcon class="mr-2 h-4 w-4" />
                    Download Template
                  </a>
                </Button>
              </div>
            </TabsContent>
            
            <!-- API Import -->
            <TabsContent value="api" class="space-y-4 mt-0 pt-4 px-1">
              <Alert>
                <WebhookIcon class="h-4 w-4" />
                <AlertTitle>API Import</AlertTitle>
                <AlertDescription>
                  Import bundles from an external API endpoint.
                </AlertDescription>
              </Alert>
              
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="api-url">API Endpoint URL</Label>
                  <Input 
                    id="api-url" 
                    v-model="apiUrl" 
                    placeholder="https://example.com/api/bundles" 
                    type="url"
                    :disabled="importing"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label for="api-key">API Key (optional)</Label>
                  <Input 
                    id="api-key" 
                    v-model="apiKey" 
                    placeholder="Enter API key" 
                    :disabled="importing"
                  />
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox 
                      id="include-auth-header" 
                      v-model:checked="includeAuthHeader" 
                      :disabled="importing || !apiKey"
                    />
                    <Label 
                      for="include-auth-header" 
                      :class="{ 'opacity-50': !apiKey }"
                    >
                      Include as Authorization header
                    </Label>
                  </div>
                </div>
                
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" class="flex items-center justify-between w-full">
                      <span>Advanced Options</span>
                      <ChevronDownIcon class="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div class="space-y-3 pt-2">
                      <div class="space-y-2">
                        <Label for="api-method">Request Method</Label>
                        <Select v-model="apiMethod">
                          <SelectTrigger id="api-method">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                          <Checkbox 
                            id="process-pagination" 
                            v-model:checked="processPagination" 
                            :disabled="importing"
                          />
                          <div>
                            <Label for="process-pagination">Process pagination</Label>
                            <p class="text-xs text-muted-foreground">
                              Follow pagination links to import all data
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <!-- Import Options -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Import Options</h3>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="overwrite-existing" v-model:checked="importOptions.overwriteExisting" />
              <div>
                <Label for="overwrite-existing">Update existing bundles</Label>
                <p class="text-xs text-muted-foreground">
                  If a bundle with the same SKU exists, update it
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="validate-only" v-model:checked="importOptions.validateOnly" />
              <div>
                <Label for="validate-only">Validate only (dry run)</Label>
                <p class="text-xs text-muted-foreground">
                  Check data without importing
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Import Progress -->
        <div v-if="importing" class="space-y-4">
          <Progress :value="importProgress" class="h-2" />
          <p class="text-sm text-center">{{ progressMessage }}</p>
        </div>
        
        <!-- Import Results -->
        <div v-if="importComplete" class="space-y-4">
          <Alert :variant="importSuccessful ? 'success' : 'destructive'">
            <div class="flex items-center">
              <div class="mr-2">
                <CheckCircleIcon v-if="importSuccessful" class="h-4 w-4" />
                <XCircleIcon v-else class="h-4 w-4" />
              </div>
              <div>
                <AlertTitle>{{ importSuccessful ? 'Import Complete' : 'Import Failed' }}</AlertTitle>
                <AlertDescription>
                  {{ importSuccessful 
                    ? `Successfully imported ${importedCount} bundle${importedCount !== 1 ? 's' : ''}` 
                    : importError }}
                </AlertDescription>
              </div>
            </div>
          </Alert>
          
          <div v-if="importSuccessful && importWarnings.length > 0" class="border rounded-md p-3 bg-muted/20">
            <h4 class="font-medium mb-2">Warnings</h4>
            <ul class="text-xs space-y-1 list-disc list-inside">
              <li v-for="(warning, index) in importWarnings" :key="index" class="text-yellow-500">
                {{ warning }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <Button 
        variant="outline" 
        @click="$emit('close')"
        :disabled="importing && !importComplete"
      >
        {{ importComplete ? 'Close' : 'Cancel' }}
      </Button>
      <Button 
        @click="startImport" 
        :disabled="!canImport || importing"
      >
        <Loader2Icon v-if="importing && !importComplete" class="mr-2 h-4 w-4 animate-spin" />
        {{ importComplete ? 'Import Again' : (importOptions.validateOnly ? 'Validate' : 'Start Import') }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  CheckCircleIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  Loader2Icon,
  TableIcon,
  UploadIcon,
  WebhookIcon,
  XCircleIcon,
  XIcon,
  ChevronDownIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  importType: {
    type: String,
    default: 'csv',
    validator: (value) => ['csv', 'excel', 'api'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])

// State
const activeTab = ref(props.importType)
const selectedFile = ref(null)
const fileError = ref('')
const isDragging = ref(false)
const apiUrl = ref('')
const apiKey = ref('')
const includeAuthHeader = ref(true)
const apiMethod = ref('GET')
const processPagination = ref(false)
const importing = ref(false)
const importProgress = ref(0)
const progressMessage = ref('')
const importComplete = ref(false)
const importSuccessful = ref(false)
const importedCount = ref(0)
const importError = ref('')
const importWarnings = ref([])
const importOptions = reactive({
  overwriteExisting: true,
  validateOnly: false
})

// Computed
const importTypeLabel = computed(() => {
  const labels = {
    'csv': 'CSV file',
    'excel': 'Excel file',
    'api': 'API connection'
  }
  return labels[activeTab.value] || 'file upload'
})

const canImport = computed(() => {
  if (activeTab.value === 'csv' || activeTab.value === 'excel') {
    return !!selectedFile.value
  } else if (activeTab.value === 'api') {
    return !!apiUrl.value
  }
  return false
})

// Methods
function onFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  handleFile(file)
}

function handleFileSelected(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

function handleFile(file) {
  fileError.value = ''

  if (!file) return

  // Validate file type
  const fileExt = file.name.split('.').pop().toLowerCase()

  if (activeTab.value === 'csv' && fileExt !== 'csv') {
    fileError.value = 'Please upload a CSV file'
    return
  }

  if (activeTab.value === 'excel' && !['xlsx', 'xls'].includes(fileExt)) {
    fileError.value = 'Please upload an Excel file'
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    fileError.value = 'File size must be less than 10MB'
    return
  }

  selectedFile.value = file
  
  // Reset import state when new file selected
  resetImportState()
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function resetImportState() {
  importing.value = false
  importProgress.value = 0
  progressMessage.value = ''
  importComplete.value = false
  importSuccessful.value = false
  importedCount.value = 0
  importError.value = ''
  importWarnings.value = []
}

function simulateImportProgress() {
  const interval = setInterval(() => {
    if (importProgress.value < 90) {
      importProgress.value += Math.floor(Math.random() * 10) + 1
      updateProgressMessage()
    } else {
      clearInterval(interval)
    }
  }, 300)
  
  return interval
}

function updateProgressMessage() {
  if (importProgress.value < 30) {
    progressMessage.value = 'Validating import data...'
  } else if (importProgress.value < 60) {
    progressMessage.value = 'Processing bundle data...'
  } else if (importProgress.value < 90) {
    progressMessage.value = 'Updating database...'
  } else {
    progressMessage.value = 'Finalizing import...'
  }
}

function startImport() {
  if (!canImport.value) return
  
  // Reset state for new import
  resetImportState()
  importing.value = true
  
  // Simulate progress
  const progressInterval = simulateImportProgress()
  
  // Simulate import process
  setTimeout(() => {
    clearInterval(progressInterval)
    importProgress.value = 100
    progressMessage.value = 'Import complete!'
    importComplete.value = true
    
    // Simulate success with 80% chance
    const success = Math.random() < 0.8
    
    if (success) {
      importSuccessful.value = true
      importedCount.value = Math.floor(Math.random() * 20) + 1
      
      // Add some random warnings with 50% chance
      if (Math.random() < 0.5) {
        importWarnings.value = [
          'Some bundle images could not be imported',
          'Duplicate SKUs were detected and renamed'
        ]
      }
      
      emit('import-complete', {
        success: true,
        count: importedCount.value,
        warnings: importWarnings.value
      })
    } else {
      importSuccessful.value = false
      importError.value = 'Failed to process import. Please check your file format and try again.'
      
      emit('import-complete', {
        success: false,
        error: importError.value
      })
    }
  }, 3000)
}

// Watch for prop changes
watch(() => props.importType, (newType) => {
  if (['csv', 'excel', 'api'].includes(newType)) {
    activeTab.value = newType
  }
})

// Watch for tab changes to reset state
watch(activeTab, () => {
  selectedFile.value = null
  resetImportState()
})
</script>

<style scoped>
/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>