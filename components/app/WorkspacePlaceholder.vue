<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

withDefaults(defineProps<{
  title: string
  description: string
  bullets?: string[]
}>(), {
  bullets: () => [],
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <Card class="border-dashed">
      <CardHeader>
        <CardTitle>{{ title }}</CardTitle>
        <CardDescription>{{ description }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <p class="text-sm text-muted-foreground">
          This workspace route is now wired into navigation and ready for the next implementation slice.
        </p>
        <ul v-if="bullets.length" class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li v-for="bullet in bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
