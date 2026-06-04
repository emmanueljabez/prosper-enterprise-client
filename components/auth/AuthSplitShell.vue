<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  contentClass?: string
  align?: 'center' | 'start'
}

const props = withDefaults(defineProps<Props>(), {
  contentClass: 'w-[380px]',
  align: 'center',
})

const alignmentClass = computed(() =>
  props.align === 'start' ? 'items-start' : 'items-center',
)
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img
        src="/images/prosper_mentor_logo.png"
        alt="Prosper Mentor"
        width="150"
        height="150"
        class="object-cover dark:brightness-[0.2] dark:grayscale"
      >
    </div>
    <div class="flex justify-center py-12" :class="alignmentClass">
      <div class="mx-auto grid gap-8" :class="props.contentClass">
        <slot />
      </div>
    </div>
  </div>
</template>
