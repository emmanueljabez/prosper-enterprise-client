<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Loading State -->
    <template v-if="isLoading">
      <Card v-for="i in 4" :key="`skeleton-${i}`" class="animate-pulse">
        <CardHeader class="pb-2">
          <div class="h-4 bg-slate-200 rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div class="h-8 bg-slate-200 rounded w-16 mb-2"></div>
          <div class="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div class="h-1 bg-slate-100 rounded-full w-full overflow-hidden mt-2"></div>
        </CardContent>
      </Card>
    </template>
    
    <template v-else>
      <!-- Active Products Card -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Active Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatNumber(activeProducts) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ activeProductsLabel }}
          </p>
          <div class="h-1 w-full bg-slate-100 mt-2 rounded-full overflow-hidden">
            <div 
              v-if="activeProductsPercentage" 
              class="h-full bg-primary transition-all duration-500" 
              :style="{ width: `${Math.min(activeProductsPercentage, 100)}%` }"
            ></div>
          </div>
        </CardContent>
      </Card>
  
      <!-- Featured Products Card -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Featured Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-500">{{ formatNumber(featuredProducts) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ featuredProductsLabel }}
          </p>
          <div class="flex items-center gap-1 mt-2">
            <div v-if="featuredProductsTrend !== null" class="text-xs flex items-center">
              <TrendingUpIcon v-if="featuredProductsTrend > 0" class="h-3 w-3 text-green-500 mr-1" />
              <TrendingDownIcon v-else-if="featuredProductsTrend < 0" class="h-3 w-3 text-red-500 mr-1" />
              <MinusIcon v-else class="h-3 w-3 text-gray-500 mr-1" />
              {{ Math.abs(featuredProductsTrend) }}% from last month
            </div>
          </div>
        </CardContent>
      </Card>
  
      <!-- Active Promotions Card -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Active Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-500">{{ formatNumber(activePromotions) }}</div>
          <div class="flex items-center text-xs text-muted-foreground mt-1">
            {{ activePromotionsLabel }}
          </div>
          <div class="mt-2 text-xs">
            <span v-if="upcomingPromotions">
              <CalendarIcon class="h-3 w-3 inline mr-1" />
              {{ formatNumber(upcomingPromotions) }} upcoming
            </span>
          </div>
        </CardContent>
      </Card>
  
      <!-- Custom Stat Card or Out of Stock Products -->
      <Card v-if="customStat && !customStat.hide">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">{{ customStat.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div :class="['text-2xl font-bold', customStat.valueClass]">{{ customStat.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ customStat.description }}
          </p>
          <slot name="custom-card-content"></slot>
        </CardContent>
      </Card>
      <Card v-else>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Out of Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-amber-500">{{ formatNumber(outOfStockProducts) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Products needing inventory replenishment
          </p>
          <div v-if="lowStockThreshold" class="mt-2 text-xs flex items-center gap-1">
            <AlertCircleIcon class="h-3 w-3 text-amber-500" />
            <span>Below {{ lowStockThreshold }} units threshold</span>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
  
<script setup>
import { computed } from 'vue'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon, 
  CalendarIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const props = defineProps({
  // Product counts
  activeProducts: {
    type: Number,
    default: 0
  },
  featuredProducts: {
    type: Number,
    default: 0
  },
  activePromotions: {
    type: Number,
    default: 0
  },
  outOfStockProducts: {
    type: Number,
    default: 0
  },
    
  // Labels and descriptions
  activeProductsLabel: {
    type: String,
    default: 'Total active products in catalog'
  },
  featuredProductsLabel: {
    type: String,
    default: 'Products with featured status'
  },
  activePromotionsLabel: {
    type: String,
    default: 'Currently running promotional offers'
  },
    
  // Additional data
  activeProductsPercentage: {
    type: Number,
    default: null
  },
  featuredProductsTrend: {
    type: Number,
    default: null
  },
  upcomingPromotions: {
    type: Number,
    default: null
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  
  // Loading state
  isLoading: {
    type: Boolean,
    default: false
  },
    
  // Optional custom stat for 4th card
  customStat: {
    type: Object,
    default: null
    // Example structure:
    // {
    //   title: 'Revenue from Products',
    //   value: '$12,435',
    //   description: 'Total revenue this month',
    //   valueClass: 'text-purple-500',
    //   hide: false
    // }
  }
})

// Methods
const formatNumber = (value) => {
  if (value === null || value === undefined) return 0;
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toString();
}
</script>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.duration-500 {
  transition-duration: 500ms;
}
</style>