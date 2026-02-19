<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { Value } from '../../types/values'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  value?: Value
  itemId: string
  columnId: string
}

const props = defineProps<Props>()
const overlayMenu = ref<InstanceType<typeof OverlayMenu> | null>(null)
const localValue = ref<Value | undefined>(props.value ? { ...props.value } : undefined)

const dateInput = ref('')
const isSaving = ref(false)

const storedDate = computed(() => {
  const v = localValue.value ?? props.value
  if (!v || !v.value) return null
  // v.value is a JSON stringified string in other cells, but for DateValueCell it might just be the string if older data?
  // Previous TextValueCell logic used JSON.parse.
  // Let's assume consistent pattern: JSON stringified string "2025-..." -> value: "\"2025-...\""
  try {
    return JSON.parse(v.value)
  } catch {
    return v.value
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

const displayValue = computed(() => {
  if (!storedDate.value) return ''
  return formatDate(storedDate.value)
})

const openOverlay = (event: MouseEvent) => {
  if (storedDate.value) {
    // storedDate is ISO string "2025-12-30T06:00:00.000Z"
    // Input type="date" needs "YYYY-MM-DD"
    dateInput.value = storedDate.value.split('T')[0] ?? ''
  } else {
    dateInput.value = ''
  }
  overlayMenu.value?.toggle(event)
}

const save = async () => {
  if (!dateInput.value || isSaving.value) return

  isSaving.value = true

  // Convert input (YYYY-MM-DD) to ISO string with T06:00:00.000Z
  const newDateISO = `${dateInput.value}T06:00:00.000Z`
  const newValue = JSON.stringify(newDateISO)

  // Optimistic update
  if (localValue.value) {
    localValue.value.value = newValue
  } else {
    localValue.value = {
      id: '',
      itemId: props.itemId,
      columnId: props.columnId,
      value: newValue,
      columnType: 'date',
    }
  }

  overlayMenu.value?.close()

  try {
    if (props.value?.id) {
      await fetch(`${API_BASE_URL}/tableValues/${props.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      })
    } else {
      const response = await fetch(`${API_BASE_URL}/tableValues/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: props.itemId,
          columnId: props.columnId,
          value: newValue,
        }),
      })

      if (response.ok) {
        const created = await response.json()
        if (localValue.value) {
          localValue.value.id = created.id
        }
      }
    }
  } catch (error) {
    console.error('Failed to save date', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="cell-container" @click="openOverlay">
    <div v-if="!localValue" class="cell-empty">
      <slot />
    </div>

    <span v-else class="cell-text">{{ displayValue }}</span>

    <OverlayMenu ref="overlayMenu">
      <template #header>Editar Fecha</template>
      <template #content>
        <div class="date-form">
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="dateInput" type="date" class="form-input" />
          </div>
          <button class="save-btn" :disabled="!dateInput || isSaving" @click="save">
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
  padding: 0 5px;
}

.date-form {
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
