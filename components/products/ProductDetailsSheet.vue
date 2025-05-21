<template>
    <Sheet :open="isOpen" @update:open="$emit('update:open', $event)">
        <SheetContent class="sm:max-w-md md:max-w-lg overflow-y-auto">
            <SheetHeader>
                <SheetTitle>Product Details</SheetTitle>
                <SheetDescription>View detailed information about this product</SheetDescription>
            </SheetHeader>

            <div v-if="product" class="space-y-6 py-4">
                <!-- Product Header -->
                <div class="flex items-start justify-between">
                    <div class="space-y-1">
                        <h2 class="text-xl font-semibold">{{ product.name }}</h2>
                        <p class="text-sm text-muted-foreground">SKU: {{ product.sku || 'N/A' }}</p>
                    </div>

                    <div class="flex gap-2">
                        <Button variant="outline" size="sm" @click="handleEditProduct">
                            <PencilIcon class="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontalIcon class="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem @click="handleDuplicateProduct">
                                    <CopyIcon class="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem @click="handleDeleteProduct"
                                    class="text-destructive focus:text-destructive">
                                    <TrashIcon class="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <!-- Product Image -->
                <div class="relative aspect-video rounded-md overflow-hidden bg-muted">
                    <img v-if="product.image" :src="product.image" :alt="product.name"
                        class="object-cover w-full h-full" />
                    <div v-else class="flex items-center justify-center h-full">
                        <Package2Icon class="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Badge v-if="product.status" :variant="getStatusVariant(product.status)"
                        class="absolute top-2 right-2 capitalize">
                        {{ formatStatus(product.status) }}
                    </Badge>
                </div>

                <!-- Basic Information -->
                <div>
                    <h3 class="text-sm font-medium mb-3">Basic Information</h3>
                    <Separator />
                    <dl class="divide-y">
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Type</dt>
                            <dd class="text-sm">
                                <Badge variant="outline">{{ formatProductType(product.productType) }}</Badge>
                            </dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Market Segment</dt>
                            <dd class="text-sm">
                                <Badge variant="outline">{{ formatProductType(product.marketSegment) }}</Badge>
                            </dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Monthly Price</dt>
                            <dd class="text-sm font-medium">{{ product.monthlyPrice }}</dd>
                        </div>
                        <div v-if="product.promotionalPricing" class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Promotional Price</dt>
                            <dd class="text-sm text-green-600">{{ product.promotionalPricing.monthlyPrice }}</dd>
                        </div>
                        <div v-if="product.setupFee" class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Setup Fee</dt>
                            <dd class="text-sm">{{ product.setupFee }}</dd>
                        </div>
                        <div v-if="product.terminationFee" class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Termination Fee</dt>
                            <dd class="text-sm">{{ product.terminationFee }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Track Inventory</dt>
                            <dd class="text-sm">{{ product.trackInventory ? 'Yes' : 'No' }}</dd>
                        </div>
                        <!-- Internet service specific fields -->
                        <div v-if="product.downloadSpeed" class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Download Speed</dt>
                            <dd class="text-sm">{{ product.downloadSpeed }} Mbps</dd>
                        </div>
                        <div v-if="product.uploadSpeed" class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Upload Speed</dt>
                            <dd class="text-sm">{{ product.uploadSpeed }} Mbps</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Created Date</dt>
                            <dd class="text-sm">{{ formatDate(product.created) }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">Last Updated</dt>
                            <dd class="text-sm">{{ formatDate(product.updated) }}</dd>
                        </div>
                    </dl>
                </div>

                <!-- Description -->
                <div v-if="product.description">
                    <h3 class="text-sm font-medium mb-3">Description</h3>
                    <Separator />
                    <div class="py-3 text-sm">
                        {{ product.description }}
                    </div>
                </div>

                <!-- Features -->
                <div v-if="product.features && product.features.length">
                    <h3 class="text-sm font-medium mb-3">Features</h3>
                    <Separator />
                    <ul class="py-3 space-y-2">
                        <li v-for="(feature, index) in product.features" :key="index"
                            class="flex items-start gap-2 text-sm">
                            <CheckIcon class="h-4 w-4 text-primary mt-0.5" />
                            <span>{{ feature.name }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Technical Specifications -->
                <div v-if="product.specifications && product.specifications.length">
                    <h3 class="text-sm font-medium mb-3">Technical Specifications</h3>
                    <Separator />
                    <dl class="divide-y">
                        <div v-for="(spec, index) in product.specifications" :key="index"
                            class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-muted-foreground">{{ formatSpecKey(spec.specName) }}</dt>
                            <dd class="text-sm">{{ spec.specValue }}</dd>
                        </div>
                    </dl>
                </div>

                <!-- Service Areas -->
                <div v-if="product.serviceCoverageAreas && product.serviceCoverageAreas.length">
                    <h3 class="text-sm font-medium mb-3">Available In</h3>
                    <Separator />
                    <div class="py-3 flex flex-wrap gap-2">
                        <Badge v-for="areaId in product.serviceCoverageAreas" :key="areaId" variant="secondary">
                            Service Area {{ areaId }}
                        </Badge>
                    </div>
                </div>

                <!-- Promotional Pricing -->
                <div v-if="product.promotionalPricing">
                    <h3 class="text-sm font-medium mb-3">Promotional Pricing</h3>
                    <Separator />
                    <div class="py-3 space-y-2">
                        <div class="border rounded-md p-3 text-sm">
                            <div class="font-medium">{{ product.promotionalPricing.monthlyPrice }} (Promo Price)</div>
                            <div class="text-muted-foreground mt-1">{{ product.promotionalPricing.promotionDescription }}</div>
                            <div class="text-muted-foreground text-xs mt-2">
                                Valid from {{ formatDate(product.promotionalPricing.startDate) }} to
                                {{ formatDate(product.promotionalPricing.endDate) }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Geographical Pricing -->
                <div v-if="product.geographicalPricingEnabled && product.geographicalPricing && product.geographicalPricing.length">
                    <h3 class="text-sm font-medium mb-3">Geographical Pricing</h3>
                    <Separator />
                    <div class="py-3 space-y-2">
                        <div v-for="(pricing, index) in product.geographicalPricing" :key="index" class="border rounded-md p-3 text-sm">
                            <div class="font-medium">Service Area: {{ pricing.serviceCoverageId }}</div>
                            <div class="text-muted-foreground">Price: {{ pricing.pricing }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="py-8 flex items-center justify-center">
                <LoaderIcon class="h-6 w-6 animate-spin" />
            </div>

            <SheetFooter class="mt-6">
                <Button @click="handleCloseSheet" variant="outline">Close</Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
</template>

<script setup>
import { computed } from 'vue'
import {
    MoreHorizontalIcon,
    PencilIcon,
    TrashIcon,
    CopyIcon,
    Package2Icon,
    CheckIcon,
    LoaderIcon
} from 'lucide-vue-next'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    product: {
        type: Object,
        default: null
    }
})

// Emits - fixed by assigning to a variable
const emit = defineEmits([
    'update:open',
    'edit-product',
    'delete-product',
    'duplicate-product'
])

const handleSheetOpenChange = (isOpen) => {
    emit('update:open', isOpen)
}

const handleEditProduct = () => {
    emit('edit-product', props.product)
}

const handleDuplicateProduct = () => {
    emit('duplicate-product', props.product)
}

const handleDeleteProduct = () => {
    emit('delete-product', props.product)
}

const handleCloseSheet = () => {
    emit('update:open', false)
}



const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}

const formatSpecKey = (key) => {
    if (!key) return '';
    // Convert camelCase or snake_case to Title Case with spaces
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
}

const formatProductType = (type) => {
    if (!type) return 'Unknown';
    
    // Convert SNAKE_CASE to Title Case with spaces
    return type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert to Title Case
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const getStatusVariant = (status) => {
    if (!status) return 'outline';
    
    switch (status.toUpperCase()) {
        case 'ACTIVE':
            return 'success'
        case 'DRAFT':
            return 'secondary'
        case 'ARCHIVED':
            return 'outline'
        default:
            return 'outline'
    }
}
</script>