<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { Value } from '../../types/values'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import { useLocalValue } from '../../composables/useLocalValue'
import { useTableValueAPI } from '../../composables/useTableValueAPI'

interface Props {
  value?: Value
  itemId: string
  columnId: string
}

const props = defineProps<Props>()
const overlayMenu = ref<InstanceType<typeof OverlayMenu> | null>(null)

const { localValue, updateLocal, setId } = useLocalValue(props.value, {
  itemId: props.itemId,
  columnId: props.columnId,
  columnType: 'timeline',
})

const { isSaving, save: saveToAPI } = useTableValueAPI()

// Form state
const startDate = ref('')
const endDate = ref('')

const dateRange = computed<[string, string] | null>(() => {
  const v = localValue.value ?? props.value
  if (!v) return null
  try {
    return JSON.parse(v.value)
  } catch {
    return null
  }
})

// Format for display: dd/mm/yy - Mexico Time
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'America/Mexico_City',
  }).format(date)
}

const formattedDateRange = computed(() => {
  if (!dateRange.value) return ''
  const [start, end] = dateRange.value
  return `${formatDate(start)} - ${formatDate(end)}`
})

const progressPercentage = computed(() => {
  if (!dateRange.value) return 0
  const [start, end] = dateRange.value
  const startDateMs = new Date(start).getTime()
  const endDateMs = new Date(end).getTime()
  const currentDateMs = Date.now()

  if (currentDateMs <= startDateMs) return 0
  if (currentDateMs >= endDateMs) return 100

  const totalDuration = endDateMs - startDateMs
  if (totalDuration <= 0) return 100
  const elapsed = currentDateMs - startDateMs
  return Math.round((elapsed / totalDuration) * 100)
})

const openOverlay = (event: MouseEvent) => {
  if (dateRange.value) {
    startDate.value = dateRange.value[0].split('T')[0] ?? ''
    endDate.value = dateRange.value[1].split('T')[0] ?? ''
  } else {
    startDate.value = ''
    endDate.value = ''
  }
  overlayMenu.value?.toggle(event)
}

const isValid = computed(() => {
  if (!startDate.value || !endDate.value) return false
  return startDate.value <= endDate.value
})

const save = async () => {
  if (!isValid.value || isSaving.value) return

  // Convert inputs (YYYY-MM-DD) to ISO strings
  const startISO = `${startDate.value}T06:00:00.000Z`
  const endISO = `${endDate.value}T06:00:00.000Z`
  const newValue = JSON.stringify([startISO, endISO])

  // Optimistic update
  updateLocal(newValue)
  overlayMenu.value?.close()

  // API call
  await saveToAPI({
    valueId: props.value?.id,
    itemId: props.itemId,
    columnId: props.columnId,
    value: newValue,
    onSuccess: (response) => {
      setId(response.id)
    },
  })
}
</script>

<template>
  <div class="cell-container" @click="openOverlay">
    <div v-if="!localValue" class="cell-empty">
      <slot />
    </div>

    <div v-else class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      <span class="date-text">{{ formattedDateRange }}</span>
    </div>

    <OverlayMenu ref="overlayMenu">
      <template #header>Editar Cronograma</template>
      <template #content>
        <div class="timeline-form">
          <div class="form-group">
            <label>Fecha inicio</label>
            <input v-model="startDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Fecha final</label>
            <input v-model="endDate" type="date" class="form-input" :min="startDate" />
          </div>
          <button class="save-btn" :disabled="!isValid || isSaving" @click="save">
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </template>
    </OverlayMenu>
  </div>
</template>

<style scoped>
.cell-container {
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.cell-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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
  position: relative;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--dark-color);
  white-space: nowrap;
  z-index: 1;
}

.timeline-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
  min-width: 250px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--dark-color);
  font-weight: 500;
}

.form-input {
  padding: 0.4rem;
  border: 1px solid var(--shadow-color);
  border-radius: 4px;
  background-color: var(--sec-color);
  color: var(--dark-color);
  font-family: inherit;
}

.save-btn {
  background-color: var(--contrast-color);
  color: #fff;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
