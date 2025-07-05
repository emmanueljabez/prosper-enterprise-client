<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <Scissors class="h-5 w-5" />
        Split Bill - Order #{{ order?.orderNumber }}
      </DialogTitle>
      <DialogDescription>
        Divide the bill between multiple customers or payment methods
      </DialogDescription>
    </DialogHeader>

    <!-- Split Options -->
    <div class="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        :class="{ 'border-primary bg-primary/10': splitMode === 'equal' }"
        @click="splitMode = 'equal'"
      >
        <Users class="mr-2 h-4 w-4" />
        Split Equally
      </Button>
      <Button
        variant="outline"
        :class="{ 'border-primary bg-primary/10': splitMode === 'custom' }"
        @click="splitMode = 'custom'"
      >
        <Calculator class="mr-2 h-4 w-4" />
        Custom Split
      </Button>
    </div>

    <!-- Equal Split -->
    <div v-if="splitMode === 'equal'" class="space-y-4">
      <div class="flex items-center gap-4">
        <Label>Number of people:</Label>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="numberOfPeople = Math.max(2, numberOfPeople - 1)"
          >
            <Minus class="h-3 w-3" />
          </Button>
          <span class="w-8 text-center">{{ numberOfPeople }}</span>
          <Button
            variant="outline"
            size="sm"
            @click="numberOfPeople = Math.min(10, numberOfPeople + 1)"
          >
            <Plus class="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(split, index) in equalSplits"
          :key="index"
          class="p-4 border rounded-lg"
        >
          <h4 class="font-medium mb-2">Person {{ index + 1 }}</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>${{ split.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax</span>
              <span>${{ split.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tip ({{ tipPercentage }}%)</span>
              <span>${{ split.tip.toFixed(2) }}</span>
            </div>
            <Separator />
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span>${{ split.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Split -->
    <div v-if="splitMode === 'custom'" class="space-y-4">
      <!-- Add Split Button -->
      <Button
        variant="outline"
        @click="addCustomSplit"
        class="w-full"
      >
        <Plus class="mr-2 h-4 w-4" />
        Add Split
      </Button>

      <!-- Custom Splits -->
      <div class="space-y-4">
        <div
          v-for="(split, index) in customSplits"
          :key="index"
          class="border rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium">Split {{ index + 1 }}</h4>
            <Button
              variant="ghost"
              size="sm"
              @click="removeCustomSplit(index)"
              :disabled="customSplits.length <= 1"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>

          <!-- Items Selection -->
          <div class="space-y-2 mb-3">
            <Label class="text-sm">Items:</Label>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center space-x-2"
              >
                <Checkbox
                  :id="`item-${index}-${item.id}`"
                  :checked="split.items.includes(item.id)"
                  @update:checked="toggleItemInSplit(index, item.id)"
                />
                <Label
                  :for="`item-${index}-${item.id}`"
                  class="text-sm flex-1 cursor-pointer"
                >
                  {{ item.name }} ({{ item.quantity }}x) - ${{ (item.price * item.quantity).toFixed(2) }}
                </Label>
              </div>
            </div>
          </div>

          <!-- Split Summary -->
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>${{ split.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax</span>
              <span>${{ split.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tip</span>
              <span>${{ split.tip.toFixed(2) }}</span>
            </div>
            <Separator class="my-1" />
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span>${{ split.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tip Settings -->
    <div class="space-y-3">
      <Label>Tip Percentage</Label>
      <div class="flex gap-2">
        <Button
          v-for="tip in [15, 18, 20, 25]"
          :key="tip"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': tipPercentage === tip }"
          @click="tipPercentage = tip"
        >
          {{ tip }}%
        </Button>
        <div class="flex items-center gap-2">
          <Input
            v-model.number="customTip"
            type="number"
            min="0"
            max="50"
            class="w-16"
            placeholder="Custom"
          />
          <Button
            variant="outline"
            size="sm"
            @click="tipPercentage = customTip"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>

    <!-- Split Summary -->
    <div class="border-t pt-4">
      <h3 class="font-medium mb-3">Split Summary</h3>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <p class="text-muted-foreground">Total Splits</p>
          <p class="font-bold text-lg">{{ activeSplits.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-muted-foreground">Total Amount</p>
          <p class="font-bold text-lg">${{ totalSplitAmount.toFixed(2) }}</p>
        </div>
        <div class="text-center">
          <p class="text-muted-foreground">Remaining</p>
          <p class="font-bold text-lg" :class="remainingAmount > 0 ? 'text-red-600' : 'text-green-600'">
            ${{ Math.abs(remainingAmount).toFixed(2) }}
          </p>
        </div>
      </div>
      
      <div v-if="remainingAmount !== 0" class="mt-3 p-3 rounded-lg" :class="remainingAmount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
        <div class="flex items-center gap-2">
          <AlertCircle class="h-4 w-4" />
          <span class="text-sm">
            {{ remainingAmount > 0 ? `$${remainingAmount.toFixed(2)} not allocated` : 'Split complete!' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline" @click="cancel">
        Cancel
      </Button>
      <Button
        :disabled="remainingAmount !== 0"
        @click="completeSplit"
      >
        <CreditCard class="mr-2 h-4 w-4" />
        Process Split Payments
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Scissors,
  Users,
  Calculator,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  AlertCircle
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['split-complete', 'cancel'])

// State
const splitMode = ref('equal') // 'equal' or 'custom'
const numberOfPeople = ref(2)
const tipPercentage = ref(18)
const customTip = ref(18)
const customSplits = ref([
  { items: [], subtotal: 0, tax: 0, tip: 0, total: 0 }
])

// Computed
const orderTotal = computed(() => {
  const subtotal = props.order.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )
  const tax = subtotal * 0.08 // 8% tax
  const tip = (subtotal + tax) * (tipPercentage.value / 100)
  const total = subtotal + tax + tip
  
  return { subtotal, tax, tip, total }
})

const equalSplits = computed(() => {
  const splits = []
  const perPerson = {
    subtotal: orderTotal.value.subtotal / numberOfPeople.value,
    tax: orderTotal.value.tax / numberOfPeople.value,
    tip: orderTotal.value.tip / numberOfPeople.value
  }
  
  for (let i = 0; i < numberOfPeople.value; i++) {
    splits.push({
      ...perPerson,
      total: perPerson.subtotal + perPerson.tax + perPerson.tip
    })
  }
  
  return splits
})

const activeSplits = computed(() => {
  return splitMode.value === 'equal' ? equalSplits.value : customSplits.value
})

const totalSplitAmount = computed(() => {
  return activeSplits.value.reduce((sum, split) => sum + split.total, 0)
})

const remainingAmount = computed(() => {
  return orderTotal.value.total - totalSplitAmount.value
})

// Methods
const addCustomSplit = () => {
  customSplits.value.push({
    items: [],
    subtotal: 0,
    tax: 0,
    tip: 0,
    total: 0
  })
}

const removeCustomSplit = (index) => {
  if (customSplits.value.length > 1) {
    customSplits.value.splice(index, 1)
  }
}

const toggleItemInSplit = (splitIndex, itemId) => {
  const split = customSplits.value[splitIndex]
  const itemIndex = split.items.indexOf(itemId)
  
  if (itemIndex > -1) {
    split.items.splice(itemIndex, 1)
  } else {
    // Remove item from other splits first
    customSplits.value.forEach((otherSplit, index) => {
      if (index !== splitIndex) {
        const otherItemIndex = otherSplit.items.indexOf(itemId)
        if (otherItemIndex > -1) {
          otherSplit.items.splice(otherItemIndex, 1)
        }
      }
    })
    split.items.push(itemId)
  }
  
  // Recalculate split totals
  recalculateCustomSplits()
}

const recalculateCustomSplits = () => {
  customSplits.value.forEach(split => {
    split.subtotal = split.items.reduce((sum, itemId) => {
      const item = props.order.items.find(i => i.id === itemId)
      return sum + (item ? item.price * item.quantity : 0)
    }, 0)
    
    split.tax = split.subtotal * 0.08
    split.tip = (split.subtotal + split.tax) * (tipPercentage.value / 100)
    split.total = split.subtotal + split.tax + split.tip
  })
}

const completeSplit = () => {
  const splitData = {
    orderNumber: props.order.orderNumber,
    originalTotal: orderTotal.value.total,
    splits: activeSplits.value.map((split, index) => ({
      splitNumber: index + 1,
      amount: split.total,
      items: splitMode.value === 'custom' ? split.items : 'equal-share'
    })),
    splitMode: splitMode.value,
    tipPercentage: tipPercentage.value,
    timestamp: new Date().toISOString()
  }
  
  emit('split-complete', splitData)
  
  toast({
    title: 'Bill split created',
    description: `Order split into ${activeSplits.value.length} payments`
  })
}

const cancel = () => {
  emit('cancel')
}

// Watch for tip percentage changes
watch(() => tipPercentage.value, () => {
  if (splitMode.value === 'custom') {
    recalculateCustomSplits()
  }
})
</script>

<style scoped>
/* Custom styles for bill splitting dialog */
</style>
