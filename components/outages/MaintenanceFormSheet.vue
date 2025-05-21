<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>{{ mode === 'add' ? 'Schedule Maintenance' : 'Update Maintenance' }}</SheetTitle>
        <SheetDescription>
          {{ mode === 'add' ? 'Schedule planned network maintenance or service updates' : 'Update maintenance details' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <!-- Basic Details -->
        <div class="space-y-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="form.title" required placeholder="Brief title describing the maintenance" />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" required placeholder="Detailed description including purpose and customer impact" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="maintenanceType">Maintenance Type</Label>
            <Select id="maintenanceType" v-model="form.maintenanceType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="preventative">Preventative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="impact">Expected Impact</Label>
            <Select id="impact" v-model="form.impact" required>
              <SelectTrigger>
                <SelectValue placeholder="Select impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="major">Major</SelectItem>
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

        <!-- Schedule Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="scheduledStart">Start Time</Label>
            <Input id="scheduledStart" v-model="form.scheduledStart" type="datetime-local" required />
          </div>

          <div class="space-y-2">
            <Label for="scheduledEnd">End Time</Label>
            <Input id="scheduledEnd" v-model="form.scheduledEnd" type="datetime-local" required />
          </div>
        </div>

        <!-- Affected Areas -->
        <div class="space-y-2">
          <Label>Affected Areas</Label>
          <TagInput v-model="form.affectedAreas" placeholder="Add area and press Enter" />
          <p class="text-xs text-muted-foreground">Add regions or neighborhoods affected by the maintenance</p>
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
          <Label>Maintenance Location</Label>
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

        <!-- Technician Assignment -->
        <div class="space-y-2">
          <Label for="technicianAssigned">Technician/Team Assigned</Label>
          <Input id="technicianAssigned" v-model="form.technicianAssigned" placeholder="Technician or team responsible" />
        </div>

        <!-- Notification Status -->
        <div class="flex items-center space-x-2">
          <Checkbox id="notificationSent" v-model:checked="form.notificationSent" />
          <Label for="notificationSent">Customer notification has been sent</Label>
        </div>

        <div class="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button type="submit">{{ mode === 'add' ? 'Schedule Maintenance' : 'Update Maintenance' }}</Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  maintenance: {
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
  maintenanceType: 'planned',
  impact: 'minor',
  serviceType: 'fiber',
  affectedAreas: [],
  affectedServices: [],
  estimatedCustomersAffected: 0,
  scheduledStart: '',
  scheduledEnd: '',
  status: 'scheduled',
  notificationSent: false,
  technicianAssigned: '',
  latitude: null,
  longitude: null
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

// Watch for maintenance prop changes
watch(() => props.maintenance, (newMaintenance) => {
  if (newMaintenance) {
    // Fill form with maintenance data
    form.value = {
      id: newMaintenance.id,
      title: newMaintenance.title || '',
      description: newMaintenance.description || '',
      maintenanceType: newMaintenance.maintenanceType || 'planned',
      impact: newMaintenance.impact || 'minor',
      serviceType: newMaintenance.serviceType || 'fiber',
      affectedAreas: [...(newMaintenance.affectedAreas || [])],
      affectedServices: [...(newMaintenance.affectedServices || [])],
      estimatedCustomersAffected: newMaintenance.estimatedCustomersAffected || 0,
      scheduledStart: newMaintenance.scheduledStart || '',
      scheduledEnd: newMaintenance.scheduledEnd || '',
      status: newMaintenance.status || 'scheduled',
      notificationSent: newMaintenance.notificationSent || false,
      technicianAssigned: newMaintenance.technicianAssigned || '',
      latitude: newMaintenance.latitude || null,
      longitude: newMaintenance.longitude || null
    }

    // Set service checkboxes
    internetAffected.value = newMaintenance.affectedServices?.includes('Internet') || false
    voipAffected.value = newMaintenance.affectedServices?.includes('VoIP') || false
    iptvAffected.value = newMaintenance.affectedServices?.includes('IPTV') || false
    vpnAffected.value = newMaintenance.affectedServices?.includes('VPN') || false
    dnsAffected.value = newMaintenance.affectedServices?.includes('DNS Resolution') || false
  } else {
    // Reset form for new maintenance
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(1, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(5, 0, 0, 0)

  form.value = {
    id: '',
    title: '',
    description: '',
    maintenanceType: 'planned',
    impact: 'minor',
    serviceType: 'fiber',
    affectedAreas: [],
    affectedServices: [],
    estimatedCustomersAffected: 0,
    scheduledStart: tomorrow.toISOString().slice(0, 16),
    scheduledEnd: tomorrowEnd.toISOString().slice(0, 16),
    status: 'scheduled',
    notificationSent: false,
    technicianAssigned: '',
    latitude: null,
    longitude: null
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