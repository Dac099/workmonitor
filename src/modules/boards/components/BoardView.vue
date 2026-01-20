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
import type { Item, SubItem } from '../types/items'
import type { Value } from '../types/values'
import type { Chat } from '../types/chats'
import type { NewColumn } from '@/shared/types/columns'

const route = useRoute()
const columnsStore = useColumnsStore()

const selectedGroupId = ref<number>(0)

// Dummy Data Structure: {group, items: {values, chats, subItems}}[]
type GroupWithItems = {
  group: Group
  items: {
    item: Item
    values: Value[]
    chats: Chat[]
    subItems: SubItem[]
  }[]
}

const boardData = ref<GroupWithItems[]>([
  {
    group: { id: 1, name: 'Desarrollo Frontend', color: '#4CAF50' },
    items: [
      {
        item: { id: 'item-1-1', projectId: 'proj-1', name: 'Implementar Dashboard', position: 1 },
        values: [
          { id: 'val-1-1-1', itemId: 'item-1-1', columnId: 'col-status', value: 'En Progreso' },
          { id: 'val-1-1-2', itemId: 'item-1-1', columnId: 'col-priority', value: 'Alta' },
          { id: 'val-1-1-3', itemId: 'item-1-1', columnId: 'col-assignee', value: 'Juan Pérez' },
        ],
        chats: [
          {
            id: 'chat-1-1-1',
            itemId: 'item-1-1',
            message: '¿Necesitamos usar gráficos interactivos?',
            createdBy: 'María García',
            responses: '2',
            tasks: '1',
          },
        ],
        subItems: [
          { id: 'sub-1-1-1', itemId: 'item-1-1', name: 'Diseñar componentes de gráficos' },
          { id: 'sub-1-1-2', itemId: 'item-1-1', name: 'Integrar API de datos' },
        ],
      },
      {
        item: { id: 'item-1-2', projectId: 'proj-1', name: 'Optimizar rendimiento', position: 2 },
        values: [
          { id: 'val-1-2-1', itemId: 'item-1-2', columnId: 'col-status', value: 'Pendiente' },
          { id: 'val-1-2-2', itemId: 'item-1-2', columnId: 'col-priority', value: 'Media' },
          { id: 'val-1-2-3', itemId: 'item-1-2', columnId: 'col-assignee', value: 'Ana López' },
        ],
        chats: [],
        subItems: [{ id: 'sub-1-2-1', itemId: 'item-1-2', name: 'Analizar bundle size' }],
      },
    ],
  },
  {
    group: { id: 2, name: 'Backend API', color: '#2196F3' },
    items: [
      {
        item: { id: 'item-2-1', projectId: 'proj-2', name: 'Crear endpoints REST', position: 1 },
        values: [
          { id: 'val-2-1-1', itemId: 'item-2-1', columnId: 'col-status', value: 'Completado' },
          { id: 'val-2-1-2', itemId: 'item-2-1', columnId: 'col-priority', value: 'Alta' },
          { id: 'val-2-1-3', itemId: 'item-2-1', columnId: 'col-assignee', value: 'Carlos Ruiz' },
        ],
        chats: [
          {
            id: 'chat-2-1-1',
            itemId: 'item-2-1',
            message: 'Endpoints documentados en Swagger',
            createdBy: 'Carlos Ruiz',
            responses: '0',
            tasks: '0',
          },
        ],
        subItems: [
          { id: 'sub-2-1-1', itemId: 'item-2-1', name: 'GET /api/users' },
          { id: 'sub-2-1-2', itemId: 'item-2-1', name: 'POST /api/users' },
          { id: 'sub-2-1-3', itemId: 'item-2-1', name: 'PUT /api/users/:id' },
        ],
      },
      {
        item: {
          id: 'item-2-2',
          projectId: 'proj-2',
          name: 'Implementar autenticación JWT',
          position: 2,
        },
        values: [
          { id: 'val-2-2-1', itemId: 'item-2-2', columnId: 'col-status', value: 'En Progreso' },
          { id: 'val-2-2-2', itemId: 'item-2-2', columnId: 'col-priority', value: 'Crítica' },
          {
            id: 'val-2-2-3',
            itemId: 'item-2-2',
            columnId: 'col-assignee',
            value: 'Laura Martínez',
          },
        ],
        chats: [
          {
            id: 'chat-2-2-1',
            itemId: 'item-2-2',
            message: '¿Usamos refresh tokens?',
            createdBy: 'Pedro Sánchez',
            responses: '3',
            tasks: '2',
          },
        ],
        subItems: [
          { id: 'sub-2-2-1', itemId: 'item-2-2', name: 'Configurar JWT secret' },
          { id: 'sub-2-2-2', itemId: 'item-2-2', name: 'Middleware de autenticación' },
        ],
      },
    ],
  },
  {
    group: { id: 3, name: 'Testing & QA', color: '#FF9800' },
    items: [
      {
        item: {
          id: 'item-3-1',
          projectId: 'proj-3',
          name: 'Tests unitarios componentes',
          position: 1,
        },
        values: [
          { id: 'val-3-1-1', itemId: 'item-3-1', columnId: 'col-status', value: 'En Progreso' },
          { id: 'val-3-1-2', itemId: 'item-3-1', columnId: 'col-priority', value: 'Media' },
          { id: 'val-3-1-3', itemId: 'item-3-1', columnId: 'col-assignee', value: 'Sofia Torres' },
        ],
        chats: [
          {
            id: 'chat-3-1-1',
            itemId: 'item-3-1',
            message: 'Cobertura actual: 65%',
            createdBy: 'Sofia Torres',
            responses: '1',
            tasks: '0',
          },
        ],
        subItems: [
          { id: 'sub-3-1-1', itemId: 'item-3-1', name: 'Test GroupView component' },
          { id: 'sub-3-1-2', itemId: 'item-3-1', name: 'Test BoardView component' },
        ],
      },
      {
        item: {
          id: 'item-3-2',
          projectId: 'proj-3',
          name: 'Tests E2E flujo principal',
          position: 2,
        },
        values: [
          { id: 'val-3-2-1', itemId: 'item-3-2', columnId: 'col-status', value: 'Pendiente' },
          { id: 'val-3-2-2', itemId: 'item-3-2', columnId: 'col-priority', value: 'Alta' },
          { id: 'val-3-2-3', itemId: 'item-3-2', columnId: 'col-assignee', value: 'Diego Morales' },
        ],
        chats: [],
        subItems: [{ id: 'sub-3-2-1', itemId: 'item-3-2', name: 'Configurar Playwright' }],
      },
    ],
  },
  {
    group: { id: 4, name: 'Diseño UX/UI', color: '#E91E63' },
    items: [
      {
        item: { id: 'item-4-1', projectId: 'proj-4', name: 'Rediseño de navegación', position: 1 },
        values: [
          { id: 'val-4-1-1', itemId: 'item-4-1', columnId: 'col-status', value: 'En Revisión' },
          { id: 'val-4-1-2', itemId: 'item-4-1', columnId: 'col-priority', value: 'Alta' },
          { id: 'val-4-1-3', itemId: 'item-4-1', columnId: 'col-assignee', value: 'Elena Vargas' },
        ],
        chats: [
          {
            id: 'chat-4-1-1',
            itemId: 'item-4-1',
            message: 'Prototipo en Figma listo para review',
            createdBy: 'Elena Vargas',
            responses: '5',
            tasks: '1',
          },
          {
            id: 'chat-4-1-2',
            itemId: 'item-4-1',
            message: 'Necesitamos feedback del equipo',
            createdBy: 'Roberto Díaz',
            responses: '2',
            tasks: '0',
          },
        ],
        subItems: [
          { id: 'sub-4-1-1', itemId: 'item-4-1', name: 'Wireframes mobile' },
          { id: 'sub-4-1-2', itemId: 'item-4-1', name: 'Wireframes desktop' },
          { id: 'sub-4-1-3', itemId: 'item-4-1', name: 'Sistema de navegación' },
        ],
      },
      {
        item: { id: 'item-4-2', projectId: 'proj-4', name: 'Guía de estilos', position: 2 },
        values: [
          { id: 'val-4-2-1', itemId: 'item-4-2', columnId: 'col-status', value: 'Completado' },
          { id: 'val-4-2-2', itemId: 'item-4-2', columnId: 'col-priority', value: 'Media' },
          { id: 'val-4-2-3', itemId: 'item-4-2', columnId: 'col-assignee', value: 'Elena Vargas' },
        ],
        chats: [],
        subItems: [
          { id: 'sub-4-2-1', itemId: 'item-4-2', name: 'Paleta de colores' },
          { id: 'sub-4-2-2', itemId: 'item-4-2', name: 'Tipografía' },
        ],
      },
    ],
  },
  {
    group: { id: 5, name: 'DevOps & Infraestructura', color: '#9C27B0' },
    items: [
      {
        item: {
          id: 'item-5-1',
          projectId: 'proj-5',
          name: 'Configurar CI/CD pipeline',
          position: 1,
        },
        values: [
          { id: 'val-5-1-1', itemId: 'item-5-1', columnId: 'col-status', value: 'En Progreso' },
          { id: 'val-5-1-2', itemId: 'item-5-1', columnId: 'col-priority', value: 'Crítica' },
          { id: 'val-5-1-3', itemId: 'item-5-1', columnId: 'col-assignee', value: 'Miguel Ángel' },
        ],
        chats: [
          {
            id: 'chat-5-1-1',
            itemId: 'item-5-1',
            message: 'Pipeline configurado en GitHub Actions',
            createdBy: 'Miguel Ángel',
            responses: '1',
            tasks: '3',
          },
        ],
        subItems: [
          { id: 'sub-5-1-1', itemId: 'item-5-1', name: 'Setup build workflow' },
          { id: 'sub-5-1-2', itemId: 'item-5-1', name: 'Setup test workflow' },
          { id: 'sub-5-1-3', itemId: 'item-5-1', name: 'Setup deploy workflow' },
        ],
      },
      {
        item: { id: 'item-5-2', projectId: 'proj-5', name: 'Monitoreo y logs', position: 2 },
        values: [
          { id: 'val-5-2-1', itemId: 'item-5-2', columnId: 'col-status', value: 'Pendiente' },
          { id: 'val-5-2-2', itemId: 'item-5-2', columnId: 'col-priority', value: 'Media' },
          {
            id: 'val-5-2-3',
            itemId: 'item-5-2',
            columnId: 'col-assignee',
            value: 'Patricia Ramos',
          },
        ],
        chats: [
          {
            id: 'chat-5-2-1',
            itemId: 'item-5-2',
            message: '¿Usamos Datadog o New Relic?',
            createdBy: 'Patricia Ramos',
            responses: '4',
            tasks: '0',
          },
        ],
        subItems: [
          { id: 'sub-5-2-1', itemId: 'item-5-2', name: 'Configurar logging centralizado' },
          { id: 'sub-5-2-2', itemId: 'item-5-2', name: 'Alertas de errores' },
        ],
      },
      {
        item: { id: 'item-5-3', projectId: 'proj-5', name: 'Optimización de Docker', position: 3 },
        values: [
          { id: 'val-5-3-1', itemId: 'item-5-3', columnId: 'col-status', value: 'En Progreso' },
          { id: 'val-5-3-2', itemId: 'item-5-3', columnId: 'col-priority', value: 'Baja' },
          { id: 'val-5-3-3', itemId: 'item-5-3', columnId: 'col-assignee', value: 'Miguel Ángel' },
        ],
        chats: [],
        subItems: [
          { id: 'sub-5-3-1', itemId: 'item-5-3', name: 'Multi-stage builds' },
          { id: 'sub-5-3-2', itemId: 'item-5-3', name: 'Reducir tamaño de imagen' },
        ],
      },
    ],
  },
])

const groupsList = ref<Group[]>(boardData.value.map((gd) => gd.group))

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
