<template>
  <div class="border rounded-lg mb-3">
    <!-- Base Unit (Family Root) -->
    <div 
      class="p-4 bg-primary/5 cursor-pointer flex items-center justify-between hover:bg-primary/10 transition-colors"
      @click="toggleFamily"
    >
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <ChevronRightIcon 
            class="h-4 w-4 transition-transform text-muted-foreground"
            :class="{ 'rotate-90': isExpanded }"
          />
          <component :is="getCategoryIcon(family.category)" class="h-5 w-5 text-primary" />
        </div>
        <div class="flex items-center space-x-3">
          <Badge variant="default" class="text-xs font-medium">Base Unit</Badge>
          <div>
            <div class="font-semibold">{{ family.baseUnit.name }}</div>
            <div class="text-sm text-muted-foreground">{{ family.baseUnit.code }} • {{ family.category }}</div>
          </div>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ family.conversionUnits.length }} conversion unit{{ family.conversionUnits.length !== 1 ? 's' : '' }}
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Badge :variant="family.baseUnit.isActive ? 'success' : 'secondary'" class="text-xs">
          {{ family.baseUnit.isActive ? 'Active' : 'Inactive' }}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" @click.stop>
              <MoreHorizontalIcon class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('view-unit', family.baseUnit)">
              <EyeIcon class="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('edit-unit', family.baseUnit)">
              <PencilIcon class="h-4 w-4 mr-2" />
              Edit Base Unit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="$emit('convert-units', family.baseUnit)">
              <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
              Convert Units
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('duplicate-unit', family.baseUnit)">
              <CopyIcon class="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="$emit('delete-unit', family.baseUnit)"
              class="text-destructive"
              :disabled="family.conversionUnits.length > 0"
            >
              <TrashIcon class="h-4 w-4 mr-2" />
              Delete Base Unit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Conversion Units (Children) -->
    <div v-if="isExpanded && family.conversionUnits.length > 0" class="border-t">
      <div class="p-2 space-y-1">
        <div 
          v-for="unit in family.conversionUnits" 
          :key="unit.id"
          class="flex items-center justify-between p-3 ml-6 border rounded-md hover:bg-muted/30 cursor-pointer transition-colors"
          @click="$emit('view-unit', unit)"
        >
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 mb-2"></div>
            <Badge variant="secondary" class="text-xs">Conversion</Badge>
            <div>
              <div class="font-medium">{{ unit.name }}</div>
              <div class="text-sm text-muted-foreground">{{ unit.code }}</div>
            </div>            <div class="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              1 {{ unit.code }} = {{ unit.conversionFactor }} {{ family.baseUnit.code }}
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
                  Edit Unit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="$emit('convert-units', unit)">
                  <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
                  Convert Units
                </DropdownMenuItem>
                <DropdownMenuItem @click="$emit('duplicate-unit', unit)">
                  <CopyIcon class="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  @click="$emit('delete-unit', unit)"
                  class="text-destructive"
                >
                  <TrashIcon class="h-4 w-4 mr-2" />
                  Delete Unit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State for Family with No Conversions -->
    <div v-else-if="isExpanded && family.conversionUnits.length === 0" class="border-t p-4 text-center text-muted-foreground">
      <div class="flex flex-col items-center space-y-2">
        <PlusIcon class="h-8 w-8 opacity-50" />
        <p class="text-sm">No conversion units in this family</p>
        <Button variant="outline" size="sm" @click="$emit('create-conversion', family.baseUnit)">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Conversion Unit
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  ChevronRightIcon, MoreHorizontalIcon, EyeIcon, PencilIcon,
  TrashIcon, ArrowRightLeftIcon, CopyIcon, PlusIcon,
  RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon,
  ThermometerIcon, ZapIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const props = defineProps({
  family: {
    type: Object,
    required: true
  },
  expandedNodes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'toggle-node',
  'view-unit',
  'edit-unit',
  'delete-unit',
  'convert-units',
  'duplicate-unit',
  'create-conversion'
]);

// Computed properties
const isExpanded = computed(() => {
  return props.expandedNodes.includes(props.family.baseUnit.id);
});

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

// Methods
const toggleFamily = () => {
  emit('toggle-node', props.family.baseUnit.id);
};

const getCategoryIcon = (category) => {
  return categoryIcons[category] || RulerIcon;
};
</script>
