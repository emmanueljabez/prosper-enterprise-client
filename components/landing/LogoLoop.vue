<template>
  <div
    :class="['relative w-full overflow-hidden', className]"
    :aria-label="ariaLabel"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <template v-if="fadeOut">
      <div
        v-if="!leadInText"
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24"
        :style="{ background: `linear-gradient(to right, ${fadeOutColor}, transparent)` }"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24"
        :style="{ background: `linear-gradient(to left, ${fadeOutColor}, transparent)` }"
      />
    </template>

    <div
      :class="['flex items-center', leadInText ? 'gap-6 sm:gap-8' : '']"
      :style="{ flexDirection: isVertical ? 'column' : 'row' }"
    >
      <span
        v-if="leadInText"
        class="shrink-0 font-medium text-[#000] pl-4 sm:pl-6 lg:pl-8"
        style="font-family: Montserrat, sans-serif; font-size: 16px; line-height: 1.22;"
      >
        {{ leadInText }}
      </span>
      <div class="flex-1 min-w-0 overflow-hidden">
        <div
          ref="trackRef"
          class="flex items-center"
          :style="trackStyle"
        >
          <div
            v-for="n in setCount"
            :key="`set-${n}`"
            data-logo-set
            class="flex shrink-0 items-center"
            :style="{
              gap: `${gap}px`,
              flexDirection: isVertical ? 'column' : 'row',
              [isVertical ? 'height' : 'width']: 'max-content',
            }"
            aria-hidden="true"
          >
            <div
              v-for="(logo, i) in logos"
              :key="`${n}-${i}`"
              class="flex shrink-0 items-center justify-center"
              :style="{ [isVertical ? 'height' : 'width']: 'max-content' }"
            >
              <img
                :src="logo.src"
                :alt="logo.alt"
                class="object-contain select-none"
                :style="{ height: `${logoHeight}px`, width: 'auto', maxWidth: 'none' }"
                draggable="false"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

interface LogoItem { src: string; alt: string }

const props = withDefaults(defineProps<{
  logos: LogoItem[]
  speed?: number
  durationSeconds?: number
  leadInText?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  logoHeight?: number
  gap?: number
  hoverSpeed?: number
  fadeOut?: boolean
  fadeOutColor?: string
  className?: string
  ariaLabel?: string
}>(), {
  speed: 120,
  direction: 'left',
  logoHeight: 28,
  gap: 32,
  fadeOut: false,
  fadeOutColor: '#FFF',
  className: '',
  ariaLabel: 'Partner logos',
})

const trackRef = ref<HTMLElement | null>(null)
const duration = ref(30)
const isHovered = ref(false)
const setCount = 4
const TRANSLATE_PERCENT = 100 / setCount

const isVertical = computed(() => props.direction === 'up' || props.direction === 'down')

const effectiveSpeed = computed(() =>
  isHovered.value && props.hoverSpeed !== undefined ? props.hoverSpeed : props.speed
)

const effectiveDuration = computed(() => {
  const base = props.durationSeconds ?? duration.value
  if (effectiveSpeed.value === 0) return 999999
  if (props.durationSeconds != null) return base
  return duration.value * (Math.abs(props.speed) / Math.max(1, Math.abs(effectiveSpeed.value)))
})

const animationDirection = computed(() =>
  props.direction === 'right' || props.direction === 'down' ? 'reverse' : 'normal'
)

const axis = computed(() => (isVertical.value ? 'Y' : 'X'))

const trackStyle = computed(() => ({
  flexDirection: isVertical.value ? 'column' : 'row',
  width: isVertical.value ? '100%' : 'max-content',
  height: isVertical.value ? 'max-content' : 'auto',
  animationName: `logo-loop-scroll-${axis.value}`,
  animationDuration: `${effectiveDuration.value}s`,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  animationDirection: animationDirection.value,
  animationPlayState: effectiveSpeed.value === 0 ? 'paused' : 'running',
}))

const measure = () => {
  if (props.durationSeconds != null) return
  const el = trackRef.value
  if (!el || props.logos.length === 0) return
  const firstSet = el.querySelector('[data-logo-set]') as HTMLElement | null
  if (!firstSet) return
  const size = isVertical.value ? firstSet.offsetHeight : firstSet.offsetWidth
  if (size > 0) duration.value = size / Math.abs(props.speed)
}

onMounted(measure)
watch(() => [props.logos.length, props.speed, props.direction, props.durationSeconds], measure)
</script>

<style>
@keyframes logo-loop-scroll-X {
  0% { transform: translateX(0); }
  100% { transform: translateX(-25%); }
}
@keyframes logo-loop-scroll-Y {
  0% { transform: translateY(0); }
  100% { transform: translateY(-25%); }
}
</style>
