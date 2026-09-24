<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CircleDot, ClipboardCheck, RefreshCw, Shuffle, UserPlus } from 'lucide-vue-next'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type {
  CircleSuggestionRecord,
  CommonInterestCircleRecord,
  CommonInterestCircleMemberRecord,
  CompanyProgramCohortParticipantRecord,
} from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import { DatePicker } from '@/components/ui/date-picker'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

type CircleFormModel = {
  name: string
  theme: string
  interestTags: string
  facilitatorProfileId: string
  minSize: number | null
  maxSize: number | null
  nextSessionAt: string
}

const props = defineProps<{
  cohortId: string
}>()

const cohortsStore = useCompanyProgramCohortsStore()
const toast = useAppToast()

const {
  selectedCohort,
  participants,
  circles,
  suggestions,
  dashboard,
  isLoading,
  isSaving,
  error,
} = storeToRefs(cohortsStore)

const isCreateCircleDialogOpen = ref(false)
const addMenteesCircleId = ref<string | null>(null)
const membershipTargetCircleId = reactive<Record<string, string>>({})
const newCircle = reactive<CircleFormModel>({
  name: '',
  theme: '',
  interestTags: '',
  facilitatorProfileId: '',
  minSize: 5,
  maxSize: 10,
  nextSessionAt: '',
})

const activeParticipants = computed(() =>
  participants.value.filter(participant => !['REJECTED', 'WITHDRAWN'].includes(participant.status)),
)

const placedParticipantIds = computed(() => {
  const ids = new Set<string>()
  for (const circle of circles.value) {
    for (const member of circle.members || []) {
      if (member.status !== 'REMOVED') {
        ids.add(member.cohortParticipantId)
      }
    }
  }
  return ids
})

const circleEligibleParticipants = computed(() =>
  activeParticipants.value.filter(participant =>
    ['CONFIRMED', 'PLENARY_ATTENDED', 'PLACED_IN_CIRCLE', 'ELIGIBLE_FOR_MATCHING', 'MATCHED', 'ACTIVE', 'COMPLETED'].includes(participant.status),
  ),
)

const unplacedParticipants = computed(() =>
  circleEligibleParticipants.value.filter(participant => !placedParticipantIds.value.has(participant.id)),
)

const unplacedParticipantsEmptyCopy = computed(() => {
  if (!activeParticipants.value.length) {
    return 'No active mentees are in this cohort yet. Add participants from the cohort intake workspace first.'
  }
  if (!circleEligibleParticipants.value.length) {
    return 'No mentees are ready for circle placement yet. Confirm intake and plenary attendance first.'
  }
  return 'Every circle-ready participant is placed.'
})

const addMenteesCircle = computed(() =>
  circles.value.find(circle => circle.id === addMenteesCircleId.value) || null,
)

const addMenteesDialogOpen = computed({
  get: () => Boolean(addMenteesCircle.value),
  set: (open: boolean) => {
    if (!open) closeAddMenteesDialog()
  },
})

const circleCapacityLabel = computed(() =>
  `${selectedCohort.value?.circleMinSize || 5}-${selectedCohort.value?.circleMaxSize || 10}`,
)

const canFinalizeCircles = computed(() =>
  Boolean(circles.value.length)
  && Boolean(circleEligibleParticipants.value.length)
  && !unplacedParticipants.value.length,
)

const participantName = (participant?: CompanyProgramCohortParticipantRecord | null) =>
  participant?.profileName || participant?.profileEmail || participant?.profilePhone || 'Cohort participant'

const memberName = (member: CommonInterestCircleMemberRecord) =>
  member.profileName || member.profileEmail || 'Circle member'

const statusLabel = (status?: string | null) =>
  status ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Unknown'

const splitTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null

const optionalNumber = (value: number | string | null) => {
  if (value === null || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const loadWorkspace = async () => {
  if (!props.cohortId) return

  try {
    await Promise.all([
      cohortsStore.loadCohort(props.cohortId),
      cohortsStore.loadParticipants(props.cohortId),
      cohortsStore.loadCircles(props.cohortId),
      cohortsStore.loadDashboard(props.cohortId),
    ])
  } catch (workspaceError: any) {
    toast.error(workspaceError?.response?.data?.message || workspaceError?.message || 'Failed to load circles workspace')
  }
}

const refreshAfterMutation = async () => {
  await Promise.all([
    cohortsStore.loadCohort(props.cohortId),
    cohortsStore.loadParticipants(props.cohortId),
    cohortsStore.loadCircles(props.cohortId),
    cohortsStore.loadDashboard(props.cohortId),
  ])
}

const suggestCircles = async () => {
  if (!props.cohortId) return

  try {
    await cohortsStore.suggestCircles(props.cohortId)
    toast.success('Circle suggestions refreshed.')
  } catch (suggestionError: any) {
    toast.error(suggestionError?.response?.data?.message || suggestionError?.message || 'Failed to suggest circles')
  }
}

const resetCircleForm = () => {
  newCircle.name = ''
  newCircle.theme = ''
  newCircle.interestTags = ''
  newCircle.facilitatorProfileId = ''
  newCircle.minSize = selectedCohort.value?.circleMinSize ?? 5
  newCircle.maxSize = selectedCohort.value?.circleMaxSize ?? 10
  newCircle.nextSessionAt = ''
}

const openCreateCircleDialog = () => {
  resetCircleForm()
  isCreateCircleDialogOpen.value = true
}

const closeCreateCircleDialog = () => {
  isCreateCircleDialogOpen.value = false
  resetCircleForm()
}

const openAddMenteesDialog = (circleId: string) => {
  addMenteesCircleId.value = circleId
}

function closeAddMenteesDialog() {
  addMenteesCircleId.value = null
}

const createCircle = async () => {
  if (!props.cohortId) return

  if (!newCircle.name.trim()) {
    toast.error('Circle name is required')
    return
  }

  try {
    await cohortsStore.createCircle(props.cohortId, {
      name: newCircle.name.trim(),
      theme: newCircle.theme.trim() || null,
      interestTags: splitTags(newCircle.interestTags),
      facilitatorProfileId: newCircle.facilitatorProfileId.trim() || null,
      minSize: optionalNumber(newCircle.minSize),
      maxSize: optionalNumber(newCircle.maxSize),
      nextSessionAt: toIsoOrNull(newCircle.nextSessionAt),
    })
    closeCreateCircleDialog()
    toast.success('Circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create circle')
  }
}

const createCircleFromSuggestion = async (suggestion: CircleSuggestionRecord) => {
  if (!props.cohortId) return

  try {
    const circle = await cohortsStore.createCircle(props.cohortId, {
      name: suggestion.name,
      theme: suggestion.theme || null,
      interestTags: suggestion.interestTags || [],
      minSize: selectedCohort.value?.circleMinSize ?? null,
      maxSize: selectedCohort.value?.circleMaxSize ?? null,
    })

    for (const cohortParticipantId of suggestion.cohortParticipantIds || []) {
      await cohortsStore.placeParticipant(circle.id, {
        cohortParticipantId,
        placementSource: 'SUGGESTED',
      })
    }

    toast.success('Suggested circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create suggested circle')
  }
}

const placeParticipantInCircle = async (circleId: string, participant: CompanyProgramCohortParticipantRecord) => {
  if (!circleId) {
    toast.error('Choose a circle before adding this mentee')
    return
  }

  try {
    await cohortsStore.placeParticipant(circleId, {
      cohortParticipantId: participant.id,
      placementSource: 'ADMIN_PLACED',
    })
    toast.success('Mentee added to circle.')
    await refreshAfterMutation()
    if (!unplacedParticipants.value.length) {
      closeAddMenteesDialog()
    }
  } catch (placementError: any) {
    toast.error(placementError?.response?.data?.message || placementError?.message || 'Failed to add mentee to circle')
  }
}

const moveMembership = async (membershipId: string) => {
  const targetCircleId = membershipTargetCircleId[membershipId]
  if (!targetCircleId) {
    toast.error('Choose a target circle before moving this member')
    return
  }

  try {
    await cohortsStore.moveMembership(membershipId, { targetCircleId })
    membershipTargetCircleId[membershipId] = ''
    toast.success('Circle member moved.')
    await refreshAfterMutation()
  } catch (moveError: any) {
    toast.error(moveError?.response?.data?.message || moveError?.message || 'Failed to move circle member')
  }
}

const removeMembership = async (membershipId: string) => {
  try {
    await cohortsStore.removeMembership(membershipId)
    toast.success('Circle member removed.')
    await refreshAfterMutation()
  } catch (removeError: any) {
    toast.error(removeError?.response?.data?.message || removeError?.message || 'Failed to remove circle member')
  }
}

const finalizeCircles = async () => {
  if (!props.cohortId) return

  try {
    await cohortsStore.finalizeCircles(props.cohortId)
    toast.success('Circles finalized.')
    await refreshAfterMutation()
  } catch (finalizeError: any) {
    toast.error(finalizeError?.response?.data?.message || finalizeError?.message || 'Failed to finalize circles')
  }
}

watch(() => props.cohortId, loadWorkspace, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-[#9a4884]">Form circles</p>
        <h2 class="text-2xl font-semibold tracking-tight">Circles workspace</h2>
        <p class="text-sm text-muted-foreground">
          Group attendees into common-interest circles of {{ circleCapacityLabel }} before 1:1 matching.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="isLoading" @click="loadWorkspace">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" :disabled="isSaving" @click="openCreateCircleDialog">
          <CircleDot class="mr-2 h-4 w-4" />
          Create circle
        </Button>
        <Button variant="outline" :disabled="isSaving || isLoading" @click="suggestCircles">
          <Shuffle class="mr-2 h-4 w-4" />
          Refresh suggestions
        </Button>
        <Button :disabled="isSaving || !canFinalizeCircles" @click="finalizeCircles">
          <ClipboardCheck class="mr-2 h-4 w-4" />
          Confirm circles as final
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Circle-ready mentees</CardDescription>
          <CardTitle class="text-3xl">{{ circleEligibleParticipants.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Placed mentees</CardDescription>
          <CardTitle class="text-3xl">{{ placedParticipantIds.size }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Circles</CardDescription>
          <CardTitle class="text-3xl">{{ dashboard?.circleCount ?? circles.length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Alert v-if="unplacedParticipants.length">
      <AlertDescription>
        {{ unplacedParticipants.length }} participants are not placed in a circle yet.
      </AlertDescription>
    </Alert>

    <div class="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Unplaced participants</CardTitle>
          <CardDescription>Place each confirmed attendee into a common-interest circle.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="!unplacedParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {{ unplacedParticipantsEmptyCopy }}
          </div>
          <div v-for="participant in unplacedParticipants" v-else :key="participant.id" class="rounded-lg border p-3">
            <div class="font-medium">{{ participantName(participant) }}</div>
            <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
            <div class="mt-2 flex flex-wrap gap-1">
              <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
              <span v-if="!participant.interestTags?.length" class="text-xs text-muted-foreground">No interest tags</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card v-if="suggestions?.suggestedCircles?.length">
          <CardHeader>
            <CardTitle>Suggested groupings</CardTitle>
            <CardDescription>Suggestions are based on shared interest tags.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="suggestion in suggestions.suggestedCircles" :key="suggestion.name" class="rounded-lg border p-3">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div class="font-medium">{{ suggestion.name }}</div>
                  <div class="mt-1 text-xs text-muted-foreground">
                    {{ suggestion.participantCount }} participants | {{ suggestion.participantNames.join(', ') }}
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span v-for="tag in suggestion.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" :disabled="isSaving" @click="createCircleFromSuggestion(suggestion)">
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circles in this cohort</CardTitle>
            <CardDescription>Review membership, move participants, or remove placements before finalizing.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="!circles.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No circles have been created yet.
            </div>

            <div v-for="circle in circles" v-else :key="circle.id" class="circle-panel">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div class="font-semibold">{{ circle.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ circle.memberCount || 0 }} members | {{ circle.theme || 'No theme set' }}
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge :variant="circle.memberCount < (circle.minSize || selectedCohort?.circleMinSize || 5) ? 'outline' : 'secondary'">
                    {{ circle.memberCount || 0 }} / {{ circle.minSize || selectedCohort?.circleMinSize || 5 }}-{{ circle.maxSize || selectedCohort?.circleMaxSize || 10 }}
                  </Badge>
                  <Button size="sm" variant="outline" :disabled="isSaving || !unplacedParticipants.length" @click="openAddMenteesDialog(circle.id)">
                    <UserPlus class="mr-2 h-4 w-4" />
                    Add mentees
                  </Button>
                </div>
              </div>

              <div class="mt-3 space-y-2">
                <div v-if="!(circle.members || []).length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No members placed yet.
                </div>
                <div v-for="member in circle.members || []" v-else :key="member.membershipId" class="circle-member-row">
                  <div>
                    <div class="font-medium">{{ memberName(member) }}</div>
                    <div class="text-xs text-muted-foreground">{{ statusLabel(member.placementSource) }}</div>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-[180px,auto,auto]">
                    <Select v-model="membershipTargetCircleId[member.membershipId]">
                      <SelectTrigger>
                        <SelectValue placeholder="Move to" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="targetCircle in circles.filter((item: CommonInterestCircleRecord) => item.id !== circle.id)"
                          :key="targetCircle.id"
                          :value="targetCircle.id"
                        >
                          {{ targetCircle.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" :disabled="isSaving || !membershipTargetCircleId[member.membershipId]" @click="moveMembership(member.membershipId)">
                      Move
                    </Button>
                    <Button size="sm" variant="ghost" :disabled="isSaving" @click="removeMembership(member.membershipId)">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="isCreateCircleDialogOpen">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create circle</DialogTitle>
          <DialogDescription>Add a new common-interest circle manually.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Circle name</label>
              <Input v-model="newCircle.name" placeholder="STEM Risers" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Theme</label>
              <Input v-model="newCircle.theme" placeholder="STEM" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Min size</label>
              <Input v-model="newCircle.minSize" type="number" min="1" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Max size</label>
              <Input v-model="newCircle.maxSize" type="number" min="1" />
            </div>
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">Interest tags</label>
            <Input v-model="newCircle.interestTags" placeholder="STEM, career readiness" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">Next session</label>
            <DatePicker
              v-model="newCircle.nextSessionAt"
              :include-time="true"
              placeholder="Select next circle session"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="closeCreateCircleDialog">
            Cancel
          </Button>
          <Button :disabled="isSaving" @click="createCircle">
            <CircleDot class="mr-2 h-4 w-4" />
            Create circle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="addMenteesDialogOpen">
      <DialogContent v-if="addMenteesCircle" class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add mentees</DialogTitle>
          <DialogDescription>
            Add unplaced mentees to {{ addMenteesCircle.name }}.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div v-if="!unplacedParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {{ unplacedParticipantsEmptyCopy }}
          </div>
          <div v-for="participant in unplacedParticipants" v-else :key="participant.id" class="rounded-lg border p-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="font-medium">{{ participantName(participant) }}</div>
                <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                  <span v-if="!participant.interestTags?.length" class="text-xs text-muted-foreground">No interest tags</span>
                </div>
              </div>
              <Button size="sm" :disabled="isSaving" @click="placeParticipantInCircle(addMenteesCircle.id, participant)">
                <UserPlus class="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeAddMenteesDialog">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.mini-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  background: #fbf6fa;
  color: #6f2d66;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 0 8px;
}

.circle-panel {
  border: 1px solid #ead2e4;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.circle-member-row {
  display: grid;
  gap: 12px;
  align-items: center;
  border: 1px solid #f0e2eb;
  border-radius: 8px;
  padding: 10px;
}

@media (min-width: 768px) {
  .circle-member-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>
