<script setup lang="ts">
definePageMeta({
  title: 'Mentees',
  description: 'Redirecting to mentees workspace',
  requiresAuth: true,
  permissions: ['admin:users'],
})

const route = useRoute()

await navigateTo(
  {
    path: '/app/admin/employees',
    query: route.query,
    hash: route.hash,
  },
  { replace: true },
)
</script>
