<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Value } from '../../types/values'
import type { TableValue } from '../../types/tableValues'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import { useTableValuesStore } from '@/stores/tableValues'

interface Props {
  value: Value
}

type StatusTag = {
  color: string
  text: string
}

const props = defineProps<Props>()
const tableValuesStore = useTableValuesStore()
const overlayMenu = ref<InstanceType<typeof OverlayMenu> | null>(null)

const statusProperties = computed<StatusTag>(() => JSON.parse(props.value.value))

const columnOptions = computed<TableValue[]>(() => {
  const column = tableValuesStore.tableValuesByColumn.find(
    (col) => col.columnId === props.value.columnId,
  )
  return column?.values ?? []
})

const parseTag = (rawValue: string): StatusTag => {
  try {
    return JSON.parse(rawValue)
  } catch {
    return { color: '#cccccc', text: rawValue }
  }
}

const updateItemValue = (tableValue: TableValue) => {
  props.value.value = tableValue.value
  overlayMenu.value?.close()
}
</script>

<template>
  <span
    class="cell-text"
    :style="{ backgroundColor: statusProperties.color }"
    @click="overlayMenu?.toggle($event)"
  >
    {{ statusProperties.text }}
  </span>

  <OverlayMenu ref="overlayMenu">
    <template #header>Etiquetas</template>
    <template #content>
      <div class="status-grid">
        <div
          v-for="option in columnOptions"
          :key="option.id"
          class="status-grid__item"
          :style="{ backgroundColor: parseTag(option.value).color }"
          @click="updateItemValue(option)"
        >
          {{ parseTag(option.value).text }}
        </div>
      </div>
    </template>
  </OverlayMenu>
</template>

<style scoped>
.cell-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  padding: 0.5rem;
  min-width: 400px;
}

@media (max-width: 767px) {
  .status-grid {
    grid-template-columns: repeat(3, 1fr);
    min-width: unset;
    width: 100%;
  }
}

.status-grid__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.5rem;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s ease;
}

.status-grid__item:hover {
  opacity: 0.85;
}
</style>
