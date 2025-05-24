<template>
  <DialogContent class="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Assign Items to Location</DialogTitle>
      <DialogDescription>
        Select inventory items to assign to {{ location.name }} ({{ formatLocationType(location.type) }})
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-4">
      <!-- Location capacity info -->
      <div class="flex items-center justify-between p-3 border rounded-md bg-muted/30">
        <div>
          <div class="text-sm font-medium">Location Capacity</div>
          <div class="text-sm text-muted-foreground">
            {{ location.capacity ? `${itemCount}/${location.capacity} items assigned` : 'Unlimited capacity' }}
          </div>
        </div>
        
        <div v-if="location.capacity">
          <div class="flex items-center space-x-2">
            <div class="w-40 bg-muted rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full" 
                :style="{ width: `${Math.min(100, (itemCount / location.capacity) * 100)}%` }"
                :class="{ 'bg-amber-500': utilizationPercentage > 80, 'bg-destructive': utilizationPercentage > 95 }"
              ></div>
            </div>
            <span class="text-sm font-medium">{{ utilizationPercentage }}%</span>
          </div>
        </div>
      </div>
      
      <!-- Search and filters -->
      <div class="flex items-center space-x-2">
        <div class="flex-1 relative">
          <SearchIcon class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            v-model="searchQuery" 
            placeholder="Search items by name or SKU" 
            class="pl-9"
          />
        </div>
        
        <Select v-model="categoryFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontalIcon class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model:checked="showOnlyAvailable">
              Available items only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model:checked="showAssignedElsewhere">
              Include items assigned elsewhere
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <!-- Selected items summary -->
      <div v-if="selectedItems.length > 0" class="bg-muted/40 border rounded-md p-3">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium">Selected Items ({{ selectedItems.length }})</h3>
          <Button variant="ghost" size="sm" @click="clearSelection">
            <XIcon class="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
        <div class="flex flex-wrap gap-2">
          <Badge 
            v-for="item in selectedItems" 
            :key="item.id" 
            variant="outline"
            class="flex items-center space-x-1 pr-1"
          >
            <span>{{ item.name }} ({{ item.quantity }})</span>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-5 w-5 rounded-full hover:bg-muted" 
              @click="removeItem(item)"
            >
              <XIcon class="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      </div>
      
      <!-- Items table -->
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[40px]"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead class="text-right">Available</TableHead>
              <TableHead class="text-right w-[120px]">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center">
                <Loader2Icon class="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                <span class="text-sm text-muted-foreground block mt-2">Loading items...</span>
              </TableCell>
            </TableRow>
            
            <TableRow v-else-if="filteredItems.length === 0">
              <TableCell colspan="6" class="h-24 text-center">
                <div class="flex flex-col items-center justify-center">
                  <PackageSearchIcon class="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <span class="text-muted-foreground">No items found</span>
                  <p class="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
            
            <TableRow 
              v-for="item in filteredItems" 
              :key="item.id"
              :class="{ 'bg-muted/50': itemSelections[item.id]?.selected }"
            >
              <TableCell>
                <Checkbox 
                  :id="`item-${item.id}`" 
                  v-model="itemSelections[item.id].selected"
                  :disabled="!canSelectItem(item)"
                />
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-md border flex items-center justify-center bg-muted/30">
                    <PackageIcon class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div class="font-medium">{{ item.name }}</div>
                    <div v-if="item.currentLocation" class="text-xs text-muted-foreground">
                      Currently in: {{ item.currentLocation.name }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ item.sku }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ item.category }}</Badge>
              </TableCell>
              <TableCell class="text-right">{{ item.availableStock }}</TableCell>
              <TableCell>
                <div class="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    class="h-7 w-7"
                    :disabled="!itemSelections[item.id].selected || itemSelections[item.id].quantity <= 1"
                    @click="updateItemQuantity(item.id, -1)"
                  >
                    <MinusIcon class="h-3 w-3" />
                  </Button>
                  <Input 
                    v-model.number="itemSelections[item.id].quantity" 
                    type="number"
                    min="1"
                    :max="item.availableStock"
                    class="w-14 h-8 text-center"
                    :disabled="!itemSelections[item.id].selected"
                    @input="validateItemQuantity(item.id, item.availableStock)"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    class="h-7 w-7"
                    :disabled="!itemSelections[item.id].selected || itemSelections[item.id].quantity >= item.availableStock"
                    @click="updateItemQuantity(item.id, 1)"
                  >
                    <PlusIcon class="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Capacity warning -->
      <Alert v-if="isOverCapacity" variant="destructive">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Capacity Exceeded</AlertTitle>
        <AlertDescription>
          The selected items exceed the location's capacity by {{ overCapacityAmount }} items.
          Please remove some items or increase the location's capacity.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="assignItems" 
        :disabled="selectedItems.length === 0 || isSubmitting || isOverCapacity"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        {{ isSubmitting ? 'Assigning...' : `Assign ${selectedItems.length} Items` }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  SearchIcon, SlidersHorizontalIcon, XIcon, 
  PackageIcon, PackageSearchIcon, MinusIcon,
  PlusIcon, AlertCircleIcon, Loader2Icon
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';

// Mock data store - in real app, would be imported from a store
import { useInventoryStore } from '@/store/modules/inventory/items';

// Props
const props = defineProps({
  location: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['items-assigned', 'close']);

// State
const isLoading = ref(true);
const isSubmitting = ref(false);
const searchQuery = ref('');
const categoryFilter = ref('all');
const showOnlyAvailable = ref(true);
const showAssignedElsewhere = ref(false);
const items = ref([]);
const categories = ref([]);
const itemSelections = ref({});

// Get items store
const itemsStore = useInventoryStore();

// Computed properties
const filteredItems = computed(() => {
  if (isLoading.value) return [];
  
  return items.value.filter(item => {
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesSku = item.sku.toLowerCase().includes(query);
      
      if (!matchesName && !matchesSku) return false;
    }
    
    // Category filter
    if (categoryFilter.value !== 'all' && item.categoryId !== categoryFilter.value) {
      return false;
    }
    
    // Availability filter
    if (showOnlyAvailable.value && item.availableStock <= 0) {
      return false;
    }
    
    // Location filter
    if (!showAssignedElsewhere.value && item.currentLocation && 
        item.currentLocation.id !== props.location.id) {
      return false;
    }
    
    return true;
  });
});

const selectedItems = computed(() => {
  const selected = [];
  
  for (const [itemId, selection] of Object.entries(itemSelections.value)) {
    if (selection.selected) {
      const item = items.value.find(i => i.id === itemId);
      if (item) {
        selected.push({
          ...item,
          quantity: selection.quantity
        });
      }
    }
  }
  
  return selected;
});

const itemCount = computed(() => {
  return (props.location.itemCount || 0) + selectedItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const utilizationPercentage = computed(() => {
  if (!props.location.capacity) return 0;
  return Math.round((itemCount.value / props.location.capacity) * 100);
});

const isOverCapacity = computed(() => {
  if (!props.location.capacity) return false;
  return itemCount.value > props.location.capacity;
});

const overCapacityAmount = computed(() => {
  if (!isOverCapacity.value) return 0;
  return itemCount.value - props.location.capacity;
});

// Methods
const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const fetchItems = async () => {
  isLoading.value = true;
  
  try {
    // In a real implementation, you would fetch from your API
    const response = await itemsStore.getItems();
    items.value = response;
    
    // Initialize item selections
    items.value.forEach(item => {
      itemSelections.value[item.id] = {
        selected: false,
        quantity: 1
      };
    });
    
    // Get categories
    const uniqueCategories = [...new Set(items.value.map(item => item.category))];
    categories.value = uniqueCategories.map((name, index) => ({
      id: `cat-${index}`,
      name
    }));
  } catch (error) {
    console.error('Error fetching items:', error);
  } finally {
    isLoading.value = false;
  }
};

const canSelectItem = (item) => {
  return item.availableStock > 0;
};

const updateItemQuantity = (itemId, change) => {
  const selection = itemSelections.value[itemId];
  if (!selection) return;
  
  const item = items.value.find(i => i.id === itemId);
  if (!item) return;
  
  const newQuantity = selection.quantity + change;
  if (newQuantity >= 1 && newQuantity <= item.availableStock) {
    selection.quantity = newQuantity;
  }
};

const validateItemQuantity = (itemId, maxQuantity) => {
  const selection = itemSelections.value[itemId];
  if (!selection) return;
  
  // Ensure it's a number
  if (isNaN(selection.quantity)) {
    selection.quantity = 1;
    return;
  }
  
  // Ensure it's an integer
  selection.quantity = Math.floor(selection.quantity);
  
  // Ensure it's within bounds
  if (selection.quantity < 1) {
    selection.quantity = 1;
  } else if (selection.quantity > maxQuantity) {
    selection.quantity = maxQuantity;
  }
};

const removeItem = (item) => {
  if (itemSelections.value[item.id]) {
    itemSelections.value[item.id].selected = false;
  }
};

const clearSelection = () => {
  Object.values(itemSelections.value).forEach(selection => {
    selection.selected = false;
  });
};

const assignItems = async () => {
  if (selectedItems.value.length === 0 || isOverCapacity.value) return;
  
  isSubmitting.value = true;
  
  try {
    // In a real implementation, you would call your API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Prepare the assignment data
    const assignmentData = selectedItems.value.map(item => ({
      itemId: item.id,
      quantity: item.quantity,
      locationId: props.location.id
    }));
    
    // Emit the event
    emit('items-assigned', props.location, assignmentData);
  } catch (error) {
    console.error('Error assigning items:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchItems();
});

// Watch for filter changes to reset pagination
watch([searchQuery, categoryFilter, showOnlyAvailable, showAssignedElsewhere], () => {
  // You could add pagination reset logic here if needed
});
</script>