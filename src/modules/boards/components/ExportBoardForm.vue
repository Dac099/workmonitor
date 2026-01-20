<script lang="ts" setup>
import { ref } from 'vue'
import GroupSelector from './GroupSelector.vue'
import type { Group } from '../types/groups'

const props = defineProps<{
  groups: Group[]
}>()

const emit = defineEmits<{
  submit: [selectedGroupIds: number[], exportView: 'groups' | 'gantt']
  cancel: []
}>()

const exportView = ref<'groups' | 'gantt'>('groups')
const selectedGroupIds = ref<number[]>(props.groups.map((g) => g.id))
const isSubmitting = ref(false)

const handleSubmit = () => {
  isSubmitting.value = true
  emit('submit', selectedGroupIds.value, exportView.value)
  isSubmitting.value = false
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="export-form">
    <!-- Groups Selection Section -->
    <div class="form-group">
      <h3 class="section-title">Grupos a exportar</h3>
      <GroupSelector v-model="selectedGroupIds" :groups="groups" />
    </div>

    <!-- Export View Section -->
    <div class="form-group">
      <h3 class="section-title">Vista de exportación</h3>
      <p class="form-description">Selecciona el formato en el que deseas exportar el tablero</p>

      <div class="radio-group">
        <label class="radio-option">
          <input v-model="exportView" type="radio" name="exportView" value="groups" />
          <span class="radio-label">
            <strong>Vista de Grupos</strong>
            <span class="radio-description"
              >Exportar organizado por grupos con sus respectivos elementos</span
            >
          </span>
        </label>

        <label class="radio-option">
          <input v-model="exportView" type="radio" name="exportView" value="gantt" />
          <span class="radio-label">
            <strong>Vista de Gantt</strong>
            <span class="radio-description"
              >Exportar como diagrama de Gantt con línea de tiempo</span
            >
          </span>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="handleCancel" class="btn btn-cancel" :disabled="isSubmitting">
        Cancelar
      </button>
      <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Exportando...' : 'Exportar Tablero' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.export-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #202124;
}

.form-description {
  font-size: 0.875rem;
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
}

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.radio-option:hover {
  background-color: #f1f3f4;
  border-color: #1a73e8;
}

.radio-option:has(input:checked) {
  background-color: #e8f0fe;
  border-color: #1a73e8;
}

.radio-option input[type='radio'] {
  margin-top: 2px;
  cursor: pointer;
  accent-color: #1a73e8;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.radio-label strong {
  font-size: 0.875rem;
  color: #202124;
  font-weight: 500;
}

.radio-description {
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
