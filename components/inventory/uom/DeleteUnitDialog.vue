<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Unit of Measure</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this unit of measure? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div class="border rounded-md p-4 mb-4 bg-muted/30">
          <div class="flex items-center">
            <AlertTriangleIcon class="h-5 w-5 text-destructive mr-2" />
            <p class="text-sm font-medium">You are about to delete the following unit:</p>
          </div>
          <div class="mt-2 space-y-1 text-sm">
            <p>
              <span class="font-medium">Name:</span> {{ unit?.name }}
            </p>
            <p>
              <span class="font-medium">Symbol:</span> 
              <span class="font-mono bg-muted px-1 rounded">{{ unit?.symbol }}</span>
            </p>
            <p>
              <span class="font-medium">Category:</span> {{ formatCategory(unit?.category) }}
            </p>
            <p v-if="unit?.family">
              <span class="font-medium">Family:</span> {{ unit.family.name }}
            </p>
          </div>
        </div>

        <!-- Usage Warning -->
        <div v-if="hasUsage" class="border border-destructive rounded-md p-4 mb-4 bg-destructive/5">
          <div class="flex items-start space-x-2">
            <AlertTriangleIcon class="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p class="text-sm font-medium text-destructive">Warning: Unit is in use</p>
              <div class="mt-2 space-y-1 text-sm text-destructive/80">
                <p>This unit is currently being used in:</p>
                <ul class="ml-4 space-y-1">
                  <li v-if="unit?.stats?.productsCount > 0">
                    • {{ unit.stats.productsCount }} product(s)
                  </li>
                  <li v-if="unit?.stats?.transactionsCount > 0">
                    • {{ unit.stats.transactionsCount }} transaction(s)
                  </li>
                  <li v-if="unit?.stats?.inventoryCount > 0">
                    • {{ unit.stats.inventoryCount }} inventory record(s)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Family Members Warning -->
        <div v-if="hasFamilyMembers" class="border border-amber-200 rounded-md p-4 mb-4 bg-amber-50">
          <div class="flex items-start space-x-2">
            <AlertTriangleIcon class="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-amber-800">Family Impact</p>
              <p class="text-sm text-amber-700 mt-1">
                This unit belongs to the "{{ unit?.family?.name }}" family with {{ unit?.family?.units?.length }} members. 
                Deleting this unit will not affect other family members, but any conversions involving this unit will be lost.
              </p>
            </div>
          </div>
        </div>

        <!-- Base Unit Warning -->
        <div v-if="isBaseUnit && hasDependentUnits" class="border border-destructive rounded-md p-4 mb-4 bg-destructive/5">
          <div class="flex items-start space-x-2">
            <AlertTriangleIcon class="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p class="text-sm font-medium text-destructive">Cannot Delete Base Unit</p>
              <p class="text-sm text-destructive/80 mt-1">
                This is a base unit with {{ dependentUnitsCount }} dependent unit(s). You must first delete or 
                reassign all dependent units before deleting this base unit.
              </p>
              <div class="mt-2">
                <p class="text-xs font-medium">Dependent units:</p>
                <ul class="text-xs ml-2 mt-1">
                  <li v-for="depUnit in dependentUnits" :key="depUnit.id">
                    • {{ depUnit.name }} ({{ depUnit.symbol }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          Deleting this unit will permanently remove it from the system. Any historical data referencing 
          this unit will become invalid and may cause issues with reports and calculations.
        </p>

        <!-- Force Delete Option -->
        <div v-if="hasUsage" class="mt-4 p-3 border border-destructive/20 rounded-md bg-destructive/5">
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox id="force-delete" v-model="forceDelete" />
            <Label for="force-delete" class="text-sm font-medium text-destructive">
              Force delete (not recommended)
            </Label>
          </div>
          <p class="text-xs text-destructive/80">
            This will delete the unit even though it's in use. This may cause data integrity issues 
            and is not recommended. Consider deactivating the unit instead.
          </p>
        </div>

        <!-- Confirmation Checkbox -->
        <div class="flex items-center space-x-2 mt-4">
          <Checkbox id="confirm-delete" v-model="confirmDelete" />
          <Label for="confirm-delete" class="text-sm font-medium">
            I understand that this action cannot be undone
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button
          variant="outline"
          v-if="hasUsage && !forceDelete"
          @click="deactivateUnit"
          :disabled="isProcessing"
        >
          <Loader2Icon v-if="isProcessing && actionType === 'deactivate'" class="h-4 w-4 mr-2 animate-spin" />
          Deactivate Instead
        </Button>
        <Button
          variant="destructive"
          :disabled="!canDelete || isProcessing"
          @click="handleDelete"
        >
          <Loader2Icon v-if="isProcessing && actionType === 'delete'" class="h-4 w-4 mr-2 animate-spin" />
          Delete Unit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  unit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'deleted', 'deactivated'])

const { toast } = useToast()

// Form state
const confirmDelete = ref(false)
const forceDelete = ref(false)
const isProcessing = ref(false)
const actionType = ref('')

// Mock dependent units data - replace with actual API call
const dependentUnits = ref([
  { id: '1', name: 'Centimeter', symbol: 'cm' },
  { id: '2', name: 'Millimeter', symbol: 'mm' }
])

// Computed properties
const hasUsage = computed(() => {
  const stats = props.unit?.stats
  return stats && (stats.productsCount > 0 || stats.transactionsCount > 0 || stats.inventoryCount > 0)
})

const hasFamilyMembers = computed(() => {
  return props.unit?.family && props.unit.family.units?.length > 1
})

const isBaseUnit = computed(() => {
  return props.unit?.isBaseUnit
})

const hasDependentUnits = computed(() => {
  return dependentUnits.value.length > 0
})

const dependentUnitsCount = computed(() => {
  return dependentUnits.value.length
})

const canDelete = computed(() => {
  const basicRequirements = confirmDelete.value && !isProcessing.value
  
  // Cannot delete base unit with dependents
  if (isBaseUnit.value && hasDependentUnits.value) {
    return false
  }
  
  // If unit is in use, require force delete
  if (hasUsage.value) {
    return basicRequirements && forceDelete.value
  }
  
  return basicRequirements
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function resetForm() {
  confirmDelete.value = false
  forceDelete.value = false
  isProcessing.value = false
  actionType.value = ''
}

function formatCategory(category) {
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'
}

async function deactivateUnit() {
  try {
    actionType.value = 'deactivate'
    isProcessing.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    toast({
      title: "Success",
      description: "Unit of measure deactivated successfully",
    })

    emit('deactivated', props.unit)
    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to deactivate unit of measure",
      variant: "destructive",
    })
  } finally {
    isProcessing.value = false
    actionType.value = ''
  }
}

async function handleDelete() {
  if (!canDelete.value) return

  try {
    actionType.value = 'delete'
    isProcessing.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Unit of measure deleted successfully",
    })

    emit('deleted', props.unit)
    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to delete unit of measure",
      variant: "destructive",
    })
  } finally {
    isProcessing.value = false
    actionType.value = ''
  }
}
</script>
