<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle class="flex items-center space-x-2">
        <div class="p-2 rounded-full bg-primary/10">
          <ShoppingBagIcon class="h-5 w-5 text-primary" v-if="salesChannel.type === 'online_store'" />
          <StoreIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'retail_store'" />
          <ShoppingCartIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'marketplace'" />
          <PackageIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'dropshipping'" />
          <Users2Icon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'wholesale'" />
          <PhoneIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'direct_sales'" />
          <GlobeIcon class="h-5 w-5 text-primary" v-else />
        </div>
        <span>{{ salesChannel.name }} Pricing</span>
      </SheetTitle>
      <SheetDescription>
        Configure pricing settings for this sales channel
      </SheetDescription>
    </SheetHeader>
    
    <form @submit.prevent="handleSubmit" class="space-y-6 py-6">
      <Tabs defaultValue="general" class="w-full">
        <TabsList class="grid grid-cols-4 w-full">
          <TabsTrigger value="general">
            <SettingsIcon class="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users2Icon class="h-4 w-4 mr-2" />
            Customer Groups
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FoldersIcon class="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="overrides">
            <TagsIcon class="h-4 w-4 mr-2" />
            Overrides
          </TabsTrigger>
        </TabsList>
        
        <!-- General Pricing Tab -->
        <TabsContent value="general" class="space-y-4">
          <div class="space-y-2">
            <Label for="pricing-strategy">Pricing Strategy</Label>
            <Select 
              v-model="form.pricingStrategy" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="pricing-strategy">
                <SelectValue placeholder="Select pricing strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              The pricing strategy determines how prices are calculated for this channel
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="markup-percentage">Markup Percentage (%)</Label>
            <div class="relative">
              <Input 
                id="markup-percentage" 
                type="number" 
                v-model="form.markupPercentage" 
                placeholder="0" 
                :disabled="isSubmitting"
                step="0.1"
                min="0"
                max="100"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span class="text-muted-foreground">%</span>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Additional percentage markup applied to all products in this channel
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="currency">Currency</Label>
              <Select 
                v-model="form.currency" 
                :disabled="isSubmitting"
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">
                Default currency for this sales channel
              </p>
            </div>
            
            <div class="space-y-2">
              <Label for="platform-fee">Platform Fee (%)</Label>
              <div class="relative">
                <Input 
                  id="platform-fee" 
                  type="number" 
                  v-model="form.platformFee" 
                  placeholder="0" 
                  :disabled="isSubmitting"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-muted-foreground">%</span>
                </div>
              </div>
              <p class="text-xs text-muted-foreground">
                Fee charged by the platform or marketplace
              </p>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="minimum-order">Minimum Order Amount</Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span class="text-muted-foreground">$</span>
              </div>
              <Input 
                id="minimum-order" 
                type="number" 
                v-model="form.minimumOrderAmount" 
                placeholder="0.00" 
                :disabled="isSubmitting"
                class="pl-7"
                step="0.01"
                min="0"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Minimum order value required for this channel
            </p>
          </div>
          
          <div class="flex items-center space-x-2">
            <Switch id="tax-inclusive" v-model="form.taxInclusivePricing" :disabled="isSubmitting" />
            <Label for="tax-inclusive">Tax Inclusive Pricing</Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Switch id="round-prices" v-model="form.roundPrices" :disabled="isSubmitting" />
            <Label for="round-prices">Round Prices to Nearest .99</Label>
          </div>
        </TabsContent>
        
        <!-- Customer Groups Tab -->
        <TabsContent value="groups" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Customer Group Pricing</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addCustomerGroupPricing"
              :disabled="isSubmitting || customerGroups.length === 0"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Group Pricing
            </Button>
          </div>
          
          <div v-if="customerGroups.length === 0" class="p-4 border rounded-md text-center">
            <Users2Icon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No customer groups available</p>
            <p class="text-xs text-muted-foreground mt-1">Create customer groups first to configure group-specific pricing</p>
          </div>
          
          <div v-else-if="form.customerGroupPricing.length === 0" class="p-4 border rounded-md text-center">
            <Users2Icon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No group pricing configured</p>
            <p class="text-xs text-muted-foreground mt-1">Add group-specific pricing rules for this channel</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addCustomerGroupPricing"
              class="mt-3"
              :disabled="isSubmitting"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Group Pricing
            </Button>
          </div>
          
          <div v-else class="space-y-3">
            <Card v-for="(groupPricing, index) in form.customerGroupPricing" :key="index" class="overflow-hidden">
              <CardHeader class="p-4 pb-2">
                <div class="flex justify-between">
                  <div class="flex items-center space-x-2">
                    <Users2Icon class="h-4 w-4 text-muted-foreground" />
                    <CardTitle class="text-base font-medium">
                      {{ getCustomerGroupName(groupPricing.groupId) }}
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="removeCustomerGroupPricing(index)"
                    :disabled="isSubmitting"
                  >
                    <XIcon class="h-4 w-4" />
                    <span class="sr-only">Remove</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent class="p-4 pt-2 pb-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`group-${index}`">Customer Group</Label>
                    <Select 
                      v-model="groupPricing.groupId" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`group-${index}`">
                        <SelectValue placeholder="Select customer group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="group in availableCustomerGroups(index)" 
                          :key="group.id" 
                          :value="group.id"
                        >
                          {{ group.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`pricing-type-${index}`">Pricing Type</Label>
                    <Select 
                      v-model="groupPricing.type" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`pricing-type-${index}`">
                        <SelectValue placeholder="Select pricing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Adjustment</SelectItem>
                        <SelectItem value="fixed">Fixed Price Adjustment</SelectItem>
                        <SelectItem value="multiplier">Price Multiplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`adjustment-${index}`">
                      {{ getPricingAdjustmentLabel(groupPricing.type) }}
                    </Label>
                    <div class="relative">
                      <div v-if="groupPricing.type === 'fixed'" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span class="text-muted-foreground">$</span>
                      </div>
                      <Input 
                        :id="`adjustment-${index}`" 
                        type="number" 
                        v-model="groupPricing.value" 
                        :placeholder="getPricingAdjustmentPlaceholder(groupPricing.type)" 
                        :disabled="isSubmitting"
                        :class="{'pl-7': groupPricing.type === 'fixed'}"
                        step="0.01"
                      />
                      <div v-if="groupPricing.type === 'percentage'" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span class="text-muted-foreground">%</span>
                      </div>
                      <div v-if="groupPricing.type === 'multiplier'" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span class="text-muted-foreground">×</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`example-${index}`">Example</Label>
                    <div class="h-9 px-3 py-1 border rounded-md bg-muted/50 flex items-center">
                      <span>${{ calculateExamplePrice(groupPricing).toFixed(2) }}</span>
                      <span class="text-xs text-muted-foreground ml-1">/ $100 base</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <!-- Categories Tab -->
        <TabsContent value="categories" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Category Price Adjustments</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addCategoryPricing"
              :disabled="isSubmitting || categories.length === 0"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div v-if="categories.length === 0" class="p-4 border rounded-md text-center">
            <FoldersIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No product categories available</p>
            <p class="text-xs text-muted-foreground mt-1">Create product categories first to configure category-specific pricing</p>
          </div>
          
          <div v-else-if="form.categoryPricing.length === 0" class="p-4 border rounded-md text-center">
            <FoldersIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No category pricing configured</p>
            <p class="text-xs text-muted-foreground mt-1">Add category-specific pricing rules for this channel</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addCategoryPricing"
              class="mt-3"
              :disabled="isSubmitting"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Category Pricing
            </Button>
          </div>
          
          <div v-else class="space-y-3">
            <Card v-for="(catPricing, index) in form.categoryPricing" :key="index" class="overflow-hidden">
              <CardHeader class="p-4 pb-2">
                <div class="flex justify-between">
                  <div class="flex items-center space-x-2">
                    <FolderIcon class="h-4 w-4 text-muted-foreground" />
                    <CardTitle class="text-base font-medium">
                      {{ getCategoryName(catPricing.categoryId) }}
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="removeCategoryPricing(index)"
                    :disabled="isSubmitting"
                  >
                    <XIcon class="h-4 w-4" />
                    <span class="sr-only">Remove</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent class="p-4 pt-2 pb-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`category-${index}`">Category</Label>
                    <Select 
                      v-model="catPricing.categoryId" 
                      :disabled="isSubmitting"
                    >
                      <SelectTrigger :id="`category-${index}`">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="category in availableCategories(index)" 
                          :key="category.id" 
                          :value="category.id"
                        >
                          {{ category.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`cat-adjustment-${index}`">Percentage Adjustment</Label>
                    <div class="relative">
                      <Input 
                        :id="`cat-adjustment-${index}`" 
                        type="number" 
                        v-model="catPricing.adjustment" 
                        placeholder="0" 
                        :disabled="isSubmitting"
                        step="0.1"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span class="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`cat-example-${index}`">Example</Label>
                    <div class="h-9 px-3 py-1 border rounded-md bg-muted/50 flex items-center">
                      <span>{{ calculateCategoryExample(catPricing.adjustment) }}</span>
                      <span class="text-xs text-muted-foreground ml-1">/ $100 base</span>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`cat-priority-${index}`">Priority</Label>
                    <Input 
                      :id="`cat-priority-${index}`" 
                      type="number" 
                      v-model="catPricing.priority" 
                      placeholder="0" 
                      :disabled="isSubmitting"
                      step="1"
                      min="0"
                    />
                    <p class="text-xs text-muted-foreground">
                      Higher priority rules are applied first
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <!-- Product Overrides Tab -->
        <TabsContent value="overrides" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Product Price Overrides</h3>
            <div class="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="importProductPrices"
                :disabled="isSubmitting"
              >
                <UploadIcon class="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addProductOverride"
                :disabled="isSubmitting || products.length === 0"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Override
              </Button>
            </div>
          </div>
          
          <div v-if="products.length === 0" class="p-4 border rounded-md text-center">
            <BoxIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No products available</p>
            <p class="text-xs text-muted-foreground mt-1">Create products first to configure product-specific price overrides</p>
          </div>
          
          <div v-else-if="form.productOverrides.length === 0" class="p-4 border rounded-md text-center">
            <TagIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No product overrides configured</p>
            <p class="text-xs text-muted-foreground mt-1">Add product-specific price overrides for this channel</p>
            <div class="flex justify-center space-x-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="importProductPrices"
                :disabled="isSubmitting"
              >
                <UploadIcon class="h-4 w-4 mr-2" />
                Import from CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addProductOverride"
                :disabled="isSubmitting"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Override
              </Button>
            </div>
          </div>
          
          <div v-else>
            <div class="space-y-2 mb-4">
              <div class="flex items-center space-x-2">
                <Input 
                  placeholder="Search products..." 
                  v-model="productSearch"
                  :disabled="isSubmitting"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  @click="productSearch = ''"
                  :disabled="!productSearch || isSubmitting"
                >
                  <XIcon class="h-4 w-4" />
                  <span class="sr-only">Clear</span>
                </Button>
              </div>
            </div>
            
            <div class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Override Price</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead class="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(override, index) in filteredProductOverrides" :key="index">
                    <TableCell>
                      <div class="flex items-center space-x-2">
                        <Select 
                          v-model="override.productId" 
                          :disabled="isSubmitting"
                        >
                          <SelectTrigger class="w-[200px]">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem 
                              v-for="product in availableProducts(index)" 
                              :key="product.id" 
                              :value="product.id"
                            >
                              {{ product.name }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="text-sm">${{ getProductBasePrice(override.productId).toFixed(2) }}</div>
                    </TableCell>
                    <TableCell>
                      <div class="relative w-[120px]">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span class="text-muted-foreground">$</span>
                        </div>
                        <Input 
                          type="number" 
                          v-model="override.price" 
                          placeholder="0.00" 
                          :disabled="isSubmitting"
                          class="pl-7"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        :variant="getPriceDifferenceVariant(override.price, getProductBasePrice(override.productId))"
                      >
                        {{ calculatePriceDifference(override.price, getProductBasePrice(override.productId)) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        @click="removeProductOverride(index)"
                        :disabled="isSubmitting"
                      >
                        <XIcon class="h-4 w-4" />
                        <span class="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="filteredProductOverrides.length === 0">
                    <TableCell colSpan="5" class="text-center py-4 text-muted-foreground">
                      No matching product overrides found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div v-if="form.productOverrides.length > filteredProductOverrides.length" class="text-xs text-muted-foreground mt-2 text-right">
              Showing {{ filteredProductOverrides.length }} of {{ form.productOverrides.length }} overrides
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <SheetFooter>
        <div class="flex justify-between w-full">
          <Button 
            type="button" 
            variant="outline" 
            @click="$emit('close')" 
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="isSubmitting || !isFormValid"
          >
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            Save Pricing Settings
          </Button>
        </div>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  BoxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  FoldersIcon,
  GlobeIcon,
  Loader2Icon,
  PackageIcon,
  PhoneIcon,
  PlusIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  TagIcon,
  TagsIcon,
  UploadIcon,
  Users2Icon,
  XIcon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  salesChannel: {
    type: Object,
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
  }
})

const emit = defineEmits(['pricing-updated', 'close'])
const { toast } = useToast()

// State
const isSubmitting = ref(false)
const productSearch = ref('')

// Default form structure
const defaultForm = {
  pricingStrategy: 'standard',
  markupPercentage: 0,
  currency: 'USD',
  platformFee: 0,
  minimumOrderAmount: 0,
  taxInclusivePricing: false,
  roundPrices: false,
  customerGroupPricing: [],
  categoryPricing: [],
  productOverrides: []
}

// Initialize form with data from the sales channel
const form = ref({
  ...defaultForm,
  ...props.salesChannel,
  customerGroupPricing: [...(props.salesChannel.customerGroupPricing || [])],
  categoryPricing: [...(props.salesChannel.categoryPricing || [])],
  productOverrides: [...(props.salesChannel.productOverrides || [])]
})

// Form validation
const isFormValid = computed(() => {
  return true // Basic validation - can be expanded as needed
})

// Filtered product overrides based on search
const filteredProductOverrides = computed(() => {
  if (!productSearch.value) return form.value.productOverrides

  const searchTerm = productSearch.value.toLowerCase()
  return form.value.productOverrides.filter(override => {
    const product = props.products.find(p => p.id === override.productId)
    return product && product.name.toLowerCase().includes(searchTerm)
  })
})

// Helper functions for customer groups tab
function getCustomerGroupName(groupId) {
  const group = props.customerGroups.find(g => g.id === groupId)
  return group ? group.name : 'Unknown Group'
}

function availableCustomerGroups(currentIndex) {
  // Filter out groups already selected in other entries (except this one)
  const usedGroupIds = form.value.customerGroupPricing
    .filter((_, index) => index !== currentIndex)
    .map(g => g.groupId)
  
  return props.customerGroups.filter(group => !usedGroupIds.includes(group.id))
}

function getPricingAdjustmentLabel(type) {
  switch (type) {
    case 'percentage': return 'Percentage Adjustment'
    case 'fixed': return 'Fixed Amount'
    case 'multiplier': return 'Price Multiplier'
    default: return 'Adjustment'
  }
}

function getPricingAdjustmentPlaceholder(type) {
  switch (type) {
    case 'percentage': return '0'
    case 'fixed': return '0.00'
    case 'multiplier': return '1.0'
    default: return '0'
  }
}

function calculateExamplePrice(groupPricing) {
  const basePrice = 100
  
  switch (groupPricing.type) {
    case 'percentage':
      return basePrice * (1 + (parseFloat(groupPricing.value) || 0) / 100)
    case 'fixed':
      return basePrice + (parseFloat(groupPricing.value) || 0)
    case 'multiplier':
      return basePrice * (parseFloat(groupPricing.value) || 1)
    default:
      return basePrice
  }
}

function addCustomerGroupPricing() {
  form.value.customerGroupPricing.push({
    groupId: availableCustomerGroups(form.value.customerGroupPricing.length)[0]?.id || '',
    type: 'percentage',
    value: 0
  })
}

function removeCustomerGroupPricing(index) {
  form.value.customerGroupPricing.splice(index, 1)
}

// Helper functions for categories tab
function getCategoryName(categoryId) {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

function availableCategories(currentIndex) {
  // Filter out categories already selected in other entries (except this one)
  const usedCategoryIds = form.value.categoryPricing
    .filter((_, index) => index !== currentIndex)
    .map(c => c.categoryId)
  
  return props.categories.filter(category => !usedCategoryIds.includes(category.id))
}

function calculateCategoryExample(adjustment) {
  const basePrice = 100
  const result = basePrice * (1 + (parseFloat(adjustment) || 0) / 100)
  return `$${result.toFixed(2)}`
}

function addCategoryPricing() {
  form.value.categoryPricing.push({
    categoryId: availableCategories(form.value.categoryPricing.length)[0]?.id || '',
    adjustment: 0,
    priority: form.value.categoryPricing.length
  })
}

function removeCategoryPricing(index) {
  form.value.categoryPricing.splice(index, 1)
}

// Helper functions for product overrides tab
function getProductBasePrice(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? (parseFloat(product.price) || 0) : 0
}

function availableProducts(currentIndex) {
  // Filter out products already selected in other entries (except this one)
  const usedProductIds = form.value.productOverrides
    .filter((_, index) => index !== currentIndex)
    .map(p => p.productId)
  
  return props.products.filter(product => !usedProductIds.includes(product.id))
}

function calculatePriceDifference(overridePrice, basePrice) {
  if (!basePrice) return '0%'
  
  const difference = ((parseFloat(overridePrice) / basePrice) * 100) - 100
  const prefix = difference >= 0 ? '+' : ''
  return `${prefix}${difference.toFixed(1)}%`
}

function getPriceDifferenceVariant(overridePrice, basePrice) {
  const override = parseFloat(overridePrice) || 0
  const base = parseFloat(basePrice) || 0
  
  if (override > base) return 'success'
  if (override < base) return 'destructive'
  return 'outline'
}

function addProductOverride() {
  const availableProduct = availableProducts(form.value.productOverrides.length)[0]
  if (!availableProduct) return
  
  form.value.productOverrides.push({
    productId: availableProduct.id,
    price: availableProduct.price || 0
  })
}

function removeProductOverride(index) {
  form.value.productOverrides.splice(index, 1)
}

function importProductPrices() {
  // In a real application, this would open a file input dialog or similar
  toast({
    title: 'Import not implemented',
    description: 'This would allow CSV import of product prices in a full implementation',
    variant: 'default'
  })
}

// Form submission
async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    // Update the channel with pricing information
    const updatedChannel = {
      ...props.salesChannel,
      pricingStrategy: form.value.pricingStrategy,
      markupPercentage: parseFloat(form.value.markupPercentage) || 0,
      currency: form.value.currency,
      platformFee: parseFloat(form.value.platformFee) || 0,
      minimumOrderAmount: parseFloat(form.value.minimumOrderAmount) || 0,
      taxInclusivePricing: form.value.taxInclusivePricing,
      roundPrices: form.value.roundPrices,
      customerGroupPricing: form.value.customerGroupPricing,
      categoryPricing: form.value.categoryPricing,
      productOverrides: form.value.productOverrides,
      updatedAt: new Date().toISOString()
    }
    
    emit('pricing-updated', updatedChannel)
    
    toast({
      title: 'Pricing updated',
      description: `Pricing settings for ${props.salesChannel.name} have been updated successfully`,
      variant: 'success'
    })
    
    emit('close')
  } catch (error) {
    console.error('Error updating pricing:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error updating the pricing settings',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>