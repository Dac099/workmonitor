<script lang="ts" setup>
import { ref } from 'vue'
import type { NewColumn, ColumnType } from '@/shared/types/columns'

const emit = defineEmits<{
  submit: [column: NewColumn]
  cancel: []
}>()

const columnName = ref('')
const columnType = ref<ColumnType>('text')
const columnWidth = ref(200)
const isSubmitting = ref(false)

const columnTypes: { value: ColumnType; label: string; description: string }[] = [
  { value: 'text', label: 'Texto', description: 'Campo de texto libre' },
  { value: 'number', label: 'Número', description: 'Campo numérico' },
  { value: 'date', label: 'Fecha', description: 'Selector de fecha' },
  { value: 'status', label: 'Estado', description: 'Selector de estado' },
  { value: 'timeline', label: 'Línea de tiempo', description: 'Eventos con fechas' },
]

const handleSubmit = () => {
  if (!columnName.value.trim()) return

  isSubmitting.value = true

  const newColumn: NewColumn = {
    name: columnName.value.trim(),
    type: columnType.value,
    width: columnWidth.value,
  }

  emit('submit', newColumn)

  // Reset form
  columnName.value = ''
  columnType.value = 'text'
  columnWidth.value = 200
  isSubmitting.value = false
}

const handleCancel = () => {
  columnName.value = ''
  columnType.value = 'text'
  columnWidth.value = 200
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="add-column-form">
    <!-- Column Name -->
    <div class="form-group">
      <label for="columnName" class="form-label">Nombre de la columna</label>
      <input
        id="columnName"
        v-model="columnName"
        type="text"
        class="form-input"
        placeholder="Ej: Prioridad, Responsable..."
        required
        autofocus
      />
    </div>

    <!-- Column Type -->
    <div class="form-group">
      <label class="form-label">Tipo de columna</label>
      <div class="type-options">
        <label
          v-for="type in columnTypes"
          :key="type.value"
          class="type-option"
          :class="{ 'type-option--selected': columnType === type.value }"
        >
          <input v-model="columnType" type="radio" name="columnType" :value="type.value" />
          <span class="type-label">
            <strong>{{ type.label }}</strong>
            <span class="type-description">{{ type.description }}</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Column Width -->
    <div class="form-group">
      <label for="columnWidth" class="form-label">Ancho (px)</label>
      <input
        id="columnWidth"
        v-model.number="columnWidth"
        type="number"
        class="form-input"
        min="100"
        max="500"
        step="10"
      />
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="handleCancel" class="btn btn-cancel" :disabled="isSubmitting">
        Cancelar
      </button>
      <button type="submit" class="btn btn-submit" :disabled="!columnName.trim() || isSubmitting">
        {{ isSubmitting ? 'Agregando...' : 'Agregar Columna' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.add-column-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #202124;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-input::placeholder {
  color: #5f6368;
}

/* Type Options */
.type-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-option:hover {
  background-color: #f1f3f4;
  border-color: #1a73e8;
}

.type-option--selected {
  background-color: #e8f0fe;
  border-color: #1a73e8;
}

.type-option input[type='radio'] {
  margin-top: 2px;
  cursor: pointer;
  accent-color: #1a73e8;
}

.type-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.type-label strong {
  font-size: 0.875rem;
  color: #202124;
  font-weight: 500;
}

.type-description {
  font-size: 0.75rem;
  color: #5f6368;
  line-height: 1.4;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: transparent;
  color: #5f6368;
  border-color: #dadce0;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #f1f3f4;
}

.btn-submit {
  background-color: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1557b0;
}
</style>
