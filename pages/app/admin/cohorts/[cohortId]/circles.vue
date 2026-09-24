<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import CohortCirclesWorkspace from '@/components/app/admin/cohorts/CohortCirclesWorkspace.vue'
import { Button } from '~/components/ui/button'

definePageMeta({
  title: 'Cohort Circles',
  description: 'Form and finalize cohort circles',
  requiresAuth: true,
  permissions: ['admin:program-cohorts'],
})

const route = useRoute()
const router = useRouter()
const cohortId = computed(() => String(route.params.cohortId || ''))
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push(`/app/admin/cohorts/${cohortId}`)">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to cohort
    </Button>

    <div class="sr-only">
      Form circles. Circles in this cohort. Confirm circles as final.
    </div>

    <CohortCirclesWorkspace :cohort-id="cohortId" />
  </div>
</template>
