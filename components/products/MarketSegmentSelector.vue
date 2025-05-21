<template>
  <div class="flex border rounded-lg p-1 w-fit">
    <Button
      v-for="segment in segments"
      :key="segment.value"
      @click="handleSegmentChange(segment.value)"
      :variant="modelValue === segment.value ? 'default' : 'ghost'"
      class="rounded-md px-3"
    >
      <component 
        :is="segment.icon" 
        v-if="segment.icon" 
        class="h-4 w-4 mr-2" 
      />
      {{ segment.label }}
    </Button>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { 
  HomeIcon, 
  BuildingIcon, 
  LandmarkIcon, 
  LayoutGridIcon 
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  segments: {
    type: Array,
    default: () => [
      { label: 'All Segments', value: 'all', icon: 'LayoutGridIcon' },
      { label: 'Residential', value: 'RESIDENTIAL', icon: 'HomeIcon' },
      { label: 'Business', value: 'BUSINESS', icon: 'BuildingIcon' },
      { label: 'Enterprise', value: 'ENTERPRISE', icon: 'BuildingIcon' }
    ]
  }
})

const emit = defineEmits(['update:modelValue', 'segment-change'])


const components = {
  HomeIcon,
  BuildingIcon,
  LandmarkIcon,
  LayoutGridIcon
}

const handleSegmentChange = (segmentValue) => {
  emit('update:modelValue', segmentValue)
  emit('segment-change', segmentValue)
}
</script>