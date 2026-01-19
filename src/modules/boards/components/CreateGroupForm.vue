<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [groupName: string]
  cancel: []
}>()

const groupName = ref('')
const isSubmitting = ref(false)

const handleSubmit = () => {
  if (!groupName.value.trim()) return

  isSubmitting.value = true
  emit('submit', groupName.value.trim())

  // Reset form
  groupName.value = ''
  isSubmitting.value = false
}

const handleCancel = () => {
  groupName.value = ''
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
</style>
