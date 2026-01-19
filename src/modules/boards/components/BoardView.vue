<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import GroupsList from './GroupsList.vue'
import SideBar from '@/shared/SideBar.vue'
import CreateGroupForm from './CreateGroupForm.vue'
import DuplicateGroupForm from './DuplicateGroupForm.vue'
import type { Group } from '../types/groups'

const route = useRoute()
const selectedGroupId = ref<number>(-1)
const isCreateGroupSidebarOpen = ref(false)
const isDuplicateGroupSidebarOpen = ref(false)

const groupsList = ref<Group[]>([
  { name: 'Grupo 1', id: 1 },
  { name: 'Grupo 2', id: 2 },
  { name: 'Grupo 3', id: 3 },
  { name: 'Grupo 4', id: 4 },
  { name: 'Grupo 5', id: 5 },
  { name: 'Grupo 6', id: 6 },
  { name: 'Grupo 7', id: 7 },
  { name: 'Grupo 8', id: 8 },
  { name: 'Grupo 9', id: 9 },
  { name: 'Grupo 10', id: 10 },
])

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

const handleCreateGroup = (groupName: string) => {
  const newId = Math.max(...groupsList.value.map((g) => g.id), 0) + 1
  const newGroup: Group = {
    id: newId,
    name: groupName,
  }

  groupsList.value.push(newGroup)
  closeCreateGroupSidebar()

  // Seleccionar el nuevo grupo automáticamente
  selectedGroupId.value = newId
}

const handleDuplicateGroup = (keepValues: boolean) => {
  const selectedGroup = groupsList.value.find((g) => g.id === selectedGroupId.value)

  if (!selectedGroup) {
    console.warn('No hay grupo seleccionado para duplicar')
    closeDuplicateGroupSidebar()
    return
  }

  const newId = Math.max(...groupsList.value.map((g) => g.id), 0) + 1
  const newGroup: Group = {
    id: newId,
    name: `${selectedGroup.name} (Copia)`,
  }

  groupsList.value.push(newGroup)
  closeDuplicateGroupSidebar()

  // Seleccionar el grupo duplicado automáticamente
  selectedGroupId.value = newId

  console.log(`Grupo duplicado ${keepValues ? 'con' : 'sin'} valores`)
}
</script>

<template>
  <article class="main-container">
    <section class="main-container--header">
      <section class="header--actions-container">
        <h3>Tablero {{ route.params.boardId }}</h3>
        <GroupsList :groups="groupsList" @group-selected="handleGroupSelected" />
      </section>
      <section class="header--actions">
        <button type="button" @click="openCreateGroupSidebar">Nuevo Grupo</button>
        <button type="button">Exportar</button>
        <button type="button" @click="openDuplicateGroupSidebar">Duplicar</button>
      </section>
    </section>
    <section class="main-container--body">
      <p v-if="selectedGroupId !== -1">Grupo seleccionado: {{ selectedGroupId }}</p>
      <p v-else>No hay grupo seleccionado</p>
    </section>

    <!-- Sidebar para crear nuevo grupo -->
    <SideBar :is-open="isCreateGroupSidebarOpen" @close="closeCreateGroupSidebar">
      <template #header>
        <h2>Crear Nuevo Grupo</h2>
      </template>
      <CreateGroupForm @submit="handleCreateGroup" @cancel="closeCreateGroupSidebar" />
    </SideBar>

    <!-- Sidebar para duplicar grupo -->
    <SideBar :is-open="isDuplicateGroupSidebarOpen" @close="closeDuplicateGroupSidebar">
      <template #header>
        <h2>Duplicar Grupo</h2>
      </template>
      <DuplicateGroupForm @submit="handleDuplicateGroup" @cancel="closeDuplicateGroupSidebar" />
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
  border: 1px solid green;
  flex: 1;
  overflow: auto;
}

h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #202124;
  font-weight: 500;
}
</style>
