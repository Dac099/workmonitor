<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gantt from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { API_BASE_URL } from '@/utils/contants'
import type { Column } from '@/shared/types/columns'
import type { Board } from '../types/board'
import type { GanttBoardData } from '../types/gantt'
import { useTableValueAPI } from '../composables/useTableValueAPI'

type GanttTask = {
  id: string
  text: string
  parent?: string
  start_date?: Date | string
  end_date?: Date | string
  type?: string
  open?: boolean
  unscheduled?: boolean
  isGroup?: boolean
  itemId?: string
  groupId?: string
  timelineValueId?: string | null
}

const route = useRoute()
const router = useRouter()
const ganttContainer = ref<HTMLDivElement | null>(null)
const board = ref<Board | null>(null)
const timelineColumns = ref<Column[]>([])
const selectedTimelineColumnId = ref<string | null>(null)
const ganttData = ref<GanttBoardData | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isGanttReady = ref(false)
const ganttUpdateEventId = ref<string | number | null>(null)
const isInitializing = ref(false)
const { isSaving, save: saveTableValue } = useTableValueAPI()

const boardId = computed(() => route.params.boardId as string)

const hasTimelineColumns = computed(() => timelineColumns.value.length > 0)

const parseTimelineValue = (value?: string | null) => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.length < 2) return null
    const start = new Date(parsed[0])
    const end = new Date(parsed[1])
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    return { start, end }
  } catch {
    return null
  }
}

const toDateOnly = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toTimelineJson = (start: Date, end: Date) => {
  const startISO = `${toDateOnly(start)}T06:00:00.000Z`
  const endISO = `${toDateOnly(end)}T06:00:00.000Z`
  return JSON.stringify([startISO, endISO])
}

const ganttTasks = computed<GanttTask[]>(() => {
  if (!ganttData.value) return []

  const groups = ganttData.value.groups.map((group) => ({
    id: `group-${group.id}`,
    text: group.name,
    type: 'project',
    open: true,
    isGroup: true,
    groupId: group.id,
  }))

  const items = ganttData.value.items.map((item) => {
    const parsed = parseTimelineValue(item.timelineValue)
    if (parsed) {
      return {
        id: item.id,
        text: item.name,
        parent: `group-${item.groupId}`,
        start_date: parsed.start,
        end_date: parsed.end,
        unscheduled: false,
        isGroup: false,
        itemId: item.id,
        groupId: item.groupId,
        timelineValueId: item.timelineValueId,
      }
    }

    return {
      id: item.id,
      text: item.name,
      parent: `group-${item.groupId}`,
      unscheduled: true,
      isGroup: false,
      itemId: item.id,
      groupId: item.groupId,
      timelineValueId: item.timelineValueId,
    }
  })

  return [...groups, ...items]
})

const updateLocalTimelineValue = (itemId: string, value: string, valueId?: string | null) => {
  if (!ganttData.value) return
  const item = ganttData.value.items.find((entry) => entry.id === itemId)
  if (!item) return
  item.timelineValue = value
  if (valueId) {
    item.timelineValueId = valueId
  }
}

const handleTaskUpdate = async (task: GanttTask) => {
  if (task.isGroup || !task.itemId || !selectedTimelineColumnId.value) return
  if (!task.start_date || !task.end_date) return

  const start = task.start_date instanceof Date ? task.start_date : new Date(task.start_date)
  const end = task.end_date instanceof Date ? task.end_date : new Date(task.end_date)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

  const newValue = toTimelineJson(start, end)
  updateLocalTimelineValue(task.itemId, newValue)

  await saveTableValue({
    valueId: task.timelineValueId ?? undefined,
    itemId: task.itemId,
    columnId: selectedTimelineColumnId.value,
    value: newValue,
    onSuccess: (created) => {
      updateLocalTimelineValue(task.itemId!, newValue, created.id)
      const updatedTask = gantt.getTask(task.id)
      updatedTask.timelineValueId = created.id
    },
  })
}

const initGantt = () => {
  if (isGanttReady.value || !ganttContainer.value) return

  console.log('Initializing Gantt')
  gantt.config.columns = [
    { name: 'text', label: 'Item', tree: true, width: '*', resize: true },
    { name: 'start_date', label: 'Inicio', align: 'center', width: 110 },
    { name: 'end_date', label: 'Fin', align: 'center', width: 110 },
  ]
  gantt.config.show_unscheduled = true
  gantt.config.open_tree_initially = true
  gantt.init(ganttContainer.value)
  console.log('Gantt initialized')

  ganttUpdateEventId.value = gantt.attachEvent(
    'onAfterTaskUpdate',
    (_id: string | number, task: GanttTask) => {
      void handleTaskUpdate(task)
      return true
    },
  )

  isGanttReady.value = true
}

const loadBoard = async () => {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId.value}`)
  if (!response.ok) {
    throw new Error('No se pudo cargar el tablero')
  }
  board.value = await response.json()
}

const loadTimelineColumns = async () => {
  const response = await fetch(`${API_BASE_URL}/columns/board/${boardId.value}`)
  if (!response.ok) {
    throw new Error('No se pudieron cargar las columnas')
  }
  const columns: Column[] = await response.json()
  timelineColumns.value = columns.filter((column) => column.type === 'timeline')
  selectedTimelineColumnId.value = timelineColumns.value[0]?.id ?? null
}

const loadGanttData = async () => {
  if (!selectedTimelineColumnId.value) {
    ganttData.value = {
      boardId: boardId.value,
      timelineColumnId: null,
      timelineColumnName: null,
      groups: [],
      items: [],
    }
    console.log('No timeline column selected')
    return
  }

  const url = `${API_BASE_URL}/boards/${boardId.value}/gantt?timelineColumnId=${selectedTimelineColumnId.value}`
  console.log('Loading Gantt data from:', url)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No se pudo cargar el Gantt')
  }

  ganttData.value = await response.json()
  console.log('Gantt data loaded:', ganttData.value)
}

const loadPage = async () => {
  isLoading.value = true
  errorMessage.value = ''
  isInitializing.value = true

  try {
    await Promise.all([loadBoard(), loadTimelineColumns()])
    isInitializing.value = false
    await loadGanttData()
    console.log('Page loaded, ganttData:', ganttData.value)
    isLoading.value = false
    // Wait for DOM to render the ganttContainer
    await nextTick()
    console.log('DOM updated, ganttContainer:', ganttContainer.value)
    // Now initialize Gantt with the container available
    if (ganttContainer.value && ganttTasks.value.length > 0) {
      initGantt()
      gantt.clearAll()
      console.log('Parsing Gantt tasks:', ganttTasks.value)
      gantt.parse({ data: ganttTasks.value })
      console.log('Gantt initialized and parsed')
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Ocurrió un error al cargar el Gantt'
    isLoading.value = false
  } finally {
    isInitializing.value = false
  }
}

const goBack = () => {
  router.push({ path: `/projects/boards/${boardId.value}` })
}

watch(selectedTimelineColumnId, async (newValue, oldValue) => {
  if (isInitializing.value) return
  if (!newValue || newValue === oldValue) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await loadGanttData()
    console.log('Timeline column changed, ganttData:', ganttData.value)
    isLoading.value = false
    await nextTick()
    if (ganttContainer.value && ganttTasks.value.length > 0) {
      gantt.clearAll()
      console.log('Parsing Gantt tasks after column change:', ganttTasks.value)
      gantt.parse({ data: ganttTasks.value })
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Ocurrió un error al cargar el Gantt'
    isLoading.value = false
  }
})

onMounted(async () => {
  console.log('Component mounted')
  await loadPage()
  console.log('Page loaded')
})

onBeforeUnmount(() => {
  if (ganttUpdateEventId.value) {
    gantt.detachEvent(ganttUpdateEventId.value)
  }
  gantt.clearAll()
})
</script>

<template>
  <article class="gantt-page">
    <article class="gantt-header">
      <div class="gantt-header__title">
        <button type="button" class="gantt-header__back" @click="goBack">
          <i class="nf nf-cod-arrow_left"></i>
        </button>
        <div>
          <h2>{{ board?.name || 'Gantt' }}</h2>
          <p>Vista de cronograma</p>
        </div>
      </div>
      <div class="gantt-header__actions">
        <label class="gantt-label" for="timeline-column">Columna timeline</label>
        <select
          id="timeline-column"
          class="gantt-select"
          v-model="selectedTimelineColumnId"
          :disabled="!hasTimelineColumns || isLoading"
        >
          <option v-if="!hasTimelineColumns" value="">Sin columnas timeline</option>
          <option v-for="column in timelineColumns" :key="column.id" :value="column.id">
            {{ column.name }}
          </option>
        </select>
      </div>
    </article>

    <section v-if="errorMessage" class="gantt-error">
      <p>{{ errorMessage }}</p>
    </section>

    <section v-else-if="isLoading" class="gantt-loading">Cargando Gantt...</section>

    <section v-else class="gantt-content">
      <div v-if="!hasTimelineColumns" class="gantt-empty">
        Este tablero no tiene columnas timeline.
      </div>
      <div
        v-else-if="ganttData && ganttData.items.length === 0 && ganttData.groups.length === 0"
        class="gantt-empty"
      >
        No hay grupos ni items para mostrar en el Gantt.
      </div>
      <div v-else class="gantt-container" ref="ganttContainer"></div>
      <div v-if="isSaving" class="gantt-saving">Guardando cambios...</div>
    </section>
  </article>
</template>

<style scoped>
.gantt-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  gap: 12px;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.gantt-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gantt-header__title h2 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--dark-color);
}

.gantt-header__title p {
  margin: 0;
  color: var(--dark-color);
  opacity: 0.7;
  font-size: 0.9rem;
}

.gantt-header__back {
  border: none;
  background-color: var(--dark-color);
  color: var(--main-color);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
}

.gantt-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gantt-label {
  font-size: 0.85rem;
  color: var(--dark-color);
}

.gantt-select {
  min-width: 200px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--ter-color);
  background-color: var(--main-color);
  color: var(--dark-color);
}

.gantt-loading,
.gantt-error,
.gantt-empty {
  padding: 16px;
  border-radius: 10px;
  background-color: var(--sec-color);
  color: var(--dark-color);
}

.gantt-content {
  position: relative;
  flex: 1;
  min-height: 0;
}

.gantt-container {
  height: 100%;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--ter-color);
}

.gantt-saving {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background-color: var(--contrast-color);
  color: var(--main-color);
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .gantt-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gantt-header__actions {
    width: 100%;
  }

  .gantt-select {
    width: 100%;
  }
}
</style>
