<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [action: 'move-and-delete' | 'move-and-keep']
  cancel: []
}>()

const selectedAction = ref<'move-and-delete' | 'move-and-keep'>('move-and-keep')
const isSubmitting = ref(false)

const handleSubmit = () => {
  isSubmitting.value = true
  emit('submit', selectedAction.value)
  isSubmitting.value = false
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="move-group-form">
    <div class="form-group">
      <p class="form-description">Selecciona cómo deseas mover este grupo a otro tablero:</p>

      <div class="radio-group">
        <label class="radio-option">
          <input v-model="selectedAction" type="radio" name="moveAction" value="move-and-keep" />
          <span class="radio-label">
            <strong>Mover y conservar aquí</strong>
            <span class="radio-description">
              El grupo se copiará al otro tablero y permanecerá en este tablero
            </span>
          </span>
        </label>

        <label class="radio-option">
          <input v-model="selectedAction" type="radio" name="moveAction" value="move-and-delete" />
          <span class="radio-label">
            <strong>Mover y eliminar aquí</strong>
            <span class="radio-description">
              El grupo se moverá al otro tablero y se eliminará de este tablero
            </span>
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
        {{ isSubmitting ? 'Moviendo...' : 'Continuar' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.move-group-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
