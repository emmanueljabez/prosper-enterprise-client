<script setup lang="ts">
definePageMeta({
  title: 'Cohorts & Circles',
  description: 'Organize mentees into cohorts and mentorship circles.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Cohorts & Circles"
    description="Organize mentees into launch groups, peer circles, and delivery cohorts for each mentorship program."
    :bullets="[
      'Group mentees before matching and session delivery.',
      'Track cohort launch readiness, mentor coverage, and program timing.',
      'Keep cohorts connected to programs, journeys, sessions, and tracking.',
    ]"
  />
</template>
