<script lang="ts" setup>
import { ref } from 'vue'
import { useColorsStore } from '@/stores/colors'
import type { NewGroup } from '../types/groups'

const emit = defineEmits<{
  submit: [groupForm: NewGroup]
  cancel: []
}>()

const colorsStore = useColorsStore()

const groupName = ref('')
const selectedColor = ref(colorsStore.availableColors[0] || '#266DD3')
const isSubmitting = ref(false)

const handleSubmit = () => {
  if (!groupName.value.trim()) return

  isSubmitting.value = true

  const groupForm: NewGroup = {
    name: groupName.value.trim(),
    color: selectedColor.value,
  }

  emit('submit', groupForm)

  // Reset form
  groupName.value = ''
  selectedColor.value = colorsStore.availableColors[0] || '#266DD3'
  isSubmitting.value = false
}

const handleCancel = () => {
  groupName.value = ''
  selectedColor.value = colorsStore.availableColors[0] || '#266DD3'
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="create-group-form">
    <div class="form-group">
      <label for="groupName" class="form-label">Nombre del Grupo</label>
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

    <div class="form-group">
      <label class="form-label">Color del Grupo</label>
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

    <div class="form-actions">
      <button type="button" @click="handleCancel" class="btn btn-cancel" :disabled="isSubmitting">
        Cancelar
      </button>
      <button type="submit" class="btn btn-submit" :disabled="!groupName.trim() || isSubmitting">
        {{ isSubmitting ? 'Creando...' : 'Crear Grupo' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.create-group-form {
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
</style>
