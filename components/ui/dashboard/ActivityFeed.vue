<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  showViewAll: true,
})

const emit = defineEmits<{
  viewAll: []
  activityClick: [activity: ActivityItem]
}>()

const displayedActivities = computed(() => props.activities.slice(0, props.maxItems))

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const priorityClass = (priority?: ActivityItem['priority']) => {
  if (priority === 'high') {
    return 'bg-[#fce9eb] text-[#a2233f]'
  }
  if (priority === 'medium') {
    return 'bg-[#f8efe2] text-[#8a4d08]'
  }
  return 'bg-[#e9f3ea] text-[#2e6641]'
}
</script>

<template>
  <Card class="activity-feed-card border shadow-sm">
    <CardHeader class="activity-feed-card__header">
      <CardTitle class="text-[1.2rem] font-semibold tracking-[-0.01em] text-[#212834]">{{ title }}</CardTitle>
      <Button
        v-if="showViewAll"
        variant="outline"
        size="sm"
        class="h-8 rounded-md border-[#dedde4] bg-white px-3 text-[11px] font-medium text-[#4b5565] hover:bg-[#f8f7fb]"
        @click="emit('viewAll')"
      >
        View All
        <ArrowRight class="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </CardHeader>

    <CardContent class="activity-feed-card__content">
      <ol v-if="activities.length" class="space-y-0">
        <li
          v-for="(activity, index) in displayedActivities"
          :key="activity.id"
          class="group relative grid cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-3"
          @click="emit('activityClick', activity)"
        >
          <div class="relative flex justify-center">
            <span
              v-if="index < displayedActivities.length - 1"
              class="absolute left-1/2 top-8 h-[calc(100%-7px)] w-px -translate-x-1/2 bg-[#ece3ee]"
            />
            <span class="relative z-10 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e3d9e3] bg-[#faf5fa]">
              <component :is="activity.icon" :class="`h-3.5 w-3.5 ${activity.color}`" />
            </span>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-semibold text-[#222b36] transition-colors group-hover:text-[#7b366a]">
                {{ activity.title }}
              </p>
              <span
                v-if="activity.priority"
                :class="['inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]', priorityClass(activity.priority)]"
              >
                {{ activity.priority }}
              </span>
            </div>

            <p v-if="activity.description" class="mt-1 line-clamp-2 text-xs text-[#596170]">
              {{ activity.description }}
            </p>
            <p class="mt-1.5 text-[11px] text-[#8d97a6]">{{ formatDate(activity.timestamp) }}</p>
          </div>

          <p class="pt-0.5 whitespace-nowrap text-xs font-medium text-[#7a8595]">
            {{ formatTime(activity.timestamp) }}
          </p>
        </li>
      </ol>

      <div v-if="activities.length === 0" class="py-8 text-center">
        <p class="text-sm text-muted-foreground">No recent activity</p>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.activity-feed-card {
  border-color: #e4e0e8;
  border-radius: 0.875rem;
  background: #fff;
}

.activity-feed-card__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.85rem;
}

.activity-feed-card__content {
  padding-top: 0;
}
</style>
