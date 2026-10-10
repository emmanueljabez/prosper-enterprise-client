<script setup lang="ts">
definePageMeta({
  title: 'Program Content',
  description: 'Manage materials and guidance attached to mentorship programs.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Program Content"
    description="Manage reusable content, guidance, and resources that support mentorship programs."
    :bullets="[
      'Attach resources to programs, cohorts, or journey milestones.',
      'Keep program content separate from reusable journey structure.',
      'Prepare content for mentee and mentor-facing delivery flows.',
    ]"
  />
</template>
