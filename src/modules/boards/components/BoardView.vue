<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useColumnsStore } from '@/stores/columns'
import GroupsList from './GroupsList.vue'
import GroupView from './GroupView.vue'
import SideBar from '@/shared/components/SideBar.vue'
import CreateGroupForm from './CreateGroupForm.vue'
import DuplicateBoardForm from './DuplicateBoardForm.vue'
import ExportBoardForm from './ExportBoardForm.vue'
import AddColumnForm from './AddColumnForm.vue'
import MoveGroupForm from './MoveGroupForm.vue'
import EditGroupForm from './EditGroupForm.vue'
import type { Group, NewGroup } from '../types/groups'
import type { NewColumn } from '@/shared/types/columns'

const route = useRoute()
const columnsStore = useColumnsStore()

const selectedGroupId = ref<number>(0)
const isCreateGroupSidebarOpen = ref(false)
const isDuplicateGroupSidebarOpen = ref(false)
const isExportSidebarOpen = ref(false)
const isAddColumnSidebarOpen = ref(false)
const isMoveGroupSidebarOpen = ref(false)
const isEditGroupSidebarOpen = ref(false)

const groupsList = ref<Group[]>([])

const selectedGroup = computed(() => {
  return groupsList.value.find((g) => g.id === selectedGroupId.value) || null
})

// Initialize columns store with default columns
onMounted(() => {
  columnsStore.initializeDefaultColumns()
})

const handleGroupSelected = (groupId: number) => {
  selectedGroupId.value = groupId
}

const openCreateGroupSidebar = () => {
  isCreateGroupSidebarOpen.value = true
}

const closeCreateGroupSidebar = () => {
  isCreateGroupSidebarOpen.value = false
}

const openDuplicateGroupSidebar = () => {
  isDuplicateGroupSidebarOpen.value = true
}

const closeDuplicateGroupSidebar = () => {
  isDuplicateGroupSidebarOpen.value = false
}

const openExportSidebar = () => {
  isExportSidebarOpen.value = true
}

const closeExportSidebar = () => {
  isExportSidebarOpen.value = false
}

const openAddColumnSidebar = () => {
  isAddColumnSidebarOpen.value = true
}

const closeAddColumnSidebar = () => {
  isAddColumnSidebarOpen.value = false
}

const openMoveGroupSidebar = () => {
  isMoveGroupSidebarOpen.value = true
}

const closeMoveGroupSidebar = () => {
  isMoveGroupSidebarOpen.value = false
}

const openEditGroupSidebar = () => {
  isEditGroupSidebarOpen.value = true
}

const closeEditGroupSidebar = () => {
  isEditGroupSidebarOpen.value = false
}

const handleCreateGroup = (groupForm: NewGroup) => {
  const newId = Math.max(...groupsList.value.map((g) => g.id), 0) + 1
  const newGroup: Group = {
    id: newId,
    name: groupForm.name,
    color: groupForm.color,
  }

  groupsList.value.push(newGroup)
  closeCreateGroupSidebar()

  selectedGroupId.value = newId
}

const handleDuplicateForm = (selectedGroupIds: number[], keepValues: boolean) => {
  console.log('Duplicando tablero...')
  console.log('Grupos seleccionados:', selectedGroupIds)
  console.log('Conservar valores:', keepValues)

  closeDuplicateGroupSidebar()
}

const handleExportForm = (selectedGroupIds: number[], exportView: 'groups' | 'gantt') => {
  console.log('Exportando tablero...')
  console.log('Grupos seleccionados:', selectedGroupIds)
  console.log('Vista de exportación:', exportView)

  closeExportSidebar()
}

const handleAddColumn = (newColumn: NewColumn) => {
  const column = columnsStore.addColumn(newColumn)
  console.log('Columna agregada:', column)
  closeAddColumnSidebar()
}

const handleMoveGroup = (action: 'move-and-delete' | 'move-and-keep') => {
  console.log('Mover grupo:', action)
  console.log('Grupo seleccionado:', selectedGroup.value)
  closeMoveGroupSidebar()
}

const handleEditGroup = (updates: { name: string; color: string }) => {
  if (!selectedGroup.value) return

  const group = groupsList.value.find((g) => g.id === selectedGroup.value!.id)
  if (group) {
    group.name = updates.name
    group.color = updates.color
  }

  closeEditGroupSidebar()
}

const handleDeleteGroup = () => {
  if (!selectedGroup.value) return

  const index = groupsList.value.findIndex((g) => g.id === selectedGroup.value!.id)
  if (index > -1) {
    groupsList.value.splice(index, 1)
    // Select first group or none
    selectedGroupId.value = groupsList.value[0]?.id || 0
  }

  closeEditGroupSidebar()
}
</script>

<template>
  <article class="main-container">
    <section class="main-container--header">
      <section class="header--actions-container">
        <h3>Tablero {{ route.params.boardId }}</h3>
        <GroupsList
          :groups="groupsList"
          :selected-group-id="selectedGroupId"
          @group-selected="handleGroupSelected"
        />
      </section>
      <section class="header--actions">
        <button type="button" @click="openCreateGroupSidebar">Nuevo Grupo</button>
        <button type="button" @click="openExportSidebar">Exportar</button>
        <button type="button" @click="openDuplicateGroupSidebar">Duplicar</button>
      </section>
    </section>
    <section class="main-container--body">
      <GroupView
        :selected-group="selectedGroup"
        @add-column="openAddColumnSidebar"
        @move-group="openMoveGroupSidebar"
        @edit-group="openEditGroupSidebar"
      />
    </section>

    <!-- Sidebar para crear nuevo grupo -->
    <SideBar :is-open="isCreateGroupSidebarOpen" @close="closeCreateGroupSidebar">
      <template #header>
        <h2>Crear Nuevo Grupo</h2>
      </template>
      <CreateGroupForm @submit="handleCreateGroup" @cancel="closeCreateGroupSidebar" />
    </SideBar>

    <!-- Sidebar para duplicar tablero -->
    <SideBar :is-open="isDuplicateGroupSidebarOpen" @close="closeDuplicateGroupSidebar">
      <template #header>
        <h2>Duplicar Tablero</h2>
      </template>
      <DuplicateBoardForm
        :groups="groupsList"
        @submit="handleDuplicateForm"
        @cancel="closeDuplicateGroupSidebar"
      />
    </SideBar>

    <!-- Sidebar para exportar tablero -->
    <SideBar :is-open="isExportSidebarOpen" @close="closeExportSidebar">
      <template #header>
        <h2>Exportar Tablero</h2>
      </template>
      <ExportBoardForm
        :groups="groupsList"
        @submit="handleExportForm"
        @cancel="closeExportSidebar"
      />
    </SideBar>

    <!-- Sidebar para agregar columna -->
    <SideBar :is-open="isAddColumnSidebarOpen" @close="closeAddColumnSidebar">
      <template #header>
        <h2>Agregar Columna</h2>
      </template>
      <AddColumnForm @submit="handleAddColumn" @cancel="closeAddColumnSidebar" />
    </SideBar>

    <!-- Sidebar para mover grupo -->
    <SideBar :is-open="isMoveGroupSidebarOpen" @close="closeMoveGroupSidebar">
      <template #header>
        <h2>Mover Grupo</h2>
      </template>
      <MoveGroupForm @submit="handleMoveGroup" @cancel="closeMoveGroupSidebar" />
    </SideBar>

    <!-- Sidebar para editar grupo -->
    <SideBar v-if="selectedGroup" :is-open="isEditGroupSidebarOpen" @close="closeEditGroupSidebar">
      <template #header>
        <h2>Editar Grupo</h2>
      </template>
      <EditGroupForm
        :group="selectedGroup"
        @submit="handleEditGroup"
        @delete="handleDeleteGroup"
        @cancel="closeEditGroupSidebar"
      />
    </SideBar>
  </article>
</template>

<style scoped>
.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-container--header {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.main-container--header h3 {
  color: var(--dark-color);
  margin-bottom: 20px;
}

.header--actions-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header--actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 20px;
}

.header--actions button {
  padding: 5px 10px;
  cursor: pointer;
  background-color: var(--dark-color);
  color: var(--main-color);
  border: 1px solid var(--dark-color);
  border-radius: 5px;
  transition: all 0.3s ease;
}

.header--actions button:hover {
  background-color: var(--main-color);
  color: var(--dark-color);
}

.main-container--body {
  flex: 1;
  overflow: hidden;
}

h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #202124;
  font-weight: 500;
}
</style>
