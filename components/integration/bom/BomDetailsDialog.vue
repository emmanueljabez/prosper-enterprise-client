<template>
  <Dialog :open="isOpen" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ bom?.name || 'BOM Details' }}</DialogTitle>
        <DialogDescription>
          {{ bom?.description || 'Bill of Materials information' }}
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="loading" class="py-8 flex flex-col items-center justify-center">
        <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
        <p class="mt-2 text-sm text-muted-foreground">Loading BOM details...</p>
      </div>
      
      <div v-else-if="!bom" class="py-8 text-center">
        <p>BOM not found</p>
      </div>
      
      <div v-else class="space-y-6">
        <!-- Basic information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-muted-foreground">Product</h3>
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center">
                <PackageIcon class="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p>{{ bom.productName }}</p>
                <p class="text-xs text-muted-foreground">{{ bom.productSku }}</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-muted-foreground">Status</h3>
            <div class="flex items-center gap-2">
              <Badge :variant="getStatusVariant(bom.status)">
                {{ formatStatus(bom.status) }}
              </Badge>
              <p class="text-sm">Version {{ bom.version }}</p>
            </div>
          </div>
          
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-muted-foreground">Batch Size</h3>
            <p>{{ bom.batchSize }} units</p>
          </div>
          
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-muted-foreground">Effective Date</h3>
            <p>{{ formatDate(bom.effectiveDate) }}</p>
          </div>
        </div>
        
        <Separator />
        
        <!-- Tabs for different sections -->
        <Tabs defaultValue="components" class="w-full">
          <TabsList class="grid grid-cols-4">
            <TabsTrigger value="components">Components ({{ bom.components?.length || 0 }})</TabsTrigger>
            <TabsTrigger value="steps">Assembly Steps ({{ bom.steps?.length || 0 }})</TabsTrigger>
            <TabsTrigger value="quality">Quality Checks ({{ bom.qualityChecks?.length || 0 }})</TabsTrigger>
            <TabsTrigger value="attachments">Attachments ({{ bom.attachments?.length || 0 }})</TabsTrigger>
          </TabsList>
          
          <!-- Components tab -->
          <TabsContent value="components">
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Optional</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="bom.components?.length === 0">
                    <TableCell colSpan="5" class="text-center py-6 text-muted-foreground">
                      No components in this BOM.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="component in bom.components" :key="component.itemId">
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center">
                          <PackageIcon class="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div>{{ component.itemName }}</div>
                          <div class="text-xs text-muted-foreground">{{ component.sku }}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {{ component.quantity }} {{ component.unitOfMeasure }}
                    </TableCell>
                    <TableCell>{{ component.position || '-' }}</TableCell>
                    <TableCell>{{ component.isOptional ? 'Yes' : 'No' }}</TableCell>
                    <TableCell>{{ component.notes || '-' }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <!-- Assembly Steps tab -->
          <TabsContent value="steps">
            <div class="space-y-4">
              <div v-if="bom.steps?.length === 0" class="text-center py-6 text-muted-foreground border rounded-md">
                No assembly steps defined for this BOM.
              </div>
              
              <div 
                v-for="step in bom.steps" 
                :key="step.stepNumber"
                class="border rounded-md p-4 space-y-3"
              >
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="h-6 w-6 flex items-center justify-center rounded-full p-0">
                    {{ step.stepNumber }}
                  </Badge>
                  <h4 class="font-medium">{{ step.description }}</h4>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-muted-foreground">Est. Time:</span>
                    <span class="ml-1">{{ step.estimatedTime }} minutes</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Tools:</span>
                    <span class="ml-1">{{ step.requiredTools?.join(', ') || 'None' }}</span>
                  </div>
                </div>
                
                <div class="text-sm">
                  <span class="text-muted-foreground">Instructions:</span>
                  <p class="mt-1">{{ step.instructions }}</p>
                </div>
                
                <div v-if="step.imageUrl" class="mt-2">
                  <img :src="step.imageUrl" alt="Step illustration" class="max-h-40 rounded-md border" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <!-- Quality Checks tab -->
          <TabsContent value="quality">
            <div class="space-y-4">
              <div v-if="bom.qualityChecks?.length === 0" class="text-center py-6 text-muted-foreground border rounded-md">
                No quality checks defined for this BOM.
              </div>
              
              <div 
                v-for="check in bom.qualityChecks" 
                :key="check.checkName"
                class="border rounded-md p-4 space-y-3"
              >
                <h4 class="font-medium">{{ check.checkName }}</h4>
                
                <div class="text-sm">
                  <span class="text-muted-foreground">Description:</span>
                  <p class="mt-1">{{ check.description }}</p>
                </div>
                
                <div class="text-sm">
                  <span class="text-muted-foreground">Acceptance Criteria:</span>
                  <p class="mt-1">{{ check.acceptanceCriteria }}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <!-- Attachments tab -->
          <TabsContent value="attachments">
            <div class="space-y-4">
              <div v-if="bom.attachments?.length === 0" class="text-center py-6 text-muted-foreground border rounded-md">
                No attachments for this BOM.
              </div>
              
              <div v-else class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Uploaded On</TableHead>
                      <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="attachment in bom.attachments" :key="attachment.name">
                      <TableCell>{{ attachment.name }}</TableCell>
                      <TableCell>{{ attachment.fileType.toUpperCase() }}</TableCell>
                      <TableCell>{{ attachment.uploadedBy }}</TableCell>
                      <TableCell>{{ formatDate(attachment.uploadedAt) }}</TableCell>
                      <TableCell class="text-right">
                        <Button variant="ghost" size="sm" as="a" :href="attachment.url" target="_blank">
                          <DownloadIcon class="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator />
        
        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Created:</span>
            <span class="ml-1">{{ formatDate(bom.createdAt) }} by {{ bom.createdBy }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Last Updated:</span>
            <span class="ml-1">{{ formatDate(bom.updatedAt) }} by {{ bom.updatedBy }}</span>
          </div>
        </div>
      </div>
      
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="$emit('update:open', false)">
          Close
        </Button>
        <Button variant="outline" @click="$emit('edit-bom', bom)">
          <PencilIcon class="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="outline" @click="$emit('create-work-order', bom)">
          <ClipboardPlusIcon class="h-4 w-4 mr-1" />
          Create Work Order
        </Button>
        <Button @click="$emit('duplicate-bom', bom)">
          <CopyIcon class="h-4 w-4 mr-1" />
          Duplicate
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Loader2Icon, 
  PackageIcon, 
  PencilIcon, 
  ClipboardPlusIcon, 
  CopyIcon,
  DownloadIcon
} from 'lucide-vue-next'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  bom: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:open', 
  'edit-bom', 
  'duplicate-bom', 
  'create-work-order'
])

// Helper functions
const getStatusVariant = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'draft': return 'secondary'
    case 'archived': return 'outline'
    default: return 'default'
  }
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}
</script>