<script setup lang="ts">
definePageMeta({
  title: 'Plenary Sessions',
  description: 'Manage plenary mentorship sessions.',
  requiresAuth: true,
  permissions: ['admin:reports'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Plenary Sessions"
    description="Plan and monitor plenary sessions for cohorts, circles, and company-wide mentorship moments."
    :bullets="[
      'Use this space for cohort-wide mentorship events.',
      'Connect plenary activity to programs and tracking.',
      'One-to-one delivery remains available under One-to-One Sessions.',
    ]"
  />
</template>
