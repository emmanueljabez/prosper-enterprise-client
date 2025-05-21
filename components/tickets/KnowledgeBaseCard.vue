<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">Knowledge Base</CardTitle>
      <CardDescription>Find solutions to common issues</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="relative">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
              v-model="searchQuery"
              placeholder="Search knowledge base..."
              class="pl-8"
              @keydown.enter="handleSearch"
          />
        </div>

        <div class="divide-y">
          <h3 class="text-sm font-medium py-2">Popular Articles</h3>
          <div
              v-for="article in popularArticles"
              :key="article.id"
              class="py-2 hover:bg-muted/50 cursor-pointer rounded-sm px-1"
              @click="$emit('view-article', article)"
          >
            <div class="text-sm">{{ article.title }}</div>
            <div class="flex justify-between mt-1">
              <Badge variant="outline" class="text-xs">{{ article.category }}</Badge>
              <span class="text-xs text-muted-foreground">{{ formatTimeAgo(article.lastUpdated) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <span class="text-xs text-muted-foreground">{{ articleCount }} articles available</span>
          <Button variant="outline" size="sm" @click="$emit('browse-kb')">
            Browse All
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDistance } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchIcon } from 'lucide-vue-next'

const props = defineProps({
  articles: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['view-article', 'search', 'browse-kb'])

const searchQuery = ref('')

// Total article count
const articleCount = computed(() => props.articles.length)

// Popular articles (most recently updated, top 3)
const popularArticles = computed(() => {
  return [...props.articles]
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 3)
})

function formatTimeAgo(dateString) {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}
</script>