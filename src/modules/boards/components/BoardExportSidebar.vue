<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import SideBar from '@/shared/components/SideBar.vue'
import LoaderComponent from '@/core/components/LoaderComponent.vue'
import type { Group } from '../types/groups'
import type { Column } from '@/shared/types/columns'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  visible: boolean
  boardId: string
  groups: Group[]
  columns: Column[]
  hasTimeline: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
  (e: 'exported'): void
}>()

const selectedGroupIds = ref<Set<string>>(new Set())
const selectedColumnIds = ref<Set<string>>(new Set())
const includeGantt = ref(false)
const isExporting = ref(false)
const errorMessage = ref('')

// Seleccionar todos los grupos y columnas por defecto
watch(
  () => [props.groups, props.columns, props.visible],
  () => {
    if (props.visible) {
      selectedGroupIds.value = new Set(props.groups.map((g) => g.id))
      selectedColumnIds.value = new Set(props.columns.map((c) => c.id))
      includeGantt.value = props.hasTimeline
    }
  },
  { immediate: true, deep: true },
)

const allGroupsSelected = computed({
  get: () => selectedGroupIds.value.size === props.groups.length,
  set: (value: boolean) => {
    if (value) {
      selectedGroupIds.value = new Set(props.groups.map((g) => g.id))
    } else {
      selectedGroupIds.value.clear()
    }
  },
})

const allColumnsSelected = computed({
  get: () => selectedColumnIds.value.size === props.columns.length,
  set: (value: boolean) => {
    if (value) {
      selectedColumnIds.value = new Set(props.columns.map((c) => c.id))
    } else {
      selectedColumnIds.value.clear()
    }
  },
})

const canExport = computed(() => {
  return selectedGroupIds.value.size > 0 && selectedColumnIds.value.size > 0 && !isExporting.value
})

const toggleGroup = (groupId: string) => {
  if (selectedGroupIds.value.has(groupId)) {
    selectedGroupIds.value.delete(groupId)
  } else {
    selectedGroupIds.value.add(groupId)
  }
}

const toggleColumn = (columnId: string) => {
  if (selectedColumnIds.value.has(columnId)) {
    selectedColumnIds.value.delete(columnId)
  } else {
    selectedColumnIds.value.add(columnId)
  }
}

const handleClose = () => {
  if (isExporting.value) return
  emit('close')
  emit('update:visible', false)
  errorMessage.value = ''
}

const handleExport = async () => {
  if (!canExport.value) return

  isExporting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      groupIds: Array.from(selectedGroupIds.value),
      columnIds: Array.from(selectedColumnIds.value),
      includeGantt: includeGantt.value && props.hasTimeline,
    }

    const response = await fetch(`${API_BASE_URL}/boards/${props.boardId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error al exportar: ${response.statusText}`)
    }

    // Obtener el blob del archivo
    const blob = await response.blob()

    // Extraer el nombre del archivo del header Content-Disposition si está disponible
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `export_${new Date().toISOString().slice(0, 10)}.xlsx`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Limpiar
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    emit('exported')
    handleClose()
  } catch (error) {
    console.error('Error al exportar:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Error desconocido al exportar'
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <SideBar :is-open="visible" @close="handleClose">
    <template #header>
      <h2 class="sidebar-title">Exportar a Excel</h2>
    </template>

    <div v-if="isExporting" class="loading-container">
      <LoaderComponent />
      <p class="loading-text">Generando archivo Excel...</p>
    </div>

    <div v-else class="export-options">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Selección de grupos -->
      <section class="selection-section">
        <div class="section-header">
          <h3>Grupos a exportar</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="allGroupsSelected" />
            <span>Seleccionar todos</span>
          </label>
        </div>
        <div class="items-list">
          <label v-for="group in groups" :key="group.id" class="checkbox-label item-label">
            <input
              type="checkbox"
              :checked="selectedGroupIds.has(group.id)"
              @change="toggleGroup(group.id)"
            />
            <span class="item-name">
              <span class="group-color-indicator" :style="{ backgroundColor: group.color }"></span>
              {{ group.name }}
            </span>
          </label>
        </div>
      </section>

      <!-- Selección de columnas -->
      <section class="selection-section">
        <div class="section-header">
          <h3>Columnas a exportar</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="allColumnsSelected" />
            <span>Seleccionar todas</span>
          </label>
        </div>
        <div class="items-list">
          <label v-for="column in columns" :key="column.id" class="checkbox-label item-label">
            <input
              type="checkbox"
              :checked="selectedColumnIds.has(column.id)"
              @change="toggleColumn(column.id)"
            />
            <span class="item-name">
              {{ column.name }}
              <span class="column-type">({{ column.type }})</span>
            </span>
          </label>
        </div>
      </section>

      <!-- Opción de incluir Gantt -->
      <section v-if="hasTimeline" class="selection-section">
        <label class="checkbox-label">
          <input type="checkbox" v-model="includeGantt" />
          <span>Incluir hoja de Gantt</span>
        </label>
      </section>
    </div>

    <div class="sidebar-footer">
      <button type="button" class="btn btn-secondary" @click="handleClose" :disabled="isExporting">
        Cancelar
      </button>
      <button type="button" class="btn btn-primary" @click="handleExport" :disabled="!canExport">
        {{ isExporting ? 'Exportando...' : 'Exportar' }}
      </button>
    </div>
  </SideBar>
</template>

<style scoped>
.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  min-height: 200px;
}

.loading-text {
  font-size: 0.95rem;
  color: var(--dark-color);
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.error-message {
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  font-size: 0.9rem;
}

.selection-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--ter-color);
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
}

.item-label {
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.item-label:hover {
  background-color: var(--sec-color);
}

.item-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-type {
  font-size: 0.8rem;
  color: var(--dark-color);
  opacity: 0.75;
}

.sidebar-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--ter-color);
  background-color: var(--main-color);
  position: sticky;
  bottom: 0;
}

.btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--sec-color);
  color: var(--dark-color);
  border: 1px solid var(--ter-color);
}

.btn-secondary:hover:not(:disabled) {
  filter: brightness(0.97);
}

.btn-primary {
  background-color: var(--contrast-color);
  color: var(--main-color);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(0.93);
}

/* Estilos para scrollbar */
.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: transparent;
}

.items-list::-webkit-scrollbar-thumb {
  background: var(--ter-color);
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: var(--dark-color);
}
</style>
