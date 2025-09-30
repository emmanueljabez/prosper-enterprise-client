<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: any
  description?: string
  color?: 'default' | 'green' | 'red' | 'blue' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  color: 'default'
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return null
  }
})

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
})

const cardColor = computed(() => {
  switch (props.color) {
    case 'green':
      return 'border-green-200 bg-green-50'
    case 'red':
      return 'border-red-200 bg-red-50'
    case 'blue':
      return 'border-blue-200 bg-blue-50'
    case 'orange':
      return 'border-orange-200 bg-orange-50'
    default:
      return ''
  }
})
</script>

<template>
  <Card :class="cardColor">
    <CardContent class="p-6">
      <div class="flex items-center justify-between space-y-0 pb-2">
        <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
        <component 
          v-if="icon" 
          :is="icon" 
          class="h-4 w-4 text-muted-foreground" 
        />
      </div>
      <div class="flex items-baseline space-x-2">
        <p class="text-2xl font-bold">{{ value }}</p>
        <div v-if="change" class="flex items-center space-x-1">
          <component 
            v-if="trendIcon" 
            :is="trendIcon" 
            :class="`h-3 w-3 ${trendColor}`" 
          />
          <Badge 
            :variant="trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'" 
            class="text-xs"
          >
            {{ change }}
          </Badge>
        </div>
      </div>
      <p v-if="description" class="text-xs text-muted-foreground mt-2">
        {{ description }}
      </p>
    </CardContent>
  </Card>
</template> 