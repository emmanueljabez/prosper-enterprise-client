<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'radix-vue'
import { watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<DialogRootProps>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

// More conservative cleanup function: only reset body styles, do not remove DOM nodes
const cleanupOverlays = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  document.body.style.pointerEvents = ''
  document.body.style.touchAction = ''
  document.body.classList.remove('overflow-hidden')
  // Do NOT remove overlay/portal/dialog elements here; let Vue/Radix handle it
}

// Watch for dialog closing
watch(() => props.open, (isOpen, oldIsOpen) => {
  if (oldIsOpen && !isOpen) {
    // Run cleanup after animation finishes
    setTimeout(cleanupOverlays, 300)
  }
}, { immediate: true })

// Run cleanup on mount to handle any leftover elements
onMounted(() => {
  nextTick(cleanupOverlays)
})

// Run cleanup on unmount
onUnmounted(cleanupOverlays)
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>