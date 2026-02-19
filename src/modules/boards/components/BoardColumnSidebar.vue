<script lang="ts" setup>
import { computed, ref } from 'vue'
import SideBar from '@/shared/components/SideBar.vue'
import { useColumnsStore } from '@/stores/columns'
import { useTableValuesStore } from '@/stores/tableValues'
import { API_BASE_URL } from '@/utils/contants'
import type { ColumnCreated } from '../types/columns'

interface Props {
  visible: boolean
  boardId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
  (e: 'update:visible', value: boolean): void
}>()

const columnsStore = useColumnsStore()
const tableValuesStore = useTableValuesStore()
const isLoading = ref(false)
const form = ref({
  name: '',
  type: 'text',
  settings: '',
  width: 100,
})

const widthDefaults = {
  status: 250,
  timeline: 300,
  text: 100,
  number: 100,
  date: 100,
}

const typeDescriptions: Record<string, string> = {
  status:
    'Crea un sistema para etiquetar tus items con valores personalizados o utiliza valores ya definidos como Company y Status',
  text: 'Usa palabras para brindar contexto',
  number: 'Ideal para dar forma a tus ideas con números',
  date: 'Una fecha limite o cualquier concepto que requiera de una fecha',
  timeline: 'Columna para definir un periodo de tiempo y mostrar el progreso con una barra',
}

const currentDescription = computed(() => {
  return typeDescriptions[form.value.type] || ''
})

const onTypeChange = () => {
  const type = form.value.type as keyof typeof widthDefaults
  form.value.width = widthDefaults[type] || 100
}

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

const submit = async () => {
  if (!form.value.name) return
  isLoading.value = true

  try {
    const payload = {
      ...form.value,
      boardId: props.boardId,
      columnWidth: form.value.width,
    }

    const response = await fetch(`${API_BASE_URL}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to create column: ${response.statusText}`)
    }

    const newColumn: ColumnCreated = await response.json()
    columnsStore.addColumn(newColumn.column)

    if (newColumn.column.type.toLowerCase() === 'status') {
      tableValuesStore.initializeColumn(
        newColumn.column.id,
        newColumn.column.name,
        newColumn.definedValues,
      )
    }

    // Reset form
    form.value = {
      name: '',
      type: 'text',
      settings: '',
      width: 100,
    }

    emit('created')
    handleClose()
  } catch (error) {
    console.error('Failed to create column', error)
    // Ideally show error toast
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <SideBar :is-open="props.visible" @close="handleClose">
    <template #header>
      <h3>Agregar Columna</h3>
    </template>

    <div class="form-container">
      <div class="form-group">
        <label>Nombre</label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="Nombre de la columna"
        />
      </div>

      <div class="form-group">
        <label>Tipo</label>
        <select v-model="form.type" class="form-select" @change="onTypeChange">
          <option value="status">Etiqueta</option>
          <option value="text">Texto</option>
          <option value="number">Número</option>
          <option value="date">Fecha</option>
          <option value="timeline">Timeline</option>
        </select>
        <small class="type-description">{{ currentDescription }}</small>
      </div>

      <div class="form-group">
        <label>Configuraciones</label>
        <input
          v-model="form.settings"
          type="text"
          class="form-input"
          disabled
          placeholder="Configuraciones (WIP)"
        />
      </div>

      <div class="form-group">
        <label>Ancho (px)</label>
        <input v-model.number="form.width" type="number" class="form-input" min="50" max="1000" />
      </div>

      <button class="submit-btn" :disabled="!form.name || isLoading" @click="submit">
        {{ isLoading ? 'Creando...' : 'Crear Columna' }}
      </button>
    </div>
  </SideBar>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dark-color);
}

.form-input,
.form-select {
  padding: 0.8rem;
  border: 1px solid var(--shadow-color);
  border-radius: 4px;
  background-color: var(--sec-color);
  color: var(--dark-color);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--contrast-color);
}

.type-description {
  font-size: 0.8rem;
  color: var(--dark-color);
  opacity: 0.7;
  padding: 0 0.2rem;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.05);
}

.submit-btn {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: var(--contrast-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

h3 {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}
</style>
