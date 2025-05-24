<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Print Location Labels</DialogTitle>
      <DialogDescription>
        Generate and print labels for {{ location.name }} {{ includeChildren ? 'and its sub-locations' : '' }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-5">
      <!-- Location Details -->
      <div class="p-3 border rounded-md bg-muted/30">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 rounded-md border flex items-center justify-center bg-background">
            <MapPinIcon class="h-5 w-5" />
          </div>
          <div>
            <div class="font-medium">{{ location.name }}</div>
            <div class="text-sm text-muted-foreground">
              {{ formatLocationType(location.type) }} | Code: {{ location.code || 'N/A' }}
            </div>
          </div>
        </div>
        
        <div v-if="includeChildren && childLocations.length > 0" class="mt-3 pt-3 border-t">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Sub-locations included:</span>
            <Badge>{{ childLocations.length }}</Badge>
          </div>
          <div class="text-sm text-muted-foreground">
            <span v-if="childLocations.length <= 3">
              {{ childLocations.map(loc => loc.name).join(', ') }}
            </span>
            <span v-else>
              {{ childLocations.slice(0, 2).map(loc => loc.name).join(', ') }} and {{ childLocations.length - 2 }} more
            </span>
          </div>
        </div>
      </div>
      
      <!-- Print Options -->
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Checkbox id="include-children" v-model:checked="includeChildren" />
          <div>
            <Label 
              for="include-children" 
              class="text-base font-medium flex items-center cursor-pointer"
            >
              Include sub-locations
            </Label>
            <p class="text-sm text-muted-foreground">
              Generate labels for all child locations recursively
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div class="space-y-3">
          <Label>Label Type</Label>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="type in labelTypes"
              :key="type.id"
              class="border rounded-md p-3 cursor-pointer transition-colors"
              :class="[
                labelTypeId === type.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              ]"
              @click="labelTypeId = type.id"
            >
              <div class="h-12 flex items-center justify-center mb-2">
                <img 
                  :src="type.image" 
                  :alt="type.name"
                  class="max-h-full max-w-full object-contain"
                />
              </div>
              <div class="text-center text-sm font-medium">{{ type.name }}</div>
              <div class="text-center text-xs text-muted-foreground">{{ type.size }}</div>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <Label>Print Content</Label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="print-name" v-model:checked="printOptions.name" />
              <Label for="print-name" class="cursor-pointer">Location Name</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="print-code" v-model:checked="printOptions.code" />
              <Label for="print-code" class="cursor-pointer">Location Code</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="print-barcode" v-model:checked="printOptions.barcode" />
              <Label for="print-barcode" class="cursor-pointer">Barcode</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="print-qr" v-model:checked="printOptions.qrCode" />
              <Label for="print-qr" class="cursor-pointer">QR Code</Label>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <Label>Print Settings</Label>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="copies" class="text-sm">Copies per label</Label>
              <Input 
                id="copies" 
                v-model.number="printOptions.copies" 
                type="number" 
                min="1" 
                max="10"
              />
            </div>
            <div class="space-y-2">
              <Label for="printer" class="text-sm">Printer</Label>
              <Select v-model="printOptions.printer">
                <SelectTrigger id="printer">
                  <SelectValue placeholder="Select printer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Printer</SelectItem>
                  <SelectItem value="zebra">Zebra Label Printer</SelectItem>
                  <SelectItem value="dymo">DYMO LabelWriter</SelectItem>
                  <SelectItem value="brother">Brother QL-800</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Label Preview -->
      <div class="border rounded-md p-3">
        <h3 class="text-sm font-medium mb-2">Preview</h3>
        <div class="flex justify-center bg-muted/30 p-4 rounded">
          <div class="border bg-white rounded shadow-sm p-4 w-64 h-32 flex flex-col justify-center">
            <div v-if="printOptions.name" class="text-center font-bold text-lg mb-1">
              {{ location.name }}
            </div>
            <div v-if="printOptions.code" class="text-center text-sm mb-2">
              {{ location.code || 'LOC-001' }}
            </div>
            <div v-if="printOptions.barcode" class="flex justify-center mb-1">
              <div class="h-8 w-36 bg-gray-800 rounded-sm"></div>
            </div>
            <div v-if="printOptions.qrCode" class="flex justify-center">
              <div class="h-10 w-10 bg-gray-800 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="printLabels" 
        :disabled="isPrinting || !isValid"
      >
        <PrinterIcon v-if="!isPrinting" class="h-4 w-4 mr-2" />
        <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
        {{ isPrinting ? 'Printing...' : 'Print Labels' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  PrinterIcon, MapPinIcon, Loader2Icon
} from 'lucide-vue-next';
import { 
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Props
const props = defineProps({
  location: {
    type: Object,
    required: true,
    default: () => ({})
  },
  includeChildren: {
    type: Boolean,
    default: true
  }
});

// Emits
defineEmits(['close', 'print-complete']);

// State
const isPrinting = ref(false);
const includeChildren = ref(props.includeChildren);
const labelTypeId = ref('standard');
const printOptions = ref({
  name: true,
  code: true,
  barcode: true,
  qrCode: false,
  copies: 1,
  printer: 'default'
});

// Mock data
const labelTypes = [
  {
    id: 'small',
    name: 'Small',
    size: '1.5" x 0.75"',
    image: '/assets/images/label-small.png'
  },
  {
    id: 'standard',
    name: 'Standard',
    size: '2.25" x 1.25"',
    image: '/assets/images/label-standard.png'
  },
  {
    id: 'large',
    name: 'Large',
    size: '4" x 2"',
    image: '/assets/images/label-large.png'
  }
];

// Get child locations recursively (mocked)
const childLocations = computed(() => {
  // In a real implementation, you would get this from your store or API
  // This is just a mock example
  return props.location.children || [];
});

// Validation
const isValid = computed(() => {
  return printOptions.value.name || printOptions.value.code || 
         printOptions.value.barcode || printOptions.value.qrCode;
});

// Methods
const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const printLabels = async () => {
  if (!isValid.value) return;
  
  isPrinting.value = true;
  
  try {
    // In a real implementation, you would call your API to print
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate printing
    
    // Log what would be printed
    console.log('Printing labels for:', props.location.name);
    console.log('Include children:', includeChildren.value);
    console.log('Label type:', labelTypeId.value);
    console.log('Print options:', printOptions.value);
    
    // Close the dialog
    emit('print-complete');
    emit('close');
  } catch (error) {
    console.error('Error printing labels:', error);
  } finally {
    isPrinting.value = false;
  }
};
</script>