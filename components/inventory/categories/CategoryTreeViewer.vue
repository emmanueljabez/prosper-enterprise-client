<template>
  <div class="category-tree">
    <div 
      class="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-muted/50"
      :class="{
        'bg-primary/10 border border-primary/20': isCurrentCategory,
        'text-muted-foreground': !category.isActive
      }"
      @click="$emit('category-click', category)"
    >
      <FolderIcon 
        class="h-4 w-4 flex-shrink-0"
        :class="isCurrentCategory ? 'text-primary' : 'text-muted-foreground'"
      />
      <span class="font-medium">{{ category.name }}</span>
      <Badge v-if="isCurrentCategory" variant="default" class="text-xs">Current</Badge>
      <Badge v-if="!category.isActive" variant="secondary" class="text-xs">Inactive</Badge>
    </div>
    
    <div v-if="category.subCategories?.length > 0" class="ml-6 mt-2 space-y-1">
      <CategoryTreeViewer
        v-for="subCategory in category.subCategories"
        :key="subCategory.id"
        :category="subCategory"
        :current-category-id="currentCategoryId"
        @category-click="$emit('category-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FolderIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'

// Props
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  currentCategoryId: {
    type: Number,
    default: null
  }
})

// Emits
defineEmits(['category-click'])

// Computed
const isCurrentCategory = computed(() => {
  return props.category.id === props.currentCategoryId
})
</script>
