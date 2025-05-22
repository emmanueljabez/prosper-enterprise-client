<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Reorder Automation Settings</DialogTitle>
      <DialogDescription>
        Configure the global settings for automatic reorder rules and notifications.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-6">
      <!-- Global Settings -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Global Settings</h3>
        
        <div class="flex items-center space-x-2">
          <Switch 
            id="enable-global-rules" 
            v-model:checked="settingsData.enableGlobalReorderRules"
          />
          <Label for="enable-global-rules">Enable global reorder rules</Label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="default-lead-time">Default Lead Time (days)</Label>
            <Input
              id="default-lead-time"
              v-model="settingsData.defaultLeadTimeDays"
              type="number"
              min="1"
              step="1"
            />
            <p class="text-xs text-muted-foreground">
              Used when item-specific lead time is not available
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="safety-stock-percentage">Default Safety Stock (%)</Label>
            <div class="relative">
              <Input
                id="safety-stock-percentage"
                v-model="settingsData.defaultSafetyStockPercentage"
                type="number"
                min="1"
                max="100"
                step="1"
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
            </div>
            <p class="text-xs text-muted-foreground">
              Buffer inventory maintained above reorder point
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Notification Settings -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Notifications</h3>
        
        <div class="flex items-center space-x-2">
          <Switch 
            id="notify-on-low-stock" 
            v-model:checked="settingsData.notifyOnLowStock"
          />
          <Label for="notify-on-low-stock">Send notifications when stock falls below reorder point</Label>
        </div>
        
        <div class="flex items-center space-x-2">
          <Switch 
            id="auto-create-po" 
            v-model:checked="settingsData.autoCreatePurchaseOrders"
          />
          <Label for="auto-create-po">Automatically create purchase orders for reorder suggestions</Label>
        </div>
      </div>
      
      <Separator />
      
      <!-- Preferred Suppliers -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Default Suppliers</h3>
        <p class="text-sm text-muted-foreground">
          Select preferred suppliers that will be used as default for reorder rules
        </p>
        
        <div class="max-h-[200px] overflow-y-auto border rounded-md p-2">
          <CheckboxGroup 
            v-model="settingsData.preferredSuppliers"
            class="space-y-2"
          >
            <div 
              v-for="supplier in sortedSuppliers" 
              :key="supplier.id"
              class="flex items-center space-x-2"
            >
              <Checkbox 
                :id="`supplier-${supplier.id}`" 
                :value="supplier.id"
              />
              <Label :for="`supplier-${supplier.id}`" class="flex items-center space-x-2">
                <span>{{ supplier.name }}</span>
                <Badge 
                  v-if="supplier.rating >= 4"
                  variant="success"
                  class="ml-2"
                >
                  Preferred
                </Badge>
              </Label>
            </div>
          </CheckboxGroup>
          
          <div 
            v-if="!availableSuppliers || availableSuppliers.length === 0" 
            class="text-center py-4 text-muted-foreground"
          >
            No active suppliers available
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="text-sm text-destructive">
      {{ error }}
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="close">Cancel</Button>
      <Button type="submit" @click="saveSettings">Save Settings</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useSuppliersStore } from '@/store/modules/inventory/suppliers'

// Define a CheckboxGroup component wrapper for multiple checkbox selection
const CheckboxGroup = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
    const updateValue = (ev) => {
      const target = ev.target
      const value = target.value
      const isChecked = target.checked
      
      let newValue = [...(props.modelValue || [])]
      
      if (isChecked && !newValue.includes(value)) {
        newValue.push(value)
      } else if (!isChecked && newValue.includes(value)) {
        newValue = newValue.filter(v => v !== value)
      }
      
      emit('update:modelValue', newValue)
    }
    
    return () => {
      const vnode = slots.default()
      if (Array.isArray(vnode)) {
        return vnode.map(node => {
          if (node.type === Checkbox) {
            const checkbox = node.children.default()[0]
            if (checkbox && checkbox.type === 'input') {
              checkbox.props.checked = props.modelValue?.includes(checkbox.props.value)
              checkbox.props.onChange = updateValue
            }
          }
          return node
        })
      }
      return vnode
    }
  }
}

const props = defineProps({
  settings: { 
    type: Object, 
    default: () => ({
      enableGlobalReorderRules: true,
      defaultLeadTimeDays: 7,
      defaultSafetyStockPercentage: 20,
      notifyOnLowStock: true,
      autoCreatePurchaseOrders: false,
      preferredSuppliers: []
    })
  }
})

const emit = defineEmits(['save-settings', 'close'])

// Initialize settings data from props
const settingsData = reactive({
  enableGlobalReorderRules: props.settings.enableGlobalReorderRules ?? true,
  defaultLeadTimeDays: props.settings.defaultLeadTimeDays ?? 7,
  defaultSafetyStockPercentage: props.settings.defaultSafetyStockPercentage ?? 20,
  notifyOnLowStock: props.settings.notifyOnLowStock ?? true,
  autoCreatePurchaseOrders: props.settings.autoCreatePurchaseOrders ?? false,
  preferredSuppliers: [...(props.settings.preferredSuppliers || [])]
})

// State for validation and errors
const error = ref('')

// Access the suppliers store
const suppliersStore = useSuppliersStore()

// Get active suppliers
const availableSuppliers = computed(() => {
  return suppliersStore.getActiveSuppliers
})

// Sort suppliers by rating (highest first)
const sortedSuppliers = computed(() => {
  return [...availableSuppliers.value].sort((a, b) => b.rating - a.rating)
})

// Form validation
const validateSettings = () => {
  if (settingsData.defaultLeadTimeDays <= 0) {
    error.value = 'Default lead time must be greater than 0'
    return false
  }
  
  if (settingsData.defaultSafetyStockPercentage <= 0 || 
      settingsData.defaultSafetyStockPercentage > 100) {
    error.value = 'Safety stock percentage must be between 1 and 100'
    return false
  }
  
  return true
}

// Event handlers
const saveSettings = () => {
  error.value = ''
  
  if (!validateSettings()) {
    return
  }
  
  emit('save-settings', { ...settingsData })
}

const close = () => {
  emit('close')
}
</script>