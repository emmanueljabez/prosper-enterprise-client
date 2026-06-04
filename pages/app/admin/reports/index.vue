<script setup lang="ts">
definePageMeta({
  title: 'Reports',
  description: 'Exportable row-based company mentorship reports',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const reportLinkClass = 'text-blue-600 underline underline-offset-4 hover:text-blue-700'
</script>

<template>
  <div class="container mx-auto flex flex-col gap-6 px-4 py-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Reports</h1>
    </div>

    <nav aria-label="Reports">
      <ul class="flex flex-col gap-3">
        <li>
          <NuxtLink to="/app/admin/reports/programs" :class="reportLinkClass">Program Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/participants" :class="reportLinkClass">Participant Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/matches" :class="reportLinkClass">Mentor Match Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/sessions" :class="reportLinkClass">Session Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/pulses" :class="reportLinkClass">Pulse Coverage Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/risk-signals" :class="reportLinkClass">Risk Signals Report</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/billing-transactions" :class="reportLinkClass">Billing Transactions Report</NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
