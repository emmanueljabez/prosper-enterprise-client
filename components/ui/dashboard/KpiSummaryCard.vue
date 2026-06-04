<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type CardTone = 'brand' | 'success' | 'warning' | 'danger'
type DeltaTone = 'up' | 'down' | 'neutral'
type HealthTone = 'healthy' | 'watch' | 'risk'

interface Props {
  title: string
  value: string
  subtitle: string
  progress: number
  icon: Component
  tone?: CardTone
  deltaText?: string
  deltaTone?: DeltaTone
  healthTone?: HealthTone
  sparkline?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'brand',
  deltaText: '',
  deltaTone: 'neutral',
  healthTone: 'healthy',
  sparkline: () => [],
})

const toneVars = computed(() => {
  const map: Record<CardTone, Record<string, string>> = {
    brand: {
      '--kpi-accent': '#9a4884',
      '--kpi-surface': '#ffffff',
      '--kpi-border': '#e8dbe5',
      '--kpi-chip-bg': 'rgba(154, 72, 132, 0.12)',
      '--kpi-chip-color': '#9a4884',
      '--kpi-track': '#f5eaf2',
      '--kpi-fill': '#9a4884',
      '--kpi-icon-bg': '#f7edf4',
    },
    success: {
      '--kpi-accent': '#2f8f83',
      '--kpi-surface': '#ffffff',
      '--kpi-border': '#d8ebe8',
      '--kpi-chip-bg': 'rgba(47, 143, 131, 0.12)',
      '--kpi-chip-color': '#2f8f83',
      '--kpi-track': '#e5f3f1',
      '--kpi-fill': '#2f8f83',
      '--kpi-icon-bg': '#ebf6f4',
    },
    warning: {
      '--kpi-accent': '#b45309',
      '--kpi-surface': '#ffffff',
      '--kpi-border': '#f4e3d1',
      '--kpi-chip-bg': 'rgba(180, 83, 9, 0.12)',
      '--kpi-chip-color': '#b45309',
      '--kpi-track': '#faefdf',
      '--kpi-fill': '#b45309',
      '--kpi-icon-bg': '#fdf4e7',
    },
    danger: {
      '--kpi-accent': '#b91c1c',
      '--kpi-surface': '#ffffff',
      '--kpi-border': '#f3dede',
      '--kpi-chip-bg': 'rgba(185, 28, 28, 0.12)',
      '--kpi-chip-color': '#b91c1c',
      '--kpi-track': '#fceaea',
      '--kpi-fill': '#b91c1c',
      '--kpi-icon-bg': '#fdeeee',
    },
  }

  return map[props.tone]
})

const deltaClass = computed(() => ({
  up: 'bg-[#e7f6f4] text-[#1f766b]',
  down: 'bg-[#fde7e7] text-[#a12828]',
  neutral: 'bg-[#f2dfed] text-[#7f3a6d]',
}[props.deltaTone]))

const healthLabel = computed(() => ({
  healthy: 'Healthy',
  watch: 'Watch',
  risk: 'Risk',
}[props.healthTone]))

const healthDotClass = computed(() => ({
  healthy: 'bg-[#2f8f83]',
  watch: 'bg-[#b45309]',
  risk: 'bg-[#b91c1c]',
}[props.healthTone]))
</script>

<template>
  <Card class="kpi-summary-card border shadow-sm" :style="toneVars">
    <CardHeader class="pb-2">
      <div class="flex items-start justify-between gap-3">
        <CardDescription class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#656f7d]">
          {{ title }}
        </CardDescription>
        <span class="kpi-summary-card__icon" aria-hidden="true">
          <component :is="icon" class="h-3.5 w-3.5" />
        </span>
      </div>

      <CardTitle class="text-[2rem] font-semibold leading-none text-[#1d232b]">{{ value }}</CardTitle>
    </CardHeader>

    <CardContent class="space-y-3 pb-4">
      <p class="line-clamp-2 min-h-[2.5rem] text-xs text-[#6d7282]">{{ subtitle }}</p>

      <div class="flex items-center justify-between gap-2 text-[11px] font-medium">
        <Badge
          v-if="deltaText"
          :class="['rounded-full px-2 py-0.5 text-[10px] font-semibold', deltaClass]"
        >
          {{ deltaText }}
        </Badge>
        <span v-else />
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full" :class="healthDotClass" />
          <span class="text-[#7f3a6d]">{{ healthLabel }} · {{ progress }}%</span>
        </span>
      </div>

      <Progress :value="progress" class="kpi-progress h-1.5" />
    </CardContent>
  </Card>
</template>

<style scoped>
.kpi-summary-card {
  background: linear-gradient(180deg, var(--kpi-surface) 0%, color-mix(in srgb, var(--kpi-surface) 94%, #f4eff5) 100%);
  border-color: var(--kpi-border);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.kpi-summary-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  width: 1.75rem;
  border-radius: 0.625rem;
  background: var(--kpi-icon-bg);
  color: var(--kpi-accent);
}

:deep(.kpi-progress [data-slot='progress']) {
  background: var(--kpi-track);
}

:deep(.kpi-progress [data-slot='progress-indicator']) {
  background: var(--kpi-fill);
}

.kpi-summary-card:hover {
  transform: translateY(-1.5px);
  border-color: color-mix(in srgb, var(--kpi-accent) 35%, #d9dce3);
  box-shadow: 0 14px 32px -24px color-mix(in srgb, var(--kpi-accent) 42%, #1f2937);
}
</style>
