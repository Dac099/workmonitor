<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Group } from '../types/groups'

const props = defineProps<{
  groups: Group[]
}>()

const emit = defineEmits<{
  submit: [selectedGroupIds: number[], keepValues: boolean]
  cancel: []
}>()

const keepValues = ref(true)
const selectedGroupIds = ref<number[]>(props.groups.map((g) => g.id))
const isSubmitting = ref(false)

const hasGroups = computed(() => props.groups.length > 0)

const toggleGroup = (groupId: number) => {
  const index = selectedGroupIds.value.indexOf(groupId)
  if (index > -1) {
    selectedGroupIds.value.splice(index, 1)
  } else {
    selectedGroupIds.value.push(groupId)
  }
}

const isGroupSelected = (groupId: number) => {
  return selectedGroupIds.value.includes(groupId)
}

const handleSubmit = () => {
  isSubmitting.value = true
  emit('submit', selectedGroupIds.value, keepValues.value)
  isSubmitting.value = false
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="duplicate-form">
    <!-- Groups Selection Section -->
    <div class="form-group">
      <h3 class="section-title">Grupos a duplicar</h3>

      <div v-if="hasGroups" class="groups-list">
        <label
          v-for="group in props.groups"
          :key="group.id"
          class="group-checkbox"
          :class="{ 'group-checkbox--selected': isGroupSelected(group.id) }"
        >
          <input
            type="checkbox"
            :checked="isGroupSelected(group.id)"
            @change="toggleGroup(group.id)"
          />
          <span class="group-indicator" :style="{ backgroundColor: group.color }"></span>
          <span class="group-name">{{ group.name }}</span>
        </label>
      </div>

      <div v-else class="empty-state">
        <p class="empty-state-text">Sin grupos, solo se copiará la configuración de columnas</p>
      </div>
    </div>

    <!-- Keep Values Section -->
    <div class="form-group">
      <h3 class="section-title">Valores</h3>
      <p class="form-description">¿Deseas conservar los valores al duplicar el tablero?</p>

      <div class="radio-group">
        <label class="radio-option">
          <input v-model="keepValues" type="radio" name="keepValues" :value="true" />
          <span class="radio-label">
            <strong>Sí, conservar valores</strong>
            <span class="radio-description"
              >El tablero duplicado mantendrá todos los valores actuales</span
            >
          </span>
        </label>

        <label class="radio-option">
          <input v-model="keepValues" type="radio" name="keepValues" :value="false" />
          <span class="radio-label">
            <strong>No, valores en blanco</strong>
            <span class="radio-description">El tablero duplicado se creará sin valores</span>
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
        {{ isSubmitting ? 'Duplicando...' : 'Duplicar Tablero' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.duplicate-form {
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

/* Groups List */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.group-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.group-checkbox:hover {
  background-color: #f1f3f4;
  border-color: #1a73e8;
}

.group-checkbox--selected {
  background-color: #e8f0fe;
  border-color: #1a73e8;
}

.group-checkbox input[type='checkbox'] {
  cursor: pointer;
  accent-color: #1a73e8;
  width: 16px;
  height: 16px;
}

.group-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.group-name {
  flex: 1;
  font-size: 0.875rem;
  color: #202124;
}

/* Empty State */
.empty-state {
  padding: 1.5rem;
  background-color: #f1f3f4;
  border-radius: 4px;
  text-align: center;
}

.empty-state-text {
  margin: 0;
  font-size: 0.875rem;
  color: #5f6368;
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
