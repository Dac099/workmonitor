<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  itemName: string
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [name: string]
}>()

const editName = ref('')

watch(
  () => props.itemName,
  (newValue) => {
    editName.value = newValue
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  const normalizedName = editName.value.trim()
  return normalizedName.length > 0 && normalizedName !== props.itemName
})

const handleSubmit = () => {
  if (!canSubmit.value) return
  emit('submit', editName.value.trim())
}
</script>

<template>
  <form class="item-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="editName">Nombre del item</label>
      <input id="editName" v-model="editName" type="text" placeholder="Nombre del item" required />
    </div>
    <button type="submit" class="submit-btn" :disabled="!canSubmit || props.isSubmitting">
      {{ props.isSubmitting ? 'Guardando...' : 'Guardar cambios' }}
    </button>
  </form>
</template>

<style scoped>
.item-form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--dark-color);
  font-weight: 500;
}

.form-group input {
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  padding: 8px 10px;
  background-color: var(--main-color);
  color: var(--dark-color);
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--contrast-color);
}

.submit-btn {
  height: 38px;
  border: none;
  border-radius: 6px;
  background-color: var(--dark-color);
  color: var(--main-color);
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
