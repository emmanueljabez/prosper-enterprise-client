<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Network Diagnostic Results</DialogTitle>
        <DialogDescription>
          Results for customer ID: {{ results.customerId }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="py-10 flex flex-col items-center">
        <Spinner class="h-10 w-10 text-primary" />
        <div class="mt-4 text-muted-foreground">Running diagnostics...</div>
      </div>

      <div v-else-if="results" class="space-y-4 max-h-[60vh] overflow-y-auto">
        <!-- Summary -->
        <div class="bg-muted/50 p-3 rounded-md">
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <div class="text-sm text-muted-foreground">Connection Status:</div>
            <div class="text-sm font-medium">{{ results.connectionStatus }}</div>

            <div class="text-sm text-muted-foreground">Signal Strength:</div>
            <div class="text-sm font-medium">{{ results.signalStrength }}</div>

            <div class="text-sm text-muted-foreground">Download Speed:</div>
            <div class="text-sm font-medium">{{ results.downloadSpeed }}</div>

            <div class="text-sm text-muted-foreground">Upload Speed:</div>
            <div class="text-sm font-medium">{{ results.uploadSpeed }}</div>

            <div class="text-sm text-muted-foreground">Latency:</div>
            <div class="text-sm font-medium">{{ results.latency }}</div>

            <div class="text-sm text-muted-foreground">Packet Loss:</div>
            <div class="text-sm font-medium">{{ results.packetLoss }}</div>
          </div>
        </div>

        <!-- IP Details -->
        <div>
          <h3 class="text-sm font-medium mb-2">IP Details</h3>
          <div class="bg-muted/50 p-3 rounded-md">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div class="text-sm text-muted-foreground">Public IP:</div>
              <div class="text-sm font-medium">{{ results.ipDetails.publicIp }}</div>

              <div class="text-sm text-muted-foreground">Subnet Mask:</div>
              <div class="text-sm font-medium">{{ results.ipDetails.subnetMask }}</div>

              <div class="text-sm text-muted-foreground">Gateway:</div>
              <div class="text-sm font-medium">{{ results.ipDetails.gateway }}</div>

              <div class="text-sm text-muted-foreground">Primary DNS:</div>
              <div class="text-sm font-medium">{{ results.ipDetails.primaryDns }}</div>

              <div class="text-sm text-muted-foreground">Secondary DNS:</div>
              <div class="text-sm font-medium">{{ results.ipDetails.secondaryDns }}</div>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div>
          <h3 class="text-sm font-medium mb-2">Diagnostic Tests</h3>
          <div class="space-y-2">
            <div
                v-for="test in results.tests"
                :key="test.name"
                class="p-2 rounded-md"
                :class="{
                'bg-green-100': test.status === 'passed',
                'bg-amber-100': test.status === 'warning',
                'bg-red-100': test.status === 'failed'
              }"
            >
              <div class="flex justify-between items-center">
                <div class="text-sm font-medium">{{ test.name }}</div>
                <Badge :class="{
                  'bg-green-100 text-green-800': test.status === 'passed',
                  'bg-amber-100 text-amber-800': test.status === 'warning',
                  'bg-red-100 text-red-800': test.status === 'failed'
                }">
                  {{ test.status }}
                </Badge>
              </div>
              <div v-if="test.details" class="text-xs mt-1 text-muted-foreground">
                {{ test.details }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="recommendations.length > 0">
          <h3 class="text-sm font-medium mb-2">Recommendations</h3>
          <ul class="space-y-1 list-disc list-inside text-sm pl-2">
            <li v-for="(rec, index) in recommendations" :key="index">{{ rec }}</li>
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button @click="$emit('update:open', false)">Close</Button>
        <Button v-if="results" variant="outline" @click="printResults">
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Results
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PrinterIcon } from 'lucide-vue-next'
import Spinner from '@/components/ui/spinner.vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  results: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open'])

// Generate recommendations based on results
const recommendations = computed(() => {
  if (!props.results) return []

  const recs = []

  // Connection issues
  if (props.results.connectionStatus !== 'online') {
    recs.push('Check physical connections on the router and ONT.')
    recs.push('Verify power to all network devices.')
  }

  // Signal strength
  if (props.results.signalStrength === 'poor' || props.results.signalStrength === 'weak') {
    recs.push('Check for fiber optic cable damage or extreme bends.')
    recs.push('Inspect ONT for dust or damage.')
  }

  // Speed issues
  if (
      props.results.tests.find(t => t.name === 'Bandwidth Test' && t.status !== 'passed')
  ) {
    recs.push('Test speeds directly connected to the router via ethernet.')
    recs.push('Check for other devices consuming bandwidth on the network.')
    recs.push('Consider testing at different times of day to identify peak hour issues.')
  }

  // Packet loss
  if (parseFloat(props.results.packetLoss) > 1) {
    recs.push('High packet loss detected. Check for interference or line quality issues.')
  }

  return recs
})

// Print results
function printResults() {
  const printWindow = window.open('', '_blank')

  const content = `
    <html>
    <head>
      <title>Network Diagnostic Results - ${props.results.customerId}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .label { color: #777; }
        .value { font-weight: bold; }
        .test { padding: 8px; margin: 4px 0; border-radius: 4px; }
        .passed { background-color: #d1fae5; }
        .warning { background-color: #fef3c7; }
        .failed { background-color: #fee2e2; }
        .recommendations { padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Network Diagnostic Results</h1>
      <p>Customer ID: ${props.results.customerId}</p>
      <p>Timestamp: ${new Date(props.results.timestamp).toLocaleString()}</p>

      <div class="section">
        <h2>Connection Summary</h2>
        <div class="grid">
          <div class="label">Connection Status:</div>
          <div class="value">${props.results.connectionStatus}</div>

          <div class="label">Signal Strength:</div>
          <div class="value">${props.results.signalStrength}</div>

          <div class="label">Download Speed:</div>
          <div class="value">${props.results.downloadSpeed}</div>

          <div class="label">Upload Speed:</div>
          <div class="value">${props.results.uploadSpeed}</div>

          <div class="label">Latency:</div>
          <div class="value">${props.results.latency}</div>

          <div class="label">Packet Loss:</div>
          <div class="value">${props.results.packetLoss}</div>
        </div>
      </div>

      <div class="section">
        <h2>IP Details</h2>
        <div class="grid">
          <div class="label">Public IP:</div>
          <div class="value">${props.results.ipDetails.publicIp}</div>

          <div class="label">Subnet Mask:</div>
          <div class="value">${props.results.ipDetails.subnetMask}</div>

          <div class="label">Gateway:</div>
          <div class="value">${props.results.ipDetails.gateway}</div>

          <div class="label">Primary DNS:</div>
          <div class="value">${props.results.ipDetails.primaryDns}</div>

          <div class="label">Secondary DNS:</div>
          <div class="value">${props.results.ipDetails.secondaryDns}</div>
        </div>
      </div>

      <div class="section">
        <h2>Diagnostic Tests</h2>
        ${props.results.tests.map(test => `
          <div class="test ${test.status}">
            <div style="display: flex; justify-content: space-between;">
              <strong>${test.name}</strong>
              <span>${test.status}</span>
            </div>
            ${test.details ? `<div style="font-size: 0.9em; color: #555;">${test.details}</div>` : ''}
          </div>
        `).join('')}
      </div>

      ${recommendations.value.length > 0 ? `
        <div class="section">
          <h2>Recommendations</h2>
          <ul class="recommendations">
            ${recommendations.value.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: 30px; font-size: 0.8em; color: #777; text-align: center;">
        Generated by the ISP Ticket Management System
      </div>
    </body>
    </html>
  `

  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.setTimeout(() => {
    printWindow.print()
  }, 500)
}
</script>