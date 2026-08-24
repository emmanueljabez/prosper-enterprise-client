<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { Textarea } from '~/components/ui/textarea'
import { ArrowLeft, CheckCircle2, Link, RefreshCw } from 'lucide-vue-next'

definePageMeta({
  title: 'Join Cohort',
  description: 'Join a company program cohort with a code',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const route = useRoute()
const cohortsStore = useCompanyProgramCohortsStore()
const toast = useAppToast()
const { joinPreview, isLoading, isSaving, error } = storeToRefs(cohortsStore)
const joinCode = ref(String(route.query.code || ''))
const submitted = ref(false)
const joinForm = reactive({
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  chapter: '',
  region: '',
  interestTags: '',
})

const splitTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

const loadJoinPreview = async () => {
  const code = joinCode.value.trim()
  if (!code) {
    toast.error('Enter a cohort join code')
    return
  }

  try {
    await cohortsStore.loadJoinPreview(code)
  } catch (previewError: any) {
    toast.error(previewError?.response?.data?.message || previewError?.message || 'Failed to load cohort preview')
  }
}

const submitSelfJoin = async () => {
  const code = joinCode.value.trim()
  if (!code) {
    toast.error('Enter a cohort join code')
    return
  }

  if (!joinForm.email.trim()) {
    toast.error('Email is required')
    return
  }

  if (!joinForm.firstName.trim() || !joinForm.lastName.trim()) {
    toast.error('First and last name are required')
    return
  }

  try {
    await cohortsStore.submitSelfJoin(code, {
      email: joinForm.email.trim(),
      phone: joinForm.phone.trim() || null,
      firstName: joinForm.firstName.trim() || null,
      lastName: joinForm.lastName.trim() || null,
      chapter: joinForm.chapter.trim() || null,
      region: joinForm.region.trim() || null,
      interestTags: splitTags(joinForm.interestTags),
    })
    submitted.value = true
    toast.success('Cohort join request submitted.')
  } catch (joinError: any) {
    toast.error(joinError?.response?.data?.message || joinError?.message || 'Failed to submit cohort join request')
  }
}

watch(() => route.query.code, value => {
  joinCode.value = String(value || '')
  if (joinCode.value) {
    loadJoinPreview()
  }
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto max-w-4xl space-y-6 px-4 py-6">
    <div class="space-y-1">
      <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="navigateTo('/app/employee/cohorts')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to cohorts
      </Button>
      <h1 class="text-2xl font-semibold tracking-tight">Join a cohort</h1>
      <p class="text-sm text-muted-foreground">
        Enter the code shared by your program coordinator to join the right cohort cycle.
      </p>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>Join Code</CardTitle>
        <CardDescription>Preview the cohort before submitting your intake details.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3 sm:grid-cols-[1fr,auto]">
        <Input v-model="joinCode" placeholder="G4G-NAIROBI-Q3-2026" @keyup.enter="loadJoinPreview" />
        <Button :disabled="isLoading" @click="loadJoinPreview">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Preview cohort
        </Button>
      </CardContent>
    </Card>

    <Skeleton v-if="isLoading && !joinPreview" class="h-40 w-full" />

    <Card v-if="joinPreview">
      <CardHeader>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{{ joinPreview.cohortName }}</CardTitle>
            <CardDescription>{{ joinPreview.companyProgramName || joinPreview.companyName || 'Company mentorship cohort' }}</CardDescription>
          </div>
          <Badge variant="outline">{{ joinPreview.cohortStatus }}</Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="grid gap-3 md:grid-cols-3">
          <div class="join-fact">
            <span>Chapter</span>
            <strong>{{ joinPreview.chapter || '-' }}</strong>
          </div>
          <div class="join-fact">
            <span>Region</span>
            <strong>{{ joinPreview.region || '-' }}</strong>
          </div>
          <div class="join-fact">
            <span>Status</span>
            <strong>{{ joinPreview.status || 'Ready for intake' }}</strong>
          </div>
        </div>

        <div v-if="joinPreview.interestTagSet?.length" class="flex flex-wrap gap-2">
          <span v-for="tag in joinPreview.interestTagSet" :key="tag" class="interest-chip">{{ tag }}</span>
        </div>

        <div v-if="submitted" class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 class="mr-2 inline h-4 w-4" />
          Your cohort join request has been submitted.
        </div>

        <div v-else class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Email</label>
              <Input v-model="joinForm.email" type="email" placeholder="amina@example.com" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Phone</label>
              <Input v-model="joinForm.phone" placeholder="+254..." />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">First name</label>
              <Input v-model="joinForm.firstName" placeholder="Amina" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Last name</label>
              <Input v-model="joinForm.lastName" placeholder="Otieno" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Chapter</label>
              <Input v-model="joinForm.chapter" placeholder="Nairobi" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Region</label>
              <Input v-model="joinForm.region" placeholder="Kenya" />
            </div>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Interest tags</label>
            <Textarea v-model="joinForm.interestTags" placeholder="STEM, career readiness, public speaking" />
            <p class="text-xs text-muted-foreground">These tags help the program team place you into a relevant common-interest circle.</p>
          </div>

          <Button :disabled="isSaving" @click="submitSelfJoin">
            <Link class="mr-2 h-4 w-4" />
            Submit join request
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.join-fact {
  display: grid;
  gap: 4px;
  border: 1px solid #ead2e4;
  border-radius: 8px;
  padding: 12px;
}

.join-fact span {
  color: #7a6d78;
  font-size: 12px;
  font-weight: 600;
}

.join-fact strong {
  color: #2f2930;
  font-size: 14px;
}

.interest-chip {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: 999px;
  background: #e8f6f1;
  color: #0d6f51;
  font-size: 11px;
  font-weight: 700;
  padding: 0 9px;
}
</style>
