<script setup lang="ts">
import { ArrowRight, CalendarCheck2, GitBranch, Target, Users } from 'lucide-vue-next'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  title: 'Cohorts & Circles',
  description: 'Organize mentees into cohorts and mentorship circles.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const cohortMetrics = [
  { label: 'Program intake', value: 'By program', helper: 'Create cohorts from active programs' },
  { label: 'Peer circles', value: 'By topic', helper: 'Group mentees around shared goals' },
  { label: 'Matching readiness', value: 'Before launch', helper: 'Prepare participants for mentor assignment' },
]

const setupSteps = [
  {
    title: 'Choose the program',
    description: 'Start with the program objective, audience, and journey so every cohort has a clear outcome.',
    action: 'Go to Programs',
    to: '/app/admin/programs',
    icon: Target,
  },
  {
    title: 'Add mentees',
    description: 'Invite or import mentees, then confirm department, seniority, and availability context.',
    action: 'Manage Mentees',
    to: '/app/admin/employees',
    icon: Users,
  },
  {
    title: 'Prepare matching',
    description: 'Use cohort context to review mentor capacity and one-to-one matching readiness.',
    action: 'Review Matching',
    to: '/app/admin/matches',
    icon: GitBranch,
  },
]

const operatingChecks = [
  'Program objective and target audience are confirmed.',
  'Mentee list, departments, and availability context are current.',
  'Mentor capacity is ready before one-to-one matching starts.',
  'Plenary, group, and one-to-one sessions have an owner and timeline.',
]
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <Badge variant="secondary" class="mb-3">People Management</Badge>
        <h1 class="text-2xl font-semibold tracking-tight">Cohorts &amp; Circles</h1>
        <p class="max-w-3xl text-sm text-muted-foreground">
          Organize mentees into launch groups, peer circles, and delivery cohorts before matching and session delivery.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button @click="navigateTo('/app/admin/programs')">
          Launch Cohort
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" @click="navigateTo('/app/admin/employees')">
          Manage Mentees
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="metric in cohortMetrics" :key="metric.label">
        <CardHeader class="pb-2">
          <CardDescription>{{ metric.label }}</CardDescription>
          <CardTitle class="text-2xl">{{ metric.value }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ metric.helper }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Cohort Setup</CardTitle>
          <CardDescription>
            Use the existing program, mentee, and matching workspaces to prepare each cohort without creating duplicate records.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <button
            v-for="step in setupSteps"
            :key="step.title"
            type="button"
            class="flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-muted/40"
            @click="navigateTo(step.to)"
          >
            <span class="rounded-md bg-primary/10 p-2 text-primary">
              <component :is="step.icon" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-foreground">{{ step.title }}</span>
              <span class="mt-1 block text-sm text-muted-foreground">{{ step.description }}</span>
              <span class="mt-3 inline-flex items-center text-sm font-medium text-primary">
                {{ step.action }}
                <ArrowRight class="ml-1 h-4 w-4" />
              </span>
            </span>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching readiness</CardTitle>
          <CardDescription>
            A cohort is ready when the people, program, mentor, and session context are all aligned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-3">
            <li v-for="check in operatingChecks" :key="check" class="flex gap-3 text-sm">
              <CalendarCheck2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span class="text-muted-foreground">{{ check }}</span>
            </li>
          </ul>
          <Button variant="outline" class="mt-5 w-full" @click="navigateTo('/app/admin/reports')">
            View Tracking
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
