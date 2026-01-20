<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { Group } from '../types/groups'

const props = defineProps<{
  groups: Group[]
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [selectedIds: number[]]
}>()

const selectedGroupIds = ref<number[]>([...props.modelValue])

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    selectedGroupIds.value = [...newValue]
  },
)

// Watch for internal changes and emit
watch(
  selectedGroupIds,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true },
)

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
</script>

<template>
  <div class="group-selector">
    <div v-if="groups.length > 0" class="groups-list">
      <label
        v-for="group in groups"
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
</template>

<style scoped>
.group-selector {
  width: 100%;
}

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
</style>
