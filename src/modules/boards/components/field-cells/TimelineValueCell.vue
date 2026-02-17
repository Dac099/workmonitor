<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value: Value
}

const props = defineProps<Props>()

const dateRange = computed<[string, string]>(() => JSON.parse(props.value.value))

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

const formattedDateRange = computed(() => {
  const [start, end] = dateRange.value
  return `${formatDate(start)} - ${formatDate(end)}`
})

const progressPercentage = computed(() => {
  const [start, end] = dateRange.value
  const startDate = new Date(start).getTime()
  const endDate = new Date(end).getTime()
  const currentDate = Date.now()

  if (currentDate <= startDate) return 0
  if (currentDate >= endDate) return 100

  const totalDuration = endDate - startDate
  const elapsed = currentDate - startDate
  return Math.round((elapsed / totalDuration) * 100)
})
</script>

<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
    <span class="date-text">{{ formattedDateRange }}</span>
  </div>
</template>

<style scoped>
.progress-bar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 25px;
  background-color: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--contrast-color);
  transition: width 0.3s ease;
}

.date-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--dark-color);
  white-space: nowrap;
  z-index: 1;
}
</style>
