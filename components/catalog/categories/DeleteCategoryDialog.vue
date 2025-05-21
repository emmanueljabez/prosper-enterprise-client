<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Delete Category</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to delete this category?
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-4">
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Deleting this category may affect products assigned to it.
        </AlertDescription>
      </Alert>

      <div class="rounded-md border p-4 space-y-3">
        <div>
          <span class="text-sm font-medium text-muted-foreground">Category:</span>
          <p class="text-lg font-medium">{{ category.name }}</p>
        </div>
        
        <div v-if="category.description">
          <span class="text-sm font-medium text-muted-foreground">Description:</span>
          <p>{{ category.description }}</p>
        </div>
        
        <div v-if="childCategories && childCategories.length > 0">
          <span class="text-sm font-medium text-destructive">Child Categories:</span>
          <p class="mt-1">
            This category has {{ childCategories.length }} child 
            {{ childCategories.length === 1 ? 'category' : 'categories' }} 
            that will be affected:
          </p>
          <div class="mt-1 flex flex-wrap gap-2">
            <Badge 
              v-for="child in childCategories" 
              :key="child.id" 
              variant="outline"
              class="py-1"
            >
              {{ child.name }}
            </Badge>
          </div>
        </div>
        
        <div v-if="productCount && productCount > 0">
          <span class="text-sm font-medium text-destructive">Products:</span>
          <p class="mt-1">
            This category has {{ productCount }} {{ productCount === 1 ? 'product' : 'products' }}
            that will be affected.
          </p>
        </div>
      </div>

      <div v-if="childCategories && childCategories.length > 0" class="space-y-3">
        <div class="text-sm font-medium">How should child categories be handled?</div>
        <RadioGroup v-model="childCategoryHandling" class="space-y-2">
          <div class="flex items-start space-x-2">
            <RadioGroupItem value="move" id="move" />
            <div>
              <Label class="font-medium" for="move">
                Move child categories to parent
              </Label>
              <p class="text-sm text-muted-foreground">
                All child categories will be moved to this category's parent (or to root level if no parent)
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-2">
            <RadioGroupItem value="delete" id="delete" />
            <div>
              <Label class="font-medium text-destructive" for="delete">
                Delete child categories
              </Label>
              <p class="text-sm text-muted-foreground">
                All child categories will be permanently deleted
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div v-if="productCount && productCount > 0" class="space-y-3">
        <div class="text-sm font-medium">How should products be handled?</div>
        <RadioGroup v-model="productHandling" class="space-y-2">
          <div class="flex items-start space-x-2">
            <RadioGroupItem value="move" id="move-products" />
            <div>
              <Label class="font-medium" for="move-products">
                Move products to parent category
              </Label>
              <p class="text-sm text-muted-foreground">
                All products will be moved to this category's parent (or to no category if no parent)
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-2">
            <RadioGroupItem value="uncategorized" id="uncategorized" />
            <div>
              <Label class="font-medium" for="uncategorized">
                Mark products as uncategorized
              </Label>
              <p class="text-sm text-muted-foreground">
                All products will no longer have a category assigned
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div class="mt-4">
        <div class="flex items-center space-x-2">
          <Checkbox id="confirm-delete" v-model:checked="confirmDelete" />
          <Label for="confirm-delete" class="text-sm">
            I understand that this action cannot be undone
          </Label>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isDeleting">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="deleteCategory"
        :disabled="isDeleting || !confirmDelete"
      >
        <Loader2 v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
        Delete Category
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loader2, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete', 'close'])

// State
const isDeleting = ref(false)
const confirmDelete = ref(false)
const childCategoryHandling = ref('move')
const productHandling = ref('move')

// Computed properties for related items
const childCategories = computed(() => {
  if (!props.categories) return []
  return props.categories.filter(c => c.parentId === props.category.id)
})

// This would normally come from the category data
const productCount = computed(() => {
  return props.category.productCount || 0
})

// Methods
const deleteCategory = async () => {
  if (!confirmDelete.value) return
  
  isDeleting.value = true
  
  try {
    // Prepare the delete options
    const deleteOptions = {
      childCategoryHandling: childCategoryHandling.value,
      productHandling: productHandling.value
    }
    
    // Emit the delete event with the category and options
    emit('delete', props.category, deleteOptions)
  } catch (error) {
    console.error('Error deleting category:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>