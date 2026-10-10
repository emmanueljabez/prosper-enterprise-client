<script setup lang="ts">
definePageMeta({
  title: 'Topics',
  description: 'Manage mentorship topics used by company programs.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Topics"
    description="Manage the focus areas used to design programs, match mentors, and report on mentoring demand."
    :bullets="[
      'Create topic libraries for programs and sessions.',
      'Align topics with mentor expertise and mentee goals.',
      'Use topic data later in tracking and outcome summaries.',
    ]"
  />
</template>
