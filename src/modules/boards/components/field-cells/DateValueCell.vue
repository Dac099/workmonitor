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
  columnType: 'date',
})

const { isSaving, save: saveToAPI } = useTableValueAPI()

const dateInput = ref('')

const storedDate = computed(() => {
  const v = localValue.value ?? props.value
  if (!v || !v.value) return null
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
    dateInput.value = storedDate.value.split('T')[0] ?? ''
  } else {
    dateInput.value = ''
  }
  overlayMenu.value?.toggle(event)
}

const save = async () => {
  if (!dateInput.value || isSaving.value) return

  // Convert input (YYYY-MM-DD) to ISO string with T06:00:00.000Z
  const newDateISO = `${dateInput.value}T06:00:00.000Z`
  const newValue = JSON.stringify(newDateISO)

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
