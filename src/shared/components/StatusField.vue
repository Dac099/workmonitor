<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const statusOptions = [
  { label: 'Pendiente', value: 'pending', color: '#FF8C42' },
  { label: 'En Progreso', value: 'in-progress', color: '#1a73e8' },
  { label: 'Completado', value: 'completed', color: '#04724D' },
  { label: 'Cancelado', value: 'cancelled', color: '#D7263D' },
]

const isOpen = ref(false)

const selectedStatus = ref(
  statusOptions.find((opt) => opt.value === props.value) || statusOptions[0],
)

const selectStatus = (option: (typeof statusOptions)[0]) => {
  selectedStatus.value = option
  emit('change', option.value)
  isOpen.value = false
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="status-field">
    <button
      type="button"
      class="status-button"
      :style="{ borderColor: selectedStatus.color }"
      @click="toggleDropdown"
    >
      <span class="status-indicator" :style="{ backgroundColor: selectedStatus.color }"></span>
      <span class="status-label">{{ selectedStatus.label }}</span>
      <span class="status-arrow">▼</span>
    </button>

    <div v-if="isOpen" class="status-dropdown">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        type="button"
        class="status-option"
        :class="{ 'status-option--selected': option.value === selectedStatus.value }"
        @click="selectStatus(option)"
      >
        <span class="status-indicator" :style="{ backgroundColor: option.color }"></span>
        <span class="status-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.status-field {
  position: relative;
  width: 100%;
}

.status-button {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-button:hover {
  background-color: #f1f3f4;
}

.status-button:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-label {
  flex: 1;
  text-align: left;
  color: #202124;
}

.status-arrow {
  font-size: 0.625rem;
  color: #5f6368;
}

.status-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.status-option {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background-color: white;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-option:hover {
  background-color: #f1f3f4;
}

.status-option--selected {
  background-color: #e8f0fe;
}
</style>
