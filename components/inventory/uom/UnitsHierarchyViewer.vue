<template>
  <div class="border rounded-lg">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64 p-8">
      <div class="flex flex-col items-center">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary mb-4" />
        <span class="text-muted-foreground">Loading unit families...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center h-64 p-8">
      <div class="flex flex-col items-center text-center max-w-md">
        <AlertCircleIcon class="h-10 w-10 text-destructive mb-4" />
        <h3 class="text-lg font-semibold mb-2">Unable to load unit families</h3>
        <p class="text-muted-foreground mb-4">{{ error }}</p>
        <Button @click="$emit('refresh')">Try Again</Button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!units.length" class="flex justify-center items-center h-64 p-8">
      <div class="flex flex-col items-center text-center max-w-md">
        <RulerIcon class="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 class="text-lg font-semibold mb-2">No units found</h3>
        <p class="text-muted-foreground mb-4">
          Get started by creating your first unit of measure
        </p>
        <Button @click="$emit('create-unit')">Add Unit</Button>
      </div>
    </div>

    <!-- Units Hierarchy View -->
    <div v-else class="p-4">
      <!-- View Controls -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'tree'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'tree' }"
          >
            <NetworkIcon class="h-4 w-4 mr-2" />
            Family Tree
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'category'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'category' }"
          >
            <FolderIcon class="h-4 w-4 mr-2" />
            By Category
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'conversion'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'conversion' }"
          >
            <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
            Conversion Map
          </Button>
        </div>
        
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <Input 
            placeholder="Search units..." 
            class="h-9 w-full sm:w-[250px]" 
            v-model="searchQuery"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon class="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[200px]">
              <DropdownMenuLabel>Filter By Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem v-model:checked="filters.weight">
                Weight
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.length">
                Length
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.volume">
                Volume
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.time">
                Time
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.temperature">
                Temperature
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem v-model:checked="filters.activeOnly">
                Active Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.baseUnitsOnly">
                Base Units Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Family Tree View -->
      <div v-if="viewMode === 'tree'">
        <div class="border rounded-lg p-4 bg-muted/10">
          <div v-for="family in unitFamilies" :key="family.baseUnit.id" class="mb-4 last:mb-0">
            <UnitFamilyTreeNode 
              :family="family" 
              :expanded-nodes="expandedNodes"
              @toggle-node="toggleNode"
              @view-unit="$emit('view-unit', $event)"
              @edit-unit="$emit('edit-unit', $event)"
              @delete-unit="$emit('delete-unit', $event)"
              @convert-units="$emit('convert-units', $event)"
              @duplicate-unit="$emit('duplicate-unit', $event)"
            />
          </div>
        </div>
      </div>
      
      <!-- Category View -->
      <div v-else-if="viewMode === 'category'">
        <div class="space-y-4">
          <div v-for="category in categorizedUnits" :key="category.name" class="border rounded-lg">
            <div 
              class="p-4 bg-muted/20 cursor-pointer flex items-center justify-between"
              @click="toggleCategory(category.name)"
            >
              <div class="flex items-center space-x-3">
                <component :is="category.icon" class="h-5 w-5" />
                <h3 class="font-medium">{{ category.label }}</h3>
                <Badge variant="secondary" class="text-xs">{{ category.units.length }}</Badge>
              </div>
              <ChevronDownIcon 
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': expandedCategories.includes(category.name) }"
              />
            </div>
            <div v-if="expandedCategories.includes(category.name)" class="p-4 border-t">
              <div class="grid gap-3">
                <div 
                  v-for="unit in category.units" 
                  :key="unit.id"
                  class="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                  @click="$emit('view-unit', unit)"
                >
                  <div class="flex items-center space-x-3">
                    <Badge :variant="unit.baseUnit ? 'default' : 'secondary'" class="text-xs">
                      {{ unit.baseUnit ? 'Base' : 'Conversion' }}
                    </Badge>
                    <div>
                      <div class="font-medium">{{ unit.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ unit.code }}</div>
                    </div>
                    <div v-if="!unit.baseUnit && unit.baseUnitOfMeasure" class="text-sm text-muted-foreground">
                      1 {{ unit.code }} = {{ unit.conversionFactor }} {{ unit.baseUnitOfMeasure.code }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Badge :variant="unit.isActive ? 'success' : 'secondary'" class="text-xs">
                      {{ unit.isActive ? 'Active' : 'Inactive' }}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" @click.stop>
                          <MoreHorizontalIcon class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="$emit('view-unit', unit)">
                          <EyeIcon class="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="$emit('edit-unit', unit)">
                          <PencilIcon class="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="$emit('convert-units', unit)">
                          <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
                          Convert
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="$emit('duplicate-unit', unit)">
                          <CopyIcon class="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="$emit('delete-unit', unit)" class="text-destructive">
                          <TrashIcon class="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Conversion Map View -->
      <div v-else-if="viewMode === 'conversion'" class="border rounded-lg p-4 bg-muted/10 h-[500px]">
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <ArrowRightLeftIcon class="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Unit Conversion Map</h3>
            <p class="text-muted-foreground mb-4">
              Interactive conversion relationships will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  Loader2Icon, AlertCircleIcon, RulerIcon, NetworkIcon, FolderIcon,
  ArrowRightLeftIcon, FilterIcon, MoreHorizontalIcon, ChevronDownIcon,
  EyeIcon, PencilIcon, TrashIcon, CopyIcon, ScaleIcon, FlaskConicalIcon,
  ClockIcon, ThermometerIcon, ZapIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Components
import UnitFamilyTreeNode from './UnitFamilyTreeNode.vue';

// Props
const props = defineProps({
  units: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, null],
    default: null
  }
});

// Emits
const emit = defineEmits([
  'view-unit', 
  'edit-unit', 
  'delete-unit', 
  'create-unit',
  'refresh',
  'convert-units',
  'duplicate-unit'
]);

// UI state
const viewMode = ref('tree');
const searchQuery = ref('');
const filters = ref({
  weight: true,
  length: true,
  volume: true,
  time: true,
  temperature: true,
  activeOnly: false,
  baseUnitsOnly: false
});
const expandedNodes = ref([]);
const expandedCategories = ref(['Weight', 'Length', 'Volume']);

// Category icons mapping
const categoryIcons = {
  Weight: ScaleIcon,
  weight: ScaleIcon,
  Length: RulerIcon,
  length: RulerIcon,
  Volume: FlaskConicalIcon,
  volume: FlaskConicalIcon,
  Time: ClockIcon,
  time: ClockIcon,
  Temperature: ThermometerIcon,
  temperature: ThermometerIcon,
  Energy: ZapIcon,
  energy: ZapIcon
};

// Computed properties
const filteredUnits = computed(() => {
  let result = [...props.units];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(unit => 
      unit.name.toLowerCase().includes(query) || 
      unit.code?.toLowerCase().includes(query) ||
      unit.description?.toLowerCase().includes(query)
    );
  }
  
  // Apply category filters
  const enabledCategories = Object.entries(filters.value)
    .filter(([key, value]) => value && !['activeOnly', 'baseUnitsOnly'].includes(key))
    .map(([key]) => key);
  
  if (enabledCategories.length > 0) {
    result = result.filter(unit => 
      enabledCategories.some(category => 
        unit.category?.toLowerCase() === category.toLowerCase()
      )
    );
  }
  
  // Apply status filter
  if (filters.value.activeOnly) {
    result = result.filter(unit => unit.isActive);
  }
  
  // Apply type filter
  if (filters.value.baseUnitsOnly) {
    result = result.filter(unit => unit.baseUnit);
  }
  
  return result;
});

const unitFamilies = computed(() => {
  const families = [];
  const baseUnits = filteredUnits.value.filter(unit => unit.baseUnit);
  
  baseUnits.forEach(baseUnit => {
    const conversionUnits = filteredUnits.value.filter(unit => 
      !unit.baseUnit && (
        // Handle both possible field names from API response
        unit.baseUnitOfMeasure?.id === baseUnit.id ||
        unit.baseUnitId === baseUnit.id
      )
    );
    
    families.push({
      baseUnit,
      conversionUnits,
      category: baseUnit.category
    });
  });
  
  return families;
});

const categorizedUnits = computed(() => {
  const categories = {};
  
  filteredUnits.value.forEach(unit => {
    const categoryKey = unit.category || 'Other';
    if (!categories[categoryKey]) {
      categories[categoryKey] = {
        name: categoryKey,
        label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        icon: categoryIcons[categoryKey] || RulerIcon,
        units: []
      };
    }
    categories[categoryKey].units.push(unit);
  });
  
  return Object.values(categories).sort((a, b) => a.label.localeCompare(b.label));
});

// Methods
const toggleNode = (nodeId) => {
  const index = expandedNodes.value.indexOf(nodeId);
  if (index === -1) {
    expandedNodes.value.push(nodeId);
  } else {
    expandedNodes.value.splice(index, 1);
  }
};

const toggleCategory = (categoryName) => {
  const index = expandedCategories.value.indexOf(categoryName);
  if (index === -1) {
    expandedCategories.value.push(categoryName);
  } else {
    expandedCategories.value.splice(index, 1);
  }
};

// Initialize: expand all base units by default
watch(() => props.units, (newUnits) => {
  if (newUnits.length > 0 && expandedNodes.value.length === 0) {
    expandedNodes.value = newUnits
      .filter(unit => unit.baseUnit)
      .map(unit => unit.id);
  }
}, { immediate: true });
</script>
