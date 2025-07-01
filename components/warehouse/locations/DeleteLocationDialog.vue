<template>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Location</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this location? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4">
      <div class="p-4 border rounded-md bg-muted/40 mb-4">
        <div class="flex items-start">
          <div class="mr-3 mt-0.5">
            <MapPinIcon class="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 class="font-medium text-base">{{ location.name }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ formatLocationType(location.type) }}
              {{ location.code ? `| Code: ${location.code}` : '' }}
            </p>
          </div>
        </div>
      </div>
      
      <AlertDescription class="text-destructive">
        <div class="flex items-start">
          <AlertTriangleIcon class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium">This will permanently delete the location and:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Remove all items assigned to this location</li>
              <li v-if="hasChildren">
                Delete {{ childCount }} sub-location{{ childCount === 1 ? '' : 's' }} within this location
              </li>
              <li>Remove all historical data associated with this location</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="confirmDelete" 
        :disabled="isDeleting"
      >
        <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
        {{ isDeleting ? 'Deleting...' : 'Delete Location' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  AlertTriangleIcon, Loader2Icon
} from 'lucide-vue-next';
import { MapPinIcon } from 'lucide-vue-next';
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDescription } from '@/components/ui/alert';

// Props
const props = defineProps({
  location: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['delete', 'close']);

// State
const isDeleting = ref(false);

// Computed
const hasChildren = computed(() => {
  return Array.isArray(props.location.children) && props.location.children.length > 0;
});

const childCount = computed(() => {
  return hasChildren.value ? props.location.children.length : 0;
});

// Methods
const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const confirmDelete = async () => {
  isDeleting.value = true;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    emit('delete', props.location);
  } catch (error) {
    console.error('Error deleting location:', error);
  } finally {
    isDeleting.value = false;
  }
};
</script>