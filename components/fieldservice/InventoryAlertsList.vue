<template>
  <div class="divide-y">
    <div v-for="item in items" :key="item.id" class="p-4">
      <div class="flex items-start justify-between">
        <div>
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-xs text-muted-foreground">{{ item.category }}</div>
        </div>
        <Badge v-if="item.stockLevel <= item.criticalLevel" class="bg-red-50 text-red-700">
          Critical
        </Badge>
        <Badge v-else-if="item.stockLevel <= item.minStockLevel" class="bg-amber-50 text-amber-700">
          Low Stock
        </Badge>
      </div>

      <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
        <div class="text-muted-foreground">Current Stock:</div>
        <div class="text-right font-medium">{{ item.stockLevel }}</div>
        <div class="text-muted-foreground">Minimum Level:</div>
        <div class="text-right">{{ item.minStockLevel }}</div>
        <div class="text-muted-foreground">Critical Level:</div>
        <div class="text-right">{{ item.criticalLevel }}</div>
        <div class="text-muted-foreground">Last Reorder:</div>
        <div class="text-right">{{ item.lastReordered ? formatDate(item.lastReordered) : 'Never' }}</div>
      </div>

      <div v-if="item.usageRate" class="mt-2 text-xs">
        <div class="text-muted-foreground">Usage Rate:</div>
        <div>{{ item.usageRate }} per week</div>
        <div class="text-muted-foreground mt-1">Estimated Depletion:</div>
        <div>{{ Math.floor(item.stockLevel / item.usageRate) }} weeks</div>
      </div>

      <div class="flex mt-3 justify-end">
        <Button variant="outline" size="sm" class="text-xs"
                :disabled="item.status === 'reordered'"
                @click="$emit('reorder', item)">
          <RefreshCcwIcon class="h-3 w-3 mr-1" />
          {{ item.status === 'reordered' ? 'Reorder Placed' : 'Reorder' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcwIcon } from 'lucide-vue-next';

defineProps({
  items: {
    type: Array,
    required: true
  }
});

defineEmits(['reorder']);

function formatDate(dateString) {
  return format(parseISO(dateString), 'MMM d, yyyy');
}
</script>