<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import GroupsList from './GroupsList.vue'
import GroupView from './GroupView.vue'
import SideBar from '@/shared/components/SideBar.vue'
import CreateGroupForm from './CreateGroupForm.vue'
import DuplicateBoardForm from './DuplicateBoardForm.vue'
import type { Group, NewGroup } from '../types/groups'

const route = useRoute()
const selectedGroupId = ref<number>(0)
const isCreateGroupSidebarOpen = ref(false)
const isDuplicateGroupSidebarOpen = ref(false)

const groupsList = ref<Group[]>([])

const selectedGroup = computed(() => {
  return groupsList.value.find((g) => g.id === selectedGroupId.value) || null
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
  console.log('Duplicando grupo(s)...')
  console.log('Grupos seleccionados:', selectedGroupIds)
  console.log('Conservar valores:', keepValues)

  closeDuplicateGroupSidebar()
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
        <button type="button">Exportar</button>
        <button type="button" @click="openDuplicateGroupSidebar">Duplicar</button>
      </section>
    </section>
    <section class="main-container--body">
      <GroupView :selected-group="selectedGroup" />
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
