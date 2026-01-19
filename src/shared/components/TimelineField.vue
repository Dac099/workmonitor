<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

// Parse the timeline entries from the value string
// Format: "2024-01-15: Event 1\n2024-01-16: Event 2"
const timelineEntries = computed(() => {
  if (!props.value) return []
  return props.value.split('\n').filter((entry) => entry.trim())
})

const newEntry = ref('')
const newDate = ref('')

const addEntry = () => {
  if (!newDate.value || !newEntry.value.trim()) return

  const entry = `${newDate.value}: ${newEntry.value.trim()}`
  const updatedValue = props.value ? `${props.value}\n${entry}` : entry

  emit('change', updatedValue)

  // Reset inputs
  newEntry.value = ''
  newDate.value = ''
}

const removeEntry = (index: number) => {
  const entries = props.value.split('\n').filter((entry) => entry.trim())
  entries.splice(index, 1)
  emit('change', entries.join('\n'))
}
</script>

<template>
  <div class="timeline-field">
    <div class="timeline-list">
      <div v-for="(entry, index) in timelineEntries" :key="index" class="timeline-entry">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <p class="timeline-text">{{ entry }}</p>
          <button
            type="button"
            class="timeline-remove"
            @click="removeEntry(index)"
            title="Eliminar entrada"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-if="timelineEntries.length === 0" class="timeline-empty">
        No hay entradas en la línea de tiempo
      </div>
    </div>

    <div class="timeline-add">
      <input v-model="newDate" type="date" class="timeline-date-input" placeholder="Fecha" />
      <input
        v-model="newEntry"
        type="text"
        class="timeline-text-input"
        placeholder="Descripción del evento..."
        @keyup.enter="addEntry"
      />
      <button
        type="button"
        class="timeline-add-button"
        @click="addEntry"
        :disabled="!newDate || !newEntry.trim()"
      >
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.timeline-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-entry {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1a73e8;
  margin-top: 4px;
  flex-shrink: 0;
  position: relative;
}

.timeline-marker::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 12px);
  background-color: #dadce0;
}

.timeline-entry:last-child .timeline-marker::after {
  display: none;
}

.timeline-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 4px 8px;
  background-color: #f1f3f4;
  border-radius: 4px;
}

.timeline-text {
  flex: 1;
  margin: 0;
  font-size: 0.875rem;
  color: #202124;
  line-height: 1.5;
}

.timeline-remove {
  background: none;
  border: none;
  color: #5f6368;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.timeline-remove:hover {
  background-color: #dadce0;
  color: #d7263d;
}

.timeline-empty {
  padding: 1rem;
  text-align: center;
  color: #5f6368;
  font-size: 0.875rem;
  background-color: #f1f3f4;
  border-radius: 4px;
}

.timeline-add {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.timeline-date-input {
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
  width: 150px;
}

.timeline-text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.timeline-date-input:focus,
.timeline-text-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.timeline-add-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background-color: #1a73e8;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-add-button:hover:not(:disabled) {
  background-color: #1557b0;
}

.timeline-add-button:disabled {
  background-color: #dadce0;
  cursor: not-allowed;
}
</style>
