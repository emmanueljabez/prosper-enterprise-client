<script setup lang="ts">
definePageMeta({
  title: 'Session Wallet',
  description: 'Redirecting to Finance.',
  requiresAuth: true,
  permissions: ['admin:billing'],
})

await navigateTo(
  {
    path: '/app/admin/billing',
    query: { tab: 'wallet' },
  },
  { replace: true },
)
</script>
