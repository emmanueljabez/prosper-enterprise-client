<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'radix-vue'
import { watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<DialogRootProps>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

// Safe cleanup function that avoids DOM conflicts
const cleanupOverlays = () => {
  try {
    // Only cleanup if we're not in the middle of a Vue update
    if (document.querySelector('[data-radix-portal]')?.getAttribute('data-state') === 'closed') {
      // Reset body styles
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.style.pointerEvents = ''
      document.body.style.touchAction = ''
      document.body.classList.remove('overflow-hidden')
      
      // Only remove elements that are definitely closed and not being updated
      const closedElements = document.querySelectorAll('[data-state="closed"]')
      closedElements.forEach(el => {
        // Additional safety check to avoid removing elements Vue is still managing
        if (el.parentNode && !el.closest('[data-state="open"]')) {
          requestAnimationFrame(() => {
            if (el.parentNode && el.getAttribute('data-state') === 'closed') {
              el.remove()
            }
          })
        }
      })
    }
  } catch (error) {
    // Silently handle any DOM manipulation errors
    console.debug('Sheet cleanup error (non-critical):', error)
  }
}

// Watch for sheet closing with safer timing
watch(() => props.open, (isOpen, oldIsOpen) => {
  if (oldIsOpen && !isOpen) {
    // Wait longer for animations and Vue updates to complete
    setTimeout(() => {
      // Double-check the sheet is still closed before cleanup
      if (!props.open) {
        cleanupOverlays()
      }
    }, 500)
  }
}, { immediate: false, flush: 'post' })

// Run safe cleanup on mount to handle any leftover elements
onMounted(() => {
  // Use a longer delay to ensure Vue has finished initial rendering
  setTimeout(() => {
    nextTick(cleanupOverlays)
  }, 100)
})

// Run cleanup on unmount with error handling
onUnmounted(() => {
  try {
    // Only do minimal cleanup on unmount to avoid conflicts
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.body.classList.remove('overflow-hidden')
  } catch (error) {
    console.debug('Sheet unmount cleanup error (non-critical):', error)
  }
})
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>