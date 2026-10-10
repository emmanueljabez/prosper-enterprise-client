<script setup lang="ts">
definePageMeta({
  title: 'Group Sessions',
  description: 'Manage group mentorship sessions.',
  requiresAuth: true,
  permissions: ['admin:reports'],
})
</script>

<template>
  <WorkspacePlaceholder
    title="Group Sessions"
    description="Plan and review group mentorship sessions where one or more mentors support multiple mentees."
    :bullets="[
      'Use this space for small-group delivery.',
      'Track group session participation and completion later.',
      'Keep one-to-one session operations in their dedicated workspace.',
    ]"
  />
</template>
