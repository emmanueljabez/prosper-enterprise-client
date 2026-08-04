<script setup lang="ts">
import EnterpriseMentorWorkspace from '~/pages/app/admin/mentors.vue'

definePageMeta({
  title: 'Mentoring',
  description: 'Enterprise mentor pool and mentor discovery workspace',
  requiresAuth: true,
  permissions: ['mentors:view'],
})
</script>

<template>
  <EnterpriseMentorWorkspace />
</template>
