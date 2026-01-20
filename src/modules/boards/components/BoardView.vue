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
const groupsList = ref<Group[]>([])

// Unified sidebar state
type SidebarType =
  | 'create-group'
  | 'duplicate-board'
  | 'export-board'
  | 'add-column'
  | 'move-group'
  | 'edit-group'
  | null
const activeSidebar = ref<SidebarType>(null)

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

// Unified sidebar control
const openSidebar = (type: SidebarType) => {
  activeSidebar.value = type
}

const closeSidebar = () => {
  activeSidebar.value = null
}

// Sidebar configuration
const sidebarConfig = computed(() => {
  if (!activeSidebar.value) return null

  const configs = {
    'create-group': {
      component: CreateGroupForm,
      title: 'Crear Nuevo Grupo',
      props: {},
    },
    'duplicate-board': {
      component: DuplicateBoardForm,
      title: 'Duplicar Tablero',
      props: { groups: groupsList.value },
    },
    'export-board': {
      component: ExportBoardForm,
      title: 'Exportar Tablero',
      props: { groups: groupsList.value },
    },
    'add-column': {
      component: AddColumnForm,
      title: 'Agregar Columna',
      props: {},
    },
    'move-group': {
      component: MoveGroupForm,
      title: 'Mover Grupo',
      props: {},
    },
    'edit-group': {
      component: EditGroupForm,
      title: 'Editar Grupo',
      props: selectedGroup.value ? { group: selectedGroup.value } : {},
    },
  }

  return configs[activeSidebar.value] || null
})

const sidebarEventHandlers = computed(() => {
  if (!activeSidebar.value) return {}

  const handlers = {
    'create-group': {
      onSubmit: handleCreateGroup,
      onCancel: closeSidebar,
    },
    'duplicate-board': {
      onSubmit: handleDuplicateForm,
      onCancel: closeSidebar,
    },
    'export-board': {
      onSubmit: handleExportForm,
      onCancel: closeSidebar,
    },
    'add-column': {
      onSubmit: handleAddColumn,
      onCancel: closeSidebar,
    },
    'move-group': {
      onSubmit: handleMoveGroup,
      onCancel: closeSidebar,
    },
    'edit-group': {
      onSubmit: handleEditGroup,
      onDelete: handleDeleteGroup,
      onCancel: closeSidebar,
    },
  }

  return handlers[activeSidebar.value] || {}
})

// Handlers
const handleCreateGroup = (groupForm: NewGroup) => {
  const newId = Math.max(...groupsList.value.map((g) => g.id), 0) + 1
  const newGroup: Group = {
    id: newId,
    name: groupForm.name,
    color: groupForm.color,
  }

  groupsList.value.push(newGroup)
  closeSidebar()
  selectedGroupId.value = newId
}

const handleDuplicateForm = (selectedGroupIds: number[], keepValues: boolean) => {
  console.log('Duplicando tablero...')
  console.log('Grupos seleccionados:', selectedGroupIds)
  console.log('Conservar valores:', keepValues)
  closeSidebar()
}

const handleExportForm = (selectedGroupIds: number[], exportView: 'groups' | 'gantt') => {
  console.log('Exportando tablero...')
  console.log('Grupos seleccionados:', selectedGroupIds)
  console.log('Vista de exportación:', exportView)
  closeSidebar()
}

const handleAddColumn = (newColumn: NewColumn) => {
  const column = columnsStore.addColumn(newColumn)
  console.log('Columna agregada:', column)
  closeSidebar()
}

const handleMoveGroup = (action: 'move-and-delete' | 'move-and-keep') => {
  console.log('Mover grupo:', action)
  console.log('Grupo seleccionado:', selectedGroup.value)
  closeSidebar()
}

const handleEditGroup = (updates: { name: string; color: string }) => {
  if (!selectedGroup.value) return

  const group = groupsList.value.find((g) => g.id === selectedGroup.value!.id)
  if (group) {
    group.name = updates.name
    group.color = updates.color
  }

  closeSidebar()
}

const handleDeleteGroup = () => {
  if (!selectedGroup.value) return

  const index = groupsList.value.findIndex((g) => g.id === selectedGroup.value!.id)
  if (index > -1) {
    groupsList.value.splice(index, 1)
    // Select first group or none
    selectedGroupId.value = groupsList.value[0]?.id || 0
  }

  closeSidebar()
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
        <button type="button" @click="openSidebar('create-group')">Nuevo Grupo</button>
        <button type="button" @click="openSidebar('export-board')">Exportar</button>
        <button type="button" @click="openSidebar('duplicate-board')">Duplicar</button>
      </section>
    </section>
    <section class="main-container--body">
      <GroupView
        :selected-group="selectedGroup"
        @add-column="openSidebar('add-column')"
        @move-group="openSidebar('move-group')"
        @edit-group="openSidebar('edit-group')"
      />
    </section>

    <!-- Dynamic Sidebar -->
    <SideBar :is-open="!!activeSidebar" @close="closeSidebar">
      <template #header>
        <h2>{{ sidebarConfig?.title }}</h2>
      </template>
      <component
        :is="sidebarConfig?.component"
        v-bind="{ ...sidebarConfig?.props, ...sidebarEventHandlers }"
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
