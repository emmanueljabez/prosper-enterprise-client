<template>
  <nav class="flex mb-4" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li class="inline-flex items-center">
        <RouterLink
            to="/dashboard"
            class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <HomeIcon class="w-4 h-4 mr-2" />
          Dashboard
        </RouterLink>
      </li>

      <li v-for="(crumb, index) in items" :key="index">
        <div class="flex items-center">
          <ChevronRightIcon class="w-4 h-4 text-muted-foreground" />
          <RouterLink
              v-if="crumb.href && index < items.length - 1"
              :to="crumb.href"
              class="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground md:ml-2"
          >
            {{ crumb.label }}
          </RouterLink>
          <span
              v-else
              class="ml-1 text-sm font-medium text-foreground md:ml-2"
          >
            {{ crumb.label }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { HomeIcon, ChevronRightIcon } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>