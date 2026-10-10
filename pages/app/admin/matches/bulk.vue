<script setup lang="ts">
definePageMeta({
  title: 'Bulk Matching',
  description: 'Prepare bulk mentor matching workflows.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Bulk Matching"
    description="Prepare high-volume matching workflows for cohorts and larger mentorship programs."
    :bullets="[
      'Review matching readiness before launch.',
      'Support program-level matching rules in a future implementation slice.',
      'Use One-to-One Matching today for manual participant assignments.',
    ]"
  />
</template>
