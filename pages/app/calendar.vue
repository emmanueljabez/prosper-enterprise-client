<template>
  <div class="container mx-auto py-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Calendar Integration</h1>
      <p class="text-muted-foreground">
        Manage your Google Calendar integration and view your upcoming events.
      </p>
    </div>

    <CalendarManagement />
  </div>
</template>

<script setup lang="ts">
import { CalendarManagement } from '@/components/ui/calendar-integration'

// Set page title
useHead({
  title: 'Calendar Integration - Prosper Mentor'
})
</script>
