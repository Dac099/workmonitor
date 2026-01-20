<script lang="ts" setup>
import { ref } from 'vue'
import { useColorsStore } from '@/stores/colors'
import type { Group } from '../types/groups'

const props = defineProps<{
  group: Group
}>()

const emit = defineEmits<{
  submit: [updates: { name: string; color: string }]
  delete: []
  cancel: []
}>()

const colorsStore = useColorsStore()

const groupName = ref(props.group.name)
const selectedColor = ref(props.group.color)
const isSubmitting = ref(false)
const showDeleteConfirm = ref(false)

const handleSubmit = () => {
  if (!groupName.value.trim()) return

  isSubmitting.value = true

  emit('submit', {
    name: groupName.value.trim(),
    color: selectedColor.value,
  })

  isSubmitting.value = false
}

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  emit('delete')
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="edit-group-form">
    <!-- Group Name -->
    <div class="form-group">
      <label for="groupName" class="form-label">Nombre del grupo</label>
      <input
        id="groupName"
        v-model="groupName"
        type="text"
        class="form-input"
        placeholder="Ingresa el nombre del grupo"
        required
        autofocus
      />
    </div>

    <!-- Group Color -->
    <div class="form-group">
      <label class="form-label">Color del grupo</label>
      <div class="color-picker">
        <button
          v-for="color in colorsStore.availableColors"
          :key="color"
          type="button"
          class="color-option"
          :class="{ 'color-option--selected': selectedColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectedColor = color"
          :title="color"
        >
          <span v-if="selectedColor === color" class="color-check">✓</span>
        </button>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="delete-confirm">
      <p class="delete-message">
        <strong>⚠️ ¿Estás seguro?</strong><br />
        Esta acción eliminará el grupo "{{ group.name }}" permanentemente.
      </p>
      <div class="delete-actions">
        <button type="button" @click="cancelDelete" class="btn btn-cancel">Cancelar</button>
        <button type="button" @click="confirmDelete" class="btn btn-delete">Sí, eliminar</button>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button
        v-if="!showDeleteConfirm"
        type="button"
        @click="handleDelete"
        class="btn btn-delete-trigger"
        :disabled="isSubmitting"
      >
        Eliminar grupo
      </button>
      <div class="form-actions-right">
        <button type="button" @click="handleCancel" class="btn btn-cancel" :disabled="isSubmitting">
          Cancelar
        </button>
        <button
          v-if="!showDeleteConfirm"
          type="submit"
          class="btn btn-submit"
          :disabled="!groupName.trim() || isSubmitting"
        >
          {{ isSubmitting ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.edit-group-form {
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

/* Color Picker */
.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-option--selected {
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.color-check {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Delete Confirmation */
.delete-confirm {
  padding: 1rem;
  background-color: #fef7e0;
  border: 1px solid #f9ab00;
  border-radius: 4px;
}

.delete-message {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #202124;
  line-height: 1.5;
}

.delete-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.form-actions-right {
  display: flex;
  gap: 0.75rem;
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

.btn-delete-trigger {
  background-color: transparent;
  color: #d7263d;
  border-color: #d7263d;
}

.btn-delete-trigger:hover:not(:disabled) {
  background-color: #fce8e6;
}

.btn-delete {
  background-color: #d7263d;
  color: white;
  border-color: #d7263d;
}

.btn-delete:hover:not(:disabled) {
  background-color: #b71c1c;
}
</style>
