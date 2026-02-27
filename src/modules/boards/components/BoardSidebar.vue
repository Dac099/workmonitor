<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import type { Group } from '../types/groups'
import type { Column } from '@/shared/types/columns'
import BoardGroupsList from './BoardGroupsList.vue'
import SideBar from '@/shared/components/SideBar.vue'
import BoardExportSidebar from './BoardExportSidebar.vue'
import { useBoardSidebar } from '../composables/useBoardSidebar'
import { useExport } from '../composables/useExport'
import BoardsList from '@/modules/projectsHome/components/BoardsList.vue'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  groups: Group[]
  selectedGroupId: string | null
  boardName: string
  boardId: string
  hasTimeline: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const exportColumns = ref<Column[]>([])
const { showExportSidebar, openExportSidebar, closeExportSidebar } = useExport()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', groupId: string): void
  (e: 'groups-change', groups: Group[]): void
}>()

const {
  availableColors,
  menuRef,
  boardsMenuRef,
  isCreateGroupOpen,
  groupName,
  selectedColor,
  isSubmitting,
  canSubmit,
  isBoardsLoading,
  boards,
  toggleMenu,
  toggleBoardsMenu,
  openCreateGroup,
  closeCreateGroup,
  handleSubmitGroup,
} = useBoardSidebar({
  getGroups: () => props.groups,
  onGroupsChange: (groups) => emit('groups-change', groups),
})

const handleGanttView = () => {
  router.push({ path: `/projects/boards/${props.boardId}/gantt` })
}

const handleExport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/columns/board/${props.boardId}`)
    if (!response.ok) {
      throw new Error('No se pudieron cargar las columnas para exportar')
    }

    exportColumns.value = await response.json()
    openExportSidebar()
  } catch (error) {
    console.error('Error al preparar exportación:', error)
  }
}
</script>

<template>
  <article>
    <aside class="main-container--sidebar">
      <section class="sidebar-header">
        <h4 class="board-title" :title="props.boardName" @click="toggleBoardsMenu($event)">
          {{ props.boardName }}
        </h4>
        <div>
          <button type="button" @click="toggleMenu($event)">
            <i class="nf nf-md-dots_vertical"></i>
          </button>
          <button type="button" @click="emit('close')">
            <i class="nf nf-cod-layout_sidebar_left"></i>
          </button>
        </div>
      </section>
      <hr />
      <section class="sidebar-content">
        <BoardGroupsList
          :groups="props.groups"
          :selected-group-id="props.selectedGroupId"
          @select="emit('select', $event)"
          @groups-change="emit('groups-change', $event)"
        />
      </section>
      <OverlayMenu ref="menuRef">
        <template #header>Opciones</template>
        <template #content>
          <section class="options-container">
            <button type="button" @click="openCreateGroup">Crear grupo</button>
            <button v-if="props.hasTimeline" type="button" @click="handleGanttView">
              Vista Gantt
            </button>
            <button type="button" @click="handleExport">Exportar tablero</button>
          </section>
        </template>
      </OverlayMenu>

      <OverlayMenu ref="boardsMenuRef">
        <template #header>Tableros</template>
        <template #content>
          <section class="boards-overlay">
            <div v-if="isBoardsLoading" class="boards-overlay__empty">Cargando tableros...</div>
            <div v-else-if="boards.length === 0" class="boards-overlay__empty">No hay tableros</div>
            <BoardsList v-else :boards="boards" :is-compact="true" />
          </section>
        </template>
      </OverlayMenu>
    </aside>

    <SideBar :is-open="isCreateGroupOpen" :initial-width="420" @close="closeCreateGroup">
      <template #header>
        <h4>Crear grupo</h4>
      </template>
      <form class="create-group-body" @submit.prevent="handleSubmitGroup">
        <div class="input-group">
          <label for="groupName">Nombre del grupo</label>
          <input
            id="groupName"
            v-model="groupName"
            type="text"
            name="groupName"
            placeholder="Nombre del grupo"
            required
          />
        </div>

        <div class="input-group">
          <label>Color</label>
          <div class="color-grid">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              class="color-swatch"
              :class="{ 'is-selected': selectedColor === color }"
              :style="{ backgroundColor: color }"
              :aria-pressed="selectedColor === color"
              @click="selectedColor = color"
            ></button>
          </div>
        </div>

        <button type="submit" class="submit-button" :disabled="!canSubmit || isSubmitting">
          Crear grupo
        </button>
      </form>
    </SideBar>

    <BoardExportSidebar
      :visible="showExportSidebar"
      :board-id="props.boardId"
      :groups="props.groups"
      :columns="exportColumns"
      :has-timeline="props.hasTimeline"
      @close="closeExportSidebar"
    />
  </article>
</template>

<style scoped>
.main-container--sidebar {
  width: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  border: 1px solid var(--ter-color);
  border-radius: 5px;
  background-color: var(--main-color);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  user-select: none;

  h4 {
    color: var(--contrast-color);
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .board-title {
    cursor: pointer;
  }

  button {
    width: 30px;
    margin-right: 5px;
    cursor: pointer;
    background-color: var(--dark-color);
    border: none;
    color: var(--main-color);
    border-radius: 3px;
    font-size: 1.2rem;
  }

  button:hover {
    background-color: var(--contrast-color);
  }
}

.options-container {
  display: grid;
  grid-auto-rows: 35px;
  grid-template-columns: 1fr;
}

.options-container button {
  cursor: pointer;
  background-color: var(--main-color);
  border: none;
  outline: none;
  text-align: left;
  padding: 0 5px;
}

.options-container button:hover {
  background-color: var(--ter-color);
}

.sidebar-content {
  padding: 8px 6px 12px;
}

.boards-overlay {
  max-height: 70vh;
  overflow: auto;
  padding: 0 12px 12px;
}

.boards-overlay__empty {
  padding: 8px 12px;
  color: var(--dark-color);
  font-size: 0.9rem;
}

.create-group-body {
  color: var(--dark-color);
  display: grid;
  gap: 16px;
}

.input-group {
  display: grid;
  gap: 6px;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--dark-color);
}

.input-group input {
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  padding: 8px 10px;
  background-color: var(--main-color);
  color: var(--dark-color);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
  gap: 8px;
}

.color-swatch {
  height: 26px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-swatch.is-selected {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 2px var(--main-color) inset;
}

.submit-button {
  height: 38px;
  border: none;
  border-radius: 6px;
  background-color: var(--dark-color);
  color: var(--main-color);
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-container--sidebar {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    z-index: 30;
  }
}
</style>
