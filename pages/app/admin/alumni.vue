<script setup lang="ts">
definePageMeta({
  title: 'Alumni',
  description: 'Review mentees who have completed mentorship programs.',
  requiresAuth: true,
  permissions: ['admin:users'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Alumni"
    description="Review mentees who have completed programs and keep a record of post-program engagement."
    :bullets="[
      'Separate completed mentees from active program operations.',
      'Support future re-engagement, reporting, and alumni outcomes.',
      'Keep completion history tied to programs and cohorts.',
    ]"
  />
</template>
