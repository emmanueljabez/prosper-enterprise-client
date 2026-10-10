<script setup lang="ts">
definePageMeta({
  title: 'One-to-One Sessions',
  description: 'Redirecting to the one-to-one session operations workspace.',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

await navigateTo('/app/admin/sessions', { replace: true })
</script>
