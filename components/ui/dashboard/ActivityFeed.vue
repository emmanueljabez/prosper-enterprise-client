<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  icon: any
  color: string
  priority?: 'high' | 'medium' | 'low'
}

interface Props {
  activities: ActivityItem[]
  title?: string
  maxItems?: number
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Recent Activity',
  maxItems: 5,
  showViewAll: true
})

const emit = defineEmits<{
  viewAll: []
  activityClick: [activity: ActivityItem]
}>()

const displayedActivities = computed(() => {
  return props.activities.slice(0, props.maxItems)
})

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500'
    case 'medium':
      return 'border-l-yellow-500'
    case 'low':
      return 'border-l-green-500'
    default:
      return 'border-l-gray-300'
  }
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle class="text-lg">{{ title }}</CardTitle>
      <Button 
        v-if="showViewAll && activities.length > maxItems"
        variant="ghost" 
        size="sm"
        @click="emit('viewAll')"
      >
        View All
        <ArrowRight class="h-4 w-4 ml-2" />
      </Button>
    </CardHeader>
    <CardContent class="space-y-4">
      <div 
        v-for="activity in displayedActivities" 
        :key="activity.id"
        :class="`flex items-start space-x-3 p-3 rounded-lg border-l-2 hover:bg-muted/50 transition-colors cursor-pointer ${getPriorityColor(activity.priority)}`"
        @click="emit('activityClick', activity)"
      >
        <div :class="`p-1 rounded-full ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`">
          <component :is="activity.icon" :class="`h-3 w-3 ${activity.color}`" />
        </div>
        <div class="flex-1 space-y-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ activity.title }}</p>
            <Badge v-if="activity.priority" :variant="activity.priority === 'high' ? 'destructive' : 'secondary'" class="text-xs">
              {{ activity.priority }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">{{ activity.description }}</p>
          <p class="text-xs text-muted-foreground">{{ formatTimeAgo(activity.timestamp) }}</p>
        </div>
      </div>
      
      <div v-if="activities.length === 0" class="text-center py-8">
        <p class="text-sm text-muted-foreground">No recent activity</p>
      </div>
    </CardContent>
  </Card>
</template> 