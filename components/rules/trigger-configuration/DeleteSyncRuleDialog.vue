<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Delete Sync Rule</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this sync rule? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4">
      <div class="space-y-4">
        <div class="bg-muted p-4 rounded-md">
          <h3 class="font-medium">{{ rule.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ rule.description || 'No description provided' }}</p>
          
          <div class="flex items-center gap-2 mt-2">
            <Badge variant="outline">{{ formatScope(rule.scope) }}</Badge>
            <Badge :variant="getTriggerBadgeVariant(rule.triggerType)">
              {{ formatTriggerType(rule.triggerType) }}
            </Badge>
            <Badge>{{ formatAction(rule.action) }}</Badge>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4 mr-2" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting this rule will immediately stop its synchronization functionality. Any items affected by this rule will no longer be automatically synchronized.
          </AlertDescription>
        </Alert>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting">
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        Delete Rule
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue';
import { AlertCircle, Loader2Icon } from 'lucide-vue-next';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const props = defineProps({
  rule: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['delete-confirmed', 'close']);
const isDeleting = ref(false);

function confirmDelete() {
  isDeleting.value = true;
  
  // Allow UI to update with loading state before emitting event
  setTimeout(() => {
    emit('delete-confirmed', props.rule);
    isDeleting.value = false;
  }, 500);
}

// Helper functions for formatting
function formatScope(scope) {
  switch (scope) {
    case 'global':
      return 'Global';
    case 'category':
      return 'Category';
    case 'product':
      return 'Product';
    case 'item':
      return 'Item';
    default:
      return scope;
  }
}

function formatTriggerType(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'Stock Change';
    case 'threshold':
      return 'Threshold';
    case 'scheduled':
      return 'Scheduled';
    case 'manual':
      return 'Manual';
    default:
      return triggerType;
  }
}

function formatAction(action) {
  switch (action) {
    case 'update_inventory':
      return 'Update Inventory';
    case 'notify_only':
      return 'Notify Only';
    case 'hide_product':
      return 'Hide Product';
    case 'show_product':
      return 'Show Product';
    case 'change_status':
      return 'Change Status';
    default:
      return action;
  }
}

function getTriggerBadgeVariant(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'default';
    case 'threshold':
      return 'warning';
    case 'scheduled':
      return 'info';
    case 'manual':
      return 'secondary';
    default:
      return 'outline';
  }
}
</script>