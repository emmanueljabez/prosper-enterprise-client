<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, ArrowRight, Calendar } from 'lucide-vue-next'

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  targetDate: string
  category: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'In Progress' | 'Completed' | 'Paused'
}

interface Props {
  goals: Goal[]
  title?: string
  maxItems?: number
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Current Goals',
  maxItems: 3,
  showViewAll: true
})

const emit = defineEmits<{
  viewAll: []
  goalClick: [goal: Goal]
  addGoal: []
}>()

const displayedGoals = computed(() => {
  return props.goals.slice(0, props.maxItems)
})

const goalsByCategory = computed(() => {
  const categories = [...new Set(props.goals.map(goal => goal.category))]
  return categories.map(category => ({
    category,
    goals: props.goals.filter(goal => goal.category === category),
    averageProgress: Math.round(
      props.goals.filter(goal => goal.category === category)
        .reduce((sum, goal) => sum + goal.progress, 0) / 
      props.goals.filter(goal => goal.category === category).length
    )
  }))
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDaysUntilDeadline = (targetDate: string) => {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  return 'bg-gray-400'
}

const getDeadlineStatus = (targetDate: string) => {
  const days = getDaysUntilDeadline(targetDate)
  if (days < 0) return { text: 'Overdue', color: 'text-red-600' }
  if (days <= 7) return { text: `${days} days left`, color: 'text-orange-600' }
  if (days <= 30) return { text: `${days} days left`, color: 'text-yellow-600' }
  return { text: `${days} days left`, color: 'text-green-600' }
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle class="text-lg flex items-center space-x-2">
        <Target class="h-5 w-5" />
        <span>{{ title }}</span>
      </CardTitle>
      <div class="flex space-x-2">
        <Button variant="outline" size="sm" @click="emit('addGoal')">
          Add Goal
        </Button>
        <Button 
          v-if="showViewAll && goals.length > maxItems"
          variant="ghost" 
          size="sm"
          @click="emit('viewAll')"
        >
          View All
          <ArrowRight class="h-4 w-4 ml-2" />
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Goals List -->
      <div class="space-y-4">
        <div 
          v-for="goal in displayedGoals" 
          :key="goal.id"
          class="space-y-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
          @click="emit('goalClick', goal)"
        >
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-sm">{{ goal.title }}</h4>
            <div class="flex items-center space-x-2">
              <Badge :class="getPriorityColor(goal.priority)" class="text-xs">
                {{ goal.priority }}
              </Badge>
              <Badge variant="outline" class="text-xs">
                {{ goal.category }}
              </Badge>
            </div>
          </div>
          
          <p class="text-xs text-muted-foreground">{{ goal.description }}</p>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium">{{ goal.progress }}% complete</span>
              <div class="flex items-center space-x-1" :class="getDeadlineStatus(goal.targetDate).color">
                <Calendar class="h-3 w-3" />
                <span>{{ getDeadlineStatus(goal.targetDate).text }}</span>
              </div>
            </div>
            <Progress :model-value="goal.progress" class="h-2" />
          </div>
        </div>
      </div>

      <!-- Category Summary -->
      <div v-if="goalsByCategory.length > 1" class="space-y-3">
        <h4 class="font-medium text-sm text-muted-foreground">Progress by Category</h4>
        <div class="grid gap-2">
          <div 
            v-for="categoryData in goalsByCategory" 
            :key="categoryData.category"
            class="flex items-center justify-between p-2 rounded border"
          >
            <span class="text-sm">{{ categoryData.category }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-500 transition-all duration-300"
                  :style="{ width: `${categoryData.averageProgress}%` }"
                ></div>
              </div>
              <span class="text-xs text-muted-foreground w-8">{{ categoryData.averageProgress }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="goals.length === 0" class="text-center py-8">
        <Target class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p class="text-sm text-muted-foreground mb-4">No goals set yet</p>
        <Button @click="emit('addGoal')">
          Set Your First Goal
        </Button>
      </div>
    </CardContent>
  </Card>
</template> 