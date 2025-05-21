<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>{{ mode === 'add' ? 'Report Network Outage' : 'Update Outage' }}</SheetTitle>
        <SheetDescription>
          {{ mode === 'add' ? 'Report a new network outage or service disruption' : 'Update outage details and information' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <!-- Basic Details -->
        <div class="space-y-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="form.title" required placeholder="Brief title describing the outage" />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" required placeholder="Detailed description of the outage" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="severity">Severity</Label>
            <Select id="severity" v-model="form.severity" required>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="status">Status</Label>
            <Select id="status" v-model="form.status" required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="mitigated">Mitigated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="serviceType">Service Type</Label>
            <Select id="serviceType" v-model="form.serviceType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiber">Fiber</SelectItem>
                <SelectItem value="wireless">Wireless</SelectItem>
                <SelectItem value="backbone">Backbone/Core</SelectItem>
                <SelectItem value="data_center">Data Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="estimatedCustomersAffected">Est. Customers Affected</Label>
            <Input id="estimatedCustomersAffected" v-model.number="form.estimatedCustomersAffected" type="number" min="0" />
          </div>
        </div>

        <!-- Affected Areas -->
        <div class="space-y-2">
          <Label>Affected Areas</Label>
          <TagInput v-model="form.affectedAreas" placeholder="Add area and press Enter" />
          <p class="text-xs text-muted-foreground">Add regions or neighborhoods affected by the outage</p>
        </div>

        <!-- Affected Services -->
        <div class="space-y-2">
          <Label>Affected Services</Label>
          <div class="flex flex-wrap gap-2">
            <Checkbox id="service-internet" v-model:checked="internetAffected" />
            <Label for="service-internet" class="text-sm">Internet</Label>

            <Checkbox id="service-voip" v-model:checked="voipAffected" />
            <Label for="service-voip" class="text-sm">VoIP</Label>

            <Checkbox id="service-iptv" v-model:checked="iptvAffected" />
            <Label for="service-iptv" class="text-sm">IPTV</Label>

            <Checkbox id="service-vpn" v-model:checked="vpnAffected" />
            <Label for="service-vpn" class="text-sm">VPN</Label>

            <Checkbox id="service-dns" v-model:checked="dnsAffected" />
            <Label for="service-dns" class="text-sm">DNS</Label>
          </div>
        </div>

        <!-- Location Information -->
        <div class="space-y-2" v-if="form.serviceType === 'fiber' || form.serviceType === 'wireless'">
          <Label>Outage Location</Label>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">Latitude</Label>
              <Input id="latitude" v-model.number="form.latitude" type="number" step="0.000001" placeholder="e.g. -1.286389" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">Longitude</Label>
              <Input id="longitude" v-model.number="form.longitude" type="number" step="0.000001" placeholder="e.g. 36.817223" />
            </div>
          </div>
        </div>

        <!-- Technician Dispatch -->
        <div class="flex items-center space-x-2">
          <Checkbox id="techniciansDispatched" v-model:checked="form.techniciansDispatched" />
          <Label for="techniciansDispatched">Technicians Dispatched</Label>
        </div>

        <!-- Resolution Time Estimate -->
        <div class="space-y-2">
          <Label for="estimatedResolutionTime">Estimated Resolution Time</Label>
          <Input id="estimatedResolutionTime" v-model="form.estimatedResolutionTime" type="datetime-local" />
        </div>

        <!-- Resolution Details (if resolved) -->
        <div v-if="form.status === 'resolved'" class="space-y-4 border-t pt-4">
          <h4 class="font-medium">Resolution Details</h4>

          <div class="space-y-2">
            <Label for="rootCause">Root Cause</Label>
            <Input id="rootCause" v-model="form.rootCause" placeholder="What caused the outage?" />
          </div>

          <div class="space-y-2">
            <Label for="resolution">Resolution</Label>
            <Textarea id="resolution" v-model="form.resolution" placeholder="How was the issue resolved?" />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button type="submit">{{ mode === 'add' ? 'Report Outage' : 'Update Outage' }}</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import TagInput from '@/components/common/TagInput.vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  },
  outage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const form = ref({
  id: '',
  title: '',
  description: '',
  severity: 'major',
  status: 'investigating',
  serviceType: 'fiber',
  affectedAreas: [],
  affectedServices: [],
  estimatedCustomersAffected: 0,
  startedAt: new Date().toISOString(),
  estimatedResolutionTime: '',
  techniciansDispatched: false,
  latitude: null,
  longitude: null,
  rootCause: '',
  resolution: ''
})

// Checkboxes for affected services
const internetAffected = ref(false)
const voipAffected = ref(false)
const iptvAffected = ref(false)
const vpnAffected = ref(false)
const dnsAffected = ref(false)

// Watch service checkboxes and update form
watch([internetAffected, voipAffected, iptvAffected, vpnAffected, dnsAffected], () => {
  form.value.affectedServices = []
  if (internetAffected.value) form.value.affectedServices.push('Internet')
  if (voipAffected.value) form.value.affectedServices.push('VoIP')
  if (iptvAffected.value) form.value.affectedServices.push('IPTV')
  if (vpnAffected.value) form.value.affectedServices.push('VPN')
  if (dnsAffected.value) form.value.affectedServices.push('DNS Resolution')
})

// Watch for outage prop changes
watch(() => props.outage, (newOutage) => {
  if (newOutage) {
    // Fill form with outage data
    form.value = {
      id: newOutage.id,
      title: newOutage.title || '',
      description: newOutage.description || '',
      severity: newOutage.severity || 'major',
      status: newOutage.status || 'investigating',
      serviceType: newOutage.serviceType || 'fiber',
      affectedAreas: [...(newOutage.affectedAreas || [])],
      affectedServices: [...(newOutage.affectedServices || [])],
      estimatedCustomersAffected: newOutage.estimatedCustomersAffected || 0,
      startedAt: newOutage.startedAt || new Date().toISOString(),
      estimatedResolutionTime: newOutage.estimatedResolutionTime || '',
      techniciansDispatched: newOutage.techniciansDispatched || false,
      latitude: newOutage.latitude || null,
      longitude: newOutage.longitude || null,
      rootCause: newOutage.rootCause || '',
      resolution: newOutage.resolution || ''
    }

    // Set service checkboxes
    internetAffected.value = newOutage.affectedServices?.includes('Internet') || false
    voipAffected.value = newOutage.affectedServices?.includes('VoIP') || false
    iptvAffected.value = newOutage.affectedServices?.includes('IPTV') || false
    vpnAffected.value = newOutage.affectedServices?.includes('VPN') || false
    dnsAffected.value = newOutage.affectedServices?.includes('DNS Resolution') || false
  } else {
    // Reset form for new outage
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    id: '',
    title: '',
    description: '',
    severity: 'major',
    status: 'investigating',
    serviceType: 'fiber',
    affectedAreas: [],
    affectedServices: [],
    estimatedCustomersAffected: 0,
    startedAt: new Date().toISOString(),
    estimatedResolutionTime: '',
    techniciansDispatched: false,
    latitude: null,
    longitude: null,
    rootCause: '',
    resolution: ''
  }

  internetAffected.value = false
  voipAffected.value = false
  iptvAffected.value = false
  vpnAffected.value = false
  dnsAffected.value = false
}

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>