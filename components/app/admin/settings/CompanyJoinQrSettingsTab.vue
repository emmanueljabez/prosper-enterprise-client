<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { useCompanyStore } from '~/store/modules/company'
import { useAppToast } from '~/composables/services/toastService'
import { buildCompanyJoinQrDataUrl, downloadCompanyJoinQrPdf } from '~/utils/companyJoinQrPdf'
import { AlertCircle, Copy, Download, LinkIcon, QrCode, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  companyId: string
  companyName: string
  canManage: boolean
}>()

const companyStore = useCompanyStore()
const toast = useAppToast()
const { companyJoinLink, companyJoinLinkLoading } = storeToRefs(companyStore)

const qrCodeDataUrl = ref('')
const qrCodeError = ref('')
const isDownloadingQrPdf = ref(false)

const companyJoinLinkRecord = computed(() => companyJoinLink.value)

const renderCompanyJoinQr = async () => {
  qrCodeDataUrl.value = ''
  qrCodeError.value = ''

  if (!companyJoinLinkRecord.value?.joinUrl) {
    return
  }

  try {
    qrCodeDataUrl.value = await buildCompanyJoinQrDataUrl(companyJoinLinkRecord.value.joinUrl)
  } catch (error: any) {
    qrCodeError.value = error?.message || 'Failed to generate QR code'
    toast.error(qrCodeError.value)
  }
}

const loadQrLink = async () => {
  if (!props.canManage || !props.companyId) {
    return
  }

  try {
    await companyStore.loadCompanyJoinLink(props.companyId)
    await renderCompanyJoinQr()
  } catch {
    // Company store already handles toast feedback.
  }
}

const regenerateQrLink = async () => {
  if (!props.companyId) {
    toast.error('Company context is missing')
    return
  }

  try {
    await companyStore.regenerateCompanyJoinLink(props.companyId)
    await renderCompanyJoinQr()
  } catch {
    // Company store already handles toast feedback.
  }
}

const copyJoinLink = async () => {
  if (!companyJoinLinkRecord.value?.joinUrl) {
    return
  }

  try {
    await navigator.clipboard.writeText(companyJoinLinkRecord.value.joinUrl)
    toast.success('Join link copied')
  } catch {
    toast.error('Failed to copy join link')
  }
}

const downloadQrPdf = async () => {
  if (!companyJoinLinkRecord.value?.joinUrl || !qrCodeDataUrl.value) {
    toast.error('Generate the QR code before downloading')
    return
  }

  isDownloadingQrPdf.value = true
  try {
    await downloadCompanyJoinQrPdf({
      companyName: companyJoinLinkRecord.value.companyName || props.companyName || 'Prosper Mentor Company',
      joinUrl: companyJoinLinkRecord.value.joinUrl,
      qrDataUrl: qrCodeDataUrl.value,
    })
  } catch (error: any) {
    toast.error(error?.message || 'Failed to download QR PDF')
  } finally {
    isDownloadingQrPdf.value = false
  }
}

watch(() => props.companyId, async () => {
  qrCodeDataUrl.value = ''
  await loadQrLink()
})

onMounted(loadQrLink)
</script>

<template>
  <Card>
    <CardHeader class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <CardTitle>Join QR</CardTitle>
        <CardDescription>
          One QR code for mentors and mentees joining {{ companyName || 'your company' }}.
        </CardDescription>
      </div>
      <Button
        variant="outline"
        :disabled="companyJoinLinkLoading || !canManage || !companyId"
        @click="regenerateQrLink"
      >
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyJoinLinkLoading }" />
        Regenerate
      </Button>
    </CardHeader>

    <CardContent class="space-y-6">
      <Alert v-if="!canManage" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Corporate admin access is required to manage the company signup QR code.
        </AlertDescription>
      </Alert>

      <Alert v-else-if="!companyId" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Company context was not found in your session. Sign in again and retry.
        </AlertDescription>
      </Alert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div class="rounded-xl border border-[#ead4df] bg-muted/20 p-4">
          <div class="flex flex-col items-center justify-center gap-3">
            <div class="flex h-64 w-64 items-center justify-center rounded-lg border bg-white p-3">
              <img
                v-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                alt="Company join QR code"
                class="h-full w-full object-contain"
              >
              <div
                v-else-if="companyJoinLinkLoading"
                class="flex w-full flex-col items-center gap-3"
              >
                <Skeleton class="h-52 w-52 rounded-lg" />
                <span class="text-sm text-muted-foreground">Generating QR code...</span>
              </div>
              <div v-else class="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                <QrCode class="h-8 w-8" />
                <span>QR code preview unavailable</span>
              </div>
            </div>

            <div class="text-center">
              <div class="text-sm font-semibold text-slate-900">
                {{ companyJoinLinkRecord?.companyName || companyName || 'Company join link' }}
              </div>
              <div class="mt-1 text-xs text-muted-foreground">
                Reusable until regenerated
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div class="rounded-xl border bg-muted/30 p-4">
            <div class="flex items-start gap-3">
              <QrCode class="mt-0.5 h-5 w-5 shrink-0 text-[#8f1f74]" />
              <div class="space-y-1">
                <p class="text-sm font-semibold text-slate-900">
                  The same QR code supports mentor and mentee signup.
                </p>
                <p class="text-sm text-muted-foreground">
                  Share it with anyone in your organisation. They choose mentor or mentee on Prosper Mentor signup, verify their email, and then join the company automatically.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="company-join-link">Signup link</Label>
            <div class="flex gap-2">
              <div
                id="company-join-link"
                class="flex min-h-10 flex-1 items-center rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground break-all"
              >
                <LinkIcon class="mr-2 h-4 w-4 shrink-0" />
                {{ companyJoinLinkRecord?.joinUrl || 'Generating link...' }}
              </div>
              <Button variant="outline" size="icon" :disabled="!companyJoinLinkRecord?.joinUrl" @click="copyJoinLink">
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Alert v-if="qrCodeError" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ qrCodeError }}</AlertDescription>
          </Alert>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="outline"
              :disabled="companyJoinLinkLoading || !canManage || !companyId"
              @click="loadQrLink"
            >
              <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyJoinLinkLoading }" />
              Refresh QR
            </Button>
            <Button
              class="bg-[#8f1f74] text-white hover:bg-[#76185f]"
              :disabled="!qrCodeDataUrl || isDownloadingQrPdf"
              @click="downloadQrPdf"
            >
              <Download class="mr-2 h-4 w-4" />
              {{ isDownloadingQrPdf ? 'Preparing...' : 'Download PDF' }}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
