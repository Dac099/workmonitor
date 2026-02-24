<script setup lang="ts">
import { ref } from 'vue'
import type { Group } from '../../types/groups'

interface Props {
  groups: Group[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [targetGroupId: string]
}>()

const targetGroupId = ref('')

const handleSubmit = () => {
  if (!targetGroupId.value) return
  emit('submit', targetGroupId.value)
}
</script>

<template>
  <form class="item-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="copyTargetGroup">Elige el grupo destino</label>
      <select id="copyTargetGroup" v-model="targetGroupId" required>
        <option value="" disabled>Selecciona un grupo</option>
        <option v-for="group in props.groups" :key="group.id" :value="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>
    <button type="submit" class="submit-btn" :disabled="!targetGroupId">Copiar item</button>
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

.form-group select {
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  padding: 8px 10px;
  background-color: var(--main-color);
  color: var(--dark-color);
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.2s ease;
}

.form-group select:focus {
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
