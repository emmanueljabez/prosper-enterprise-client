<script setup lang="ts">
definePageMeta({
  title: 'Tracking',
  description: 'Exportable row-based mentorship tracking reports',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const reportLinkClass = 'text-blue-600 underline underline-offset-4 hover:text-blue-700'
</script>

<template>
  <div class="container mx-auto flex flex-col gap-6 px-4 py-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Tracking</h1>
    </div>

    <nav aria-label="Reports">
      <ul class="flex flex-col gap-3">
        <li>
          <NuxtLink to="/app/admin/reports/programs" :class="reportLinkClass">Program Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/participants" :class="reportLinkClass">Mentee Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/matches" :class="reportLinkClass">Matching Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/sessions" :class="reportLinkClass">Session Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/pulses" :class="reportLinkClass">Pulse Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/risk-signals" :class="reportLinkClass">Risk Signals Tracking</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/app/admin/reports/billing-transactions" :class="reportLinkClass">Finance Tracking</NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
