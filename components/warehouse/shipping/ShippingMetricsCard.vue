<template>
  <div class="rounded-lg border border-border bg-card shadow-sm p-6 flex flex-col space-y-2">
    <div class="flex justify-between items-start">
      <h3 class="text-sm font-medium text-muted-foreground">{{ title }}</h3>
      <div :class="[
        'rounded-full w-8 h-8 flex items-center justify-center',
        'bg-primary/10 text-primary'
      ]">
        <Package v-if="icon === 'package'" class="h-4 w-4" />
        <Truck v-else-if="icon === 'truck'" class="h-4 w-4" />
        <Clock v-else-if="icon === 'clock'" class="h-4 w-4" />
        <DollarSign v-else-if="icon === 'dollar-sign'" class="h-4 w-4" />
        <BarChart v-else-if="icon === 'bar-chart'" class="h-4 w-4" />
        <ShoppingCart v-else-if="icon === 'shopping-cart'" class="h-4 w-4" />
        <Users v-else-if="icon === 'users'" class="h-4 w-4" />
        <Globe v-else-if="icon === 'globe'" class="h-4 w-4" />
        <Activity v-else class="h-4 w-4" />
      </div>
    </div>
    
    <div class="space-y-1">
      <div class="text-2xl font-bold">{{ value }}</div>
      <div class="flex items-center text-xs">
        <div v-if="trend" :class="[
          'flex items-center',
          trendUp ? 'text-green-500' : 'text-red-500'
        ]">
          <TrendingUp v-if="trendUp" class="h-3 w-3 mr-1" />
          <TrendingDown v-else class="h-3 w-3 mr-1" />
          <span>{{ trend }}</span>
        </div>
        <span class="text-muted-foreground ml-1">from previous period</span>
      </div>
    </div>
    
    <slot></slot>
  </div>
</template>

<script setup>
import { 
  Package, Truck, Clock, DollarSign, Activity, 
  TrendingUp, TrendingDown, BarChart, 
  ShoppingCart, Users, Globe 
} from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  trend: {
    type: String,
    default: null
  },
  trendUp: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'activity',
    validator: (value) => [
      'package', 'truck', 'clock', 'dollar-sign', 
      'activity', 'bar-chart', 'shopping-cart', 
      'users', 'globe'
    ].includes(value)
  }
})
</script>