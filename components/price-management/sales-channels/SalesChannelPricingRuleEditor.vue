<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold">{{ isEditMode ? 'Edit Pricing Rule' : 'Create Pricing Rule' }}</h3>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </Button>
    </div>

    <Separator />

    <!-- Rule Editor Form -->
    <form @submit.prevent="saveRule" class="space-y-6">
      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the basic details of your pricing rule</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="rule-name">Rule Name <span class="text-destructive">*</span></Label>
            <Input 
              id="rule-name" 
              v-model="form.name" 
              placeholder="e.g. Summer Sale Discount" 
              :disabled="isSubmitting"
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
            <p v-else class="text-xs text-muted-foreground">
              A descriptive name to easily identify this rule
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="rule-description">Description</Label>
            <Textarea 
              id="rule-description" 
              v-model="form.description" 
              placeholder="Describe the purpose of this rule" 
              :disabled="isSubmitting"
              rows="3"
            />
            <p class="text-xs text-muted-foreground">
              Optional description to explain the purpose or conditions of this rule
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="rule-type">Rule Type <span class="text-destructive">*</span></Label>
              <Select 
                v-model="form.type" 
                :disabled="isSubmitting || (isEditMode && !allowTypeChange)"
              >
                <SelectTrigger id="rule-type" :class="{ 'border-destructive': errors.type }">
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Discount Types</SelectLabel>
                    <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                    <SelectItem value="fixed_amount_discount">Fixed Amount Discount</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Specific Pricing</SelectLabel>
                    <SelectItem value="customer_group_pricing">Customer Group Pricing</SelectItem>
                    <SelectItem value="category_pricing">Category Pricing</SelectItem>
                    <SelectItem value="product_pricing">Product Pricing</SelectItem>
                    <SelectItem value="volume_pricing">Volume Pricing</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p v-if="errors.type" class="text-xs text-destructive">{{ errors.type }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="rule-priority">Priority</Label>
              <Input 
                id="rule-priority" 
                type="number" 
                v-model="form.priority" 
                placeholder="1" 
                :disabled="isSubmitting"
                min="0"
                step="1"
              />
              <p class="text-xs text-muted-foreground">
                Higher values have higher priority when multiple rules apply
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Rule Configuration -->
      <Card>
        <CardHeader>
          <CardTitle>Rule Configuration</CardTitle>
          <CardDescription>Configure how this rule affects pricing</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Adjustment Configuration -->
          <div 
            v-if="['percentage_discount', 'fixed_amount_discount', 'customer_group_pricing', 'category_pricing', 'volume_pricing'].includes(form.type)"
            class="space-y-2"
          >
            <Label for="rule-adjustment">
              {{ getAdjustmentLabel() }} <span class="text-destructive">*</span>
            </Label>
            <div class="relative">
              <div v-if="form.type === 'fixed_amount_discount'" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span class="text-muted-foreground">$</span>
              </div>
              <Input 
                id="rule-adjustment" 
                type="number" 
                v-model="form.adjustment" 
                :placeholder="getAdjustmentPlaceholder()" 
                :disabled="isSubmitting"
                :class="{'pl-7': form.type === 'fixed_amount_discount', 'border-destructive': errors.adjustment}"
                step="0.01"
                min="0"
              />
              <div v-if="['percentage_discount', 'customer_group_pricing', 'category_pricing', 'volume_pricing'].includes(form.type)" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span class="text-muted-foreground">%</span>
              </div>
            </div>
            <p v-if="errors.adjustment" class="text-xs text-destructive">{{ errors.adjustment }}</p>
            <p v-else class="text-xs text-muted-foreground">
              {{ getAdjustmentHelpText() }}
            </p>
            
            <div v-if="form.type === 'percentage_discount' || form.type === 'fixed_amount_discount'" class="space-y-2 mt-4">
              <Label for="max-discount">Maximum Discount (Optional)</Label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-muted-foreground">$</span>
                </div>
                <Input 
                  id="max-discount" 
                  type="number" 
                  v-model="form.maxDiscount" 
                  placeholder="0.00" 
                  :disabled="isSubmitting"
                  class="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
              <p class="text-xs text-muted-foreground">
                Optional limit on the maximum discount amount that can be applied
              </p>
            </div>
          </div>
          
          <!-- Buy X Get Y Configuration -->
          <div v-if="form.type === 'buy_x_get_y'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buy-quantity">Buy Quantity <span class="text-destructive">*</span></Label>
                <Input 
                  id="buy-quantity" 
                  type="number" 
                  v-model="form.conditions.buyQuantity" 
                  placeholder="1" 
                  :disabled="isSubmitting"
                  :class="{ 'border-destructive': errors.buyQuantity }"
                  min="1"
                  step="1"
                />
                <p v-if="errors.buyQuantity" class="text-xs text-destructive">{{ errors.buyQuantity }}</p>
              </div>
              
              <div class="space-y-2">
                <Label for="get-quantity">Get Quantity <span class="text-destructive">*</span></Label>
                <Input 
                  id="get-quantity" 
                  type="number" 
                  v-model="form.conditions.getQuantity" 
                  placeholder="1" 
                  :disabled="isSubmitting"
                  :class="{ 'border-destructive': errors.getQuantity }"
                  min="1"
                  step="1"
                />
                <p v-if="errors.getQuantity" class="text-xs text-destructive">{{ errors.getQuantity }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="get-discount">Discount on "Get" Items <span class="text-destructive">*</span></Label>
              <div class="relative">
                <Input 
                  id="get-discount" 
                  type="number" 
                  v-model="form.conditions.getDiscount" 
                  placeholder="100" 
                  :disabled="isSubmitting"
                  :class="{ 'border-destructive': errors.getDiscount }"
                  min="0"
                  max="100"
                  step="1"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-muted-foreground">%</span>
                </div>
              </div>
              <p v-if="errors.getDiscount" class="text-xs text-destructive">{{ errors.getDiscount }}</p>
              <p v-else class="text-xs text-muted-foreground">
                Example: 100% = free items, 50% = half price
              </p>
            </div>
          </div>
          
          <!-- Product Pricing Configuration -->
          <div v-if="form.type === 'product_pricing'" class="space-y-2">
            <Label for="product-price">Product Price <span class="text-destructive">*</span></Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span class="text-muted-foreground">$</span>
              </div>
              <Input 
                id="product-price" 
                type="number" 
                v-model="form.adjustment" 
                placeholder="0.00" 
                :disabled="isSubmitting"
                class="pl-7"
                :class="{ 'border-destructive': errors.adjustment }"
                step="0.01"
                min="0"
              />
            </div>
            <p v-if="errors.adjustment" class="text-xs text-destructive">{{ errors.adjustment }}</p>
            <p v-else class="text-xs text-muted-foreground">
              The override price for the selected product
            </p>
          </div>
          
          <!-- Volume Pricing Additional Fields -->
          <div v-if="form.type === 'volume_pricing'" class="space-y-2">
            <Label for="min-quantity">Minimum Quantity <span class="text-destructive">*</span></Label>
            <Input 
              id="min-quantity" 
              type="number" 
              v-model="form.conditions.minQuantity" 
              placeholder="1" 
              :disabled="isSubmitting"
              :class="{ 'border-destructive': errors.minQuantity }"
              min="1"
              step="1"
            />
            <p v-if="errors.minQuantity" class="text-xs text-destructive">{{ errors.minQuantity }}</p>
            <p v-else class="text-xs text-muted-foreground">
              The minimum quantity required to activate this discount
            </p>
          </div>
        </CardContent>
      </Card>
      
      <!-- Rule Conditions -->
      <Card>
        <CardHeader>
          <CardTitle>Rule Conditions</CardTitle>
          <CardDescription>Define when this rule should be applied</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Type-specific Conditions -->
          <div v-if="form.type === 'customer_group_pricing'" class="space-y-2">
            <Label for="customer-group">Customer Group <span class="text-destructive">*</span></Label>
            <Select 
              v-model="form.conditions.customerGroupId" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="customer-group" :class="{ 'border-destructive': errors.customerGroupId }">
                <SelectValue placeholder="Select customer group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="group in customerGroups" 
                  :key="group.id" 
                  :value="group.id"
                >
                  {{ group.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.customerGroupId" class="text-xs text-destructive">{{ errors.customerGroupId }}</p>
          </div>
          
          <div v-if="form.type === 'category_pricing'" class="space-y-2">
            <Label for="category">Category <span class="text-destructive">*</span></Label>
            <Select 
              v-model="form.conditions.categoryId" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="category" :class="{ 'border-destructive': errors.categoryId }">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.categoryId" class="text-xs text-destructive">{{ errors.categoryId }}</p>
          </div>
          
          <div v-if="form.type === 'product_pricing' || form.type === 'buy_x_get_y'" class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="products">Products <span class="text-destructive">*</span></Label>
              <div v-if="form.type === 'buy_x_get_y'" class="flex items-center space-x-2">
                <Switch id="same-product" v-model="form.conditions.sameProduct" :disabled="isSubmitting" />
                <Label for="same-product" class="text-sm">Apply to same product only</Label>
              </div>
            </div>
            
            <div v-if="form.type === 'product_pricing'">
              <Select 
                v-model="form.conditions.productId" 
                :disabled="isSubmitting"
              >
                <SelectTrigger id="product-single" :class="{ 'border-destructive': errors.productId }">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="product in products" 
                    :key="product.id" 
                    :value="product.id"
                  >
                    {{ product.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.productId" class="text-xs text-destructive">{{ errors.productId }}</p>
            </div>
            
            <div v-else-if="form.type === 'buy_x_get_y' && !form.conditions.sameProduct" class="space-y-2">
              <div class="border rounded-md p-3 space-y-3">
                <div class="space-y-2">
                  <Label for="buy-products">Buy Products</Label>
                  <Multiselect
                    id="buy-products"
                    v-model="form.conditions.buyProducts"
                    :options="productsOptions"
                    :multiple="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :preserve-search="true"
                    placeholder="Select products for 'buy' condition"
                    label="label"
                    track-by="value"
                    :disabled="isSubmitting"
                    :class="{ 'multiselect-error': errors.buyProducts }"
                  ></Multiselect>
                  <p v-if="errors.buyProducts" class="text-xs text-destructive">{{ errors.buyProducts }}</p>
                </div>
                
                <div class="space-y-2">
                  <Label for="get-products">Get Products</Label>
                  <Multiselect
                    id="get-products"
                    v-model="form.conditions.getProducts"
                    :options="productsOptions"
                    :multiple="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :preserve-search="true"
                    placeholder="Select products for 'get' condition"
                    label="label"
                    track-by="value"
                    :disabled="isSubmitting"
                    :class="{ 'multiselect-error': errors.getProducts }"
                  ></Multiselect>
                  <p v-if="errors.getProducts" class="text-xs text-destructive">{{ errors.getProducts }}</p>
                </div>
              </div>
            </div>
            
            <div v-else-if="form.type === 'buy_x_get_y' && form.conditions.sameProduct">
              <Select 
                v-model="form.conditions.productId" 
                :disabled="isSubmitting"
              >
                <SelectTrigger id="product-same" :class="{ 'border-destructive': errors.productId }">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="product in products" 
                    :key="product.id" 
                    :value="product.id"
                  >
                    {{ product.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.productId" class="text-xs text-destructive">{{ errors.productId }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                This discount will apply when buying multiple units of this product
              </p>
            </div>
          </div>
          
          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <Label for="start-date">Start Date <span class="text-destructive">*</span></Label>
              <Input 
                id="start-date" 
                type="date" 
                v-model="form.startDate" 
                :disabled="isSubmitting"
                :class="{ 'border-destructive': errors.startDate }"
              />
              <p v-if="errors.startDate" class="text-xs text-destructive">{{ errors.startDate }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="end-date">End Date</Label>
              <Input 
                id="end-date" 
                type="date" 
                v-model="form.endDate" 
                :disabled="isSubmitting"
              />
              <p class="text-xs text-muted-foreground">
                Leave empty for no end date
              </p>
            </div>
          </div>
          
          <!-- Additional Conditions -->
          <div class="space-y-2 mt-2">
            <div class="flex items-center justify-between">
              <Label>Additional Conditions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addCondition"
                :disabled="isSubmitting"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
            
            <div v-if="form.additionalConditions.length === 0" class="border rounded-md p-4 text-center">
              <p class="text-sm text-muted-foreground">No additional conditions</p>
              <p class="text-xs text-muted-foreground mt-1">
                Add conditions to further restrict when this rule applies
              </p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="(condition, index) in form.additionalConditions" 
                :key="index"
                class="border rounded-md p-3"
              >
                <div class="flex justify-between items-start mb-3">
                  <Label class="text-sm">Condition {{ index + 1 }}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="removeCondition(index)"
                    :disabled="isSubmitting"
                  >
                    <XIcon class="h-4 w-4" />
                    <span class="sr-only">Remove</span>
                  </Button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label :for="`condition-type-${index}`">Type</Label>
                    <Select 
                      v-model="condition.type" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`condition-type-${index}`">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="min_order_amount">Minimum Order Amount</SelectItem>
                        <SelectItem value="max_order_amount">Maximum Order Amount</SelectItem>
                        <SelectItem value="min_items_count">Minimum Items Count</SelectItem>
                        <SelectItem value="customer_tag">Customer Tag</SelectItem>
                        <SelectItem value="shipping_country">Shipping Country</SelectItem>
                        <SelectItem value="payment_method">Payment Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2 md:col-span-2">
                    <Label :for="`condition-value-${index}`">Value</Label>
                    
                    <!-- Different inputs based on condition type -->
                    <div v-if="['min_order_amount', 'max_order_amount'].includes(condition.type)" class="relative">
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span class="text-muted-foreground">$</span>
                      </div>
                      <Input 
                        :id="`condition-value-${index}`" 
                        type="number" 
                        v-model="condition.value" 
                        placeholder="0.00" 
                        :disabled="isSubmitting"
                        class="pl-7"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <Input 
                      v-else-if="condition.type === 'min_items_count'"
                      :id="`condition-value-${index}`" 
                      type="number" 
                      v-model="condition.value" 
                      placeholder="1" 
                      :disabled="isSubmitting"
                      min="1"
                      step="1"
                    />
                    
                    <Input 
                      v-else-if="condition.type === 'customer_tag'"
                      :id="`condition-value-${index}`" 
                      type="text" 
                      v-model="condition.value" 
                      placeholder="Enter tag" 
                      :disabled="isSubmitting"
                    />
                    
                    <Select 
                      v-else-if="condition.type === 'shipping_country'"
                      v-model="condition.value" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`condition-value-${index}`">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <!-- Add more countries as needed -->
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      v-else-if="condition.type === 'payment_method'"
                      v-model="condition.value" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`condition-value-${index}`">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      v-else
                      :id="`condition-value-${index}`" 
                      type="text" 
                      v-model="condition.value" 
                      placeholder="Enter value" 
                      :disabled="isSubmitting"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- Activation Settings -->
      <Card>
        <CardHeader>
          <CardTitle>Activation Settings</CardTitle>
          <CardDescription>Control when this rule is active</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-2">
            <Switch id="rule-active" v-model="form.active" :disabled="isSubmitting" />
            <Label for="rule-active">Active</Label>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            When disabled, this rule will not be applied even if all conditions are met
          </p>
        </CardContent>
      </Card>
      
      <!-- Action Buttons -->
      <div class="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('close')" 
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <div class="space-x-2">
          <Button 
            v-if="isEditMode"
            type="button" 
            variant="outline"
            @click="confirmDeleteRule" 
            :disabled="isSubmitting"
          >
            <TrashIcon class="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button 
            type="submit" 
            :disabled="isSubmitting || !isFormValid"
          >
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            {{ isEditMode ? 'Update Rule' : 'Create Rule' }}
          </Button>
        </div>
      </div>
    </form>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteConfirmation">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pricing Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this pricing rule? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4">
          <div class="font-medium">{{ form.name }}</div>
          <div class="text-sm text-muted-foreground">{{ formatRuleType(form.type) }}</div>
          
          <Alert variant="destructive" class="mt-4">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Deleting this rule will immediately affect pricing for the applicable products.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showDeleteConfirmation = false" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            @click="deleteRule" 
            :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            Delete Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  AlertCircleIcon,
  Loader2Icon,
  PlusIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import Multiselect from 'vue-multiselect'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'

import 'vue-multiselect/dist/vue-multiselect.css'

const props = defineProps({
  rule: {
    type: Object,
    default: null
  },
  salesChannelId: {
    type: String,
    required: true
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  allowTypeChange: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['create-rule', 'update-rule', 'delete-rule', 'close'])
const { toast } = useToast()

// State
const isSubmitting = ref(false)
const showDeleteConfirmation = ref(false)
const errors = ref({})

// Default form state
const defaultForm = {
  name: '',
  description: '',
  type: 'percentage_discount',
  adjustment: 0,
  maxDiscount: null,
  conditions: {
    customerGroupId: '',
    categoryId: '',
    productId: '',
    minQuantity: 1,
    buyQuantity: 1,
    getQuantity: 1,
    getDiscount: 100,
    sameProduct: true,
    buyProducts: [],
    getProducts: []
  },
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  priority: 0,
  active: true,
  additionalConditions: []
}

// Initialize form with default values or existing rule data
const form = ref(structuredClone(defaultForm))

// Computed properties
const isEditMode = computed(() => !!props.rule)

const isFormValid = computed(() => {
  errors.value = {} // Reset errors
  
  // Basic validations
  if (!form.value.name) {
    errors.value.name = 'Rule name is required'
  }
  
  if (!form.value.type) {
    errors.value.type = 'Rule type is required'
  }
  
  if (!form.value.startDate) {
    errors.value.startDate = 'Start date is required'
  }
  
  // Type-specific validations
  if (['percentage_discount', 'fixed_amount_discount', 'customer_group_pricing', 'category_pricing', 'volume_pricing', 'product_pricing'].includes(form.value.type)) {
    if (form.value.adjustment === undefined || form.value.adjustment === null || form.value.adjustment === '') {
      errors.value.adjustment = 'Adjustment value is required'
    }
  }
  
  if (form.value.type === 'customer_group_pricing' && !form.value.conditions.customerGroupId) {
    errors.value.customerGroupId = 'Customer group is required'
  }
  
  if (form.value.type === 'category_pricing' && !form.value.conditions.categoryId) {
    errors.value.categoryId = 'Category is required'
  }
  
  if ((form.value.type === 'product_pricing' || (form.value.type === 'buy_x_get_y' && form.value.conditions.sameProduct)) && !form.value.conditions.productId) {
    errors.value.productId = 'Product is required'
  }
  
  if (form.value.type === 'volume_pricing' && (!form.value.conditions.minQuantity || form.value.conditions.minQuantity < 1)) {
    errors.value.minQuantity = 'Minimum quantity must be at least 1'
  }
  
  if (form.value.type === 'buy_x_get_y') {
    if (!form.value.conditions.buyQuantity || form.value.conditions.buyQuantity < 1) {
      errors.value.buyQuantity = 'Buy quantity must be at least 1'
    }
    
    if (!form.value.conditions.getQuantity || form.value.conditions.getQuantity < 1) {
      errors.value.getQuantity = 'Get quantity must be at least 1'
    }
    
    if (form.value.conditions.getDiscount === undefined || form.value.conditions.getDiscount === null || form.value.conditions.getDiscount === '') {
      errors.value.getDiscount = 'Discount percentage is required'
    }
    
    if (!form.value.conditions.sameProduct) {
      if (!form.value.conditions.buyProducts || form.value.conditions.buyProducts.length === 0) {
        errors.value.buyProducts = 'At least one product must be selected'
      }
      
      if (!form.value.conditions.getProducts || form.value.conditions.getProducts.length === 0) {
        errors.value.getProducts = 'At least one product must be selected'
      }
    }
  }
  
  return Object.keys(errors.value).length === 0
})

const productsOptions = computed(() => {
  return props.products.map(product => ({
    label: product.name,
    value: product.id
  }))
})

// Initialize form with rule data if available
if (props.rule) {
  // Deep copy rule to form
  form.value = structuredClone({
    ...defaultForm,
    ...props.rule,
    conditions: {
      ...defaultForm.conditions,
      ...(props.rule.conditions || {})
    },
    additionalConditions: [...(props.rule.additionalConditions || [])]
  })
}

// Helper functions
function formatRuleType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'percentage_discount': 'Percentage Discount',
    'fixed_amount_discount': 'Fixed Amount Discount',
    'customer_group_pricing': 'Customer Group',
    'category_pricing': 'Category',
    'product_pricing': 'Product',
    'volume_pricing': 'Volume',
    'buy_x_get_y': 'Buy X Get Y'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getAdjustmentLabel() {
  switch (form.value.type) {
    case 'percentage_discount':
      return 'Discount Percentage'
    case 'fixed_amount_discount':
      return 'Discount Amount'
    case 'customer_group_pricing':
      return 'Price Adjustment'
    case 'category_pricing':
      return 'Category Adjustment'
    case 'product_pricing':
      return 'Product Price'
    case 'volume_pricing':
      return 'Volume Discount'
    default:
      return 'Adjustment'
  }
}

function getAdjustmentPlaceholder() {
  switch (form.value.type) {
    case 'percentage_discount':
    case 'customer_group_pricing':
    case 'category_pricing':
    case 'volume_pricing':
      return '0'
    case 'fixed_amount_discount':
    case 'product_pricing':
      return '0.00'
    default:
      return '0'
  }
}

function getAdjustmentHelpText() {
  switch (form.value.type) {
    case 'percentage_discount':
      return 'The percentage discount to apply (e.g., 10 for 10% off)'
    case 'fixed_amount_discount':
      return 'The fixed amount to discount (e.g., 5.00 for $5 off)'
    case 'customer_group_pricing':
      return 'Percentage adjustment for the selected customer group'
    case 'category_pricing':
      return 'Percentage adjustment for products in the selected category'
    case 'product_pricing':
      return 'The specific price for the selected product'
    case 'volume_pricing':
      return 'Percentage discount when buying at least the minimum quantity'
    default:
      return 'Adjustment value for this rule'
  }
}

// Action functions
function addCondition() {
  form.value.additionalConditions.push({
    type: 'min_order_amount',
    value: ''
  })
}

function removeCondition(index) {
  form.value.additionalConditions.splice(index, 1)
}

function confirmDeleteRule() {
  showDeleteConfirmation.value = true
}

async function saveRule() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    const formData = {
      ...form.value,
      salesChannelId: props.salesChannelId,
      updatedAt: new Date().toISOString()
    }
    
    if (isEditMode.value) {
      emit('update-rule', formData)
      
      toast({
        title: 'Rule updated',
        description: `"${formData.name}" has been updated successfully`,
        variant: 'success'
      })
    } else {
      formData.id = `rule_${Date.now()}`
      formData.createdAt = new Date().toISOString()
      emit('create-rule', formData)
      
      toast({
        title: 'Rule created',
        description: `"${formData.name}" has been created successfully`,
        variant: 'success'
      })
    }
    
    emit('close')
  } catch (error) {
    console.error('Error saving rule:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error saving the pricing rule',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteRule() {
  isSubmitting.value = true
  
  try {
    emit('delete-rule', props.rule)
    
    toast({
      title: 'Rule deleted',
      description: `"${props.rule.name}" has been deleted successfully`,
      variant: 'default'
    })
    
    showDeleteConfirmation.value = false
    emit('close')
  } catch (error) {
    console.error('Error deleting rule:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error deleting the pricing rule',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Reset appropriate form fields when rule type changes
watch(() => form.value.type, () => {
  // Reset condition-specific fields when changing rule type
  if (form.value.type !== 'customer_group_pricing') {
    form.value.conditions.customerGroupId = ''
  }
  
  if (form.value.type !== 'category_pricing') {
    form.value.conditions.categoryId = ''
  }
  
  if (form.value.type !== 'product_pricing' && form.value.type !== 'buy_x_get_y') {
    form.value.conditions.productId = ''
  }
  
  if (form.value.type !== 'volume_pricing') {
    form.value.conditions.minQuantity = 1
  }
  
  if (form.value.type !== 'buy_x_get_y') {
    form.value.conditions.buyQuantity = 1
    form.value.conditions.getQuantity = 1
    form.value.conditions.getDiscount = 100
    form.value.conditions.sameProduct = true
    form.value.conditions.buyProducts = []
    form.value.conditions.getProducts = []
  }
})
</script>

<style>
/* Add vue-multiselect custom styling to match your UI */
.multiselect {
  min-height: 40px;
  border-radius: 0.375rem;
}

.multiselect-error {
  --ms-border-color: hsl(var(--destructive));
  --ms-border-width: 1.5px;
}

.multiselect--disabled {
  opacity: 0.6;
}

.multiselect__tags {
  min-height: 40px;
  padding: 8px 40px 0 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  background: hsl(var(--background));
}

.multiselect__tag {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  margin-bottom: 4px;
}

.multiselect__tag-icon:after {
  color: hsl(var(--primary-foreground));
}

.multiselect__tag-icon:focus, 
.multiselect__tag-icon:hover {
  background: hsl(var(--primary) / 0.9);
}

.multiselect__placeholder {
  color: hsl(var(--muted-foreground));
  padding-top: 0;
  margin-bottom: 8px;
}

.multiselect__input, 
.multiselect__single {
  background: transparent;
  font-size: 0.875rem;
  margin-bottom: 5px;
}

.multiselect__content-wrapper {
  border-color: hsl(var(--border));
  background: hsl(var(--background));
  border-radius: 0 0 0.375rem 0.375rem;
}

.multiselect__option--highlight {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.multiselect__option--selected.multiselect__option--highlight {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
</style>