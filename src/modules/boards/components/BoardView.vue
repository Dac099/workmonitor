<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Group, GroupDetail } from '../types/groups'
import { API_BASE_URL } from '@/utils/contants'
import type { Board } from '../types/board'
import { useColumnsStore } from '@/stores/columns'
import BoardSidebar from './BoardSidebar.vue'
import LoaderComponent from '@/core/components/LoaderComponent.vue'
import ErrorComponent from '@/core/components/ErrorComponent.vue'

const route = useRoute()
const boardData = ref<Board | null>(null)
const groupsList = ref<Group[]>([])
const isLoading = ref(true)
const isError = ref('')
const columnsStore = useColumnsStore()
const showSidebar = ref(window.innerWidth > 768)
const selectedGroupId = ref<string | null>(null)
const groupToRender = ref<GroupDetail | null>(null)

onMounted(() => {
  fetchInitialData()
})

async function fetchInitialData() {
  const [columnsResponse, groupsResponse, boardResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/columns/board/${route.params.boardId}`),
    fetch(`${API_BASE_URL}/groups/board/${route.params.boardId}`),
    fetch(`${API_BASE_URL}/boards/${route.params.boardId}`),
  ])

  if (!columnsResponse.ok || !groupsResponse.ok || !boardResponse.ok) {
    isLoading.value = false
    isError.value = 'Ocurrió un errror al obtener los datos.'
    return
  }

  const [parsedColumns, parsedGroups, parsedBoard] = await Promise.all([
    columnsResponse.json(),
    groupsResponse.json(),
    boardResponse.json(),
  ])

  boardData.value = parsedBoard
  groupsList.value = parsedGroups
  columnsStore.setColumns(parsedColumns)

  if (!selectedGroupId.value && parsedGroups.length > 0) {
    selectedGroupId.value = parsedGroups[0].id
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${selectedGroupId.value}`)

    if (!groupResponse.ok) {
      isLoading.value = false
      isError.value = 'Ocurrió un errror al obtener los datos del grupo'
      return
    }

    groupToRender.value = await groupResponse.json()
  }

  isLoading.value = false
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const handleErrorAction = () => {
  isError.value = ''
  isLoading.value = true
  fetchInitialData()
}

const handleSelectGroup = (groupId: string) => {
  selectedGroupId.value = groupId
}

const handleGroupsChange = (groups: Group[]) => {
  groupsList.value = groups

  if (!groupsList.value.find((group) => group.id === selectedGroupId.value)) {
    selectedGroupId.value = groupsList.value[0]?.id ?? null
  }
}

watch(
  () => groupsList.value,
  (groups) => {
    if (!selectedGroupId.value && groups.length > 0) {
      selectedGroupId.value = groups[0]?.id || null
    }
  },
  { immediate: true },
)
</script>

<template>
  <article class="main-container" v-if="isLoading">
    <section class="loader-container" v-if="isLoading">
      <LoaderComponent />
    </section>
  </article>

  <article class="main-container" v-if="isError">
    <section class="error-container">
      <ErrorComponent
        :title="isError"
        details="Presione el botón para reintentar. Si el error persiste contacte a sistemas"
        :action="handleErrorAction"
      />
    </section>
  </article>

  <article class="main-container" v-if="!isLoading">
    <Transition name="sidebar-slide">
      <BoardSidebar
        v-if="showSidebar"
        :groups="groupsList"
        :selected-group-id="selectedGroupId"
        @close="toggleSidebar"
        @select="handleSelectGroup"
        @groups-change="handleGroupsChange"
      />
    </Transition>
    <button v-if="!showSidebar" class="sidebar-toggle" type="button" @click="toggleSidebar">
      <i class="nf nf-cod-layout_sidebar_left"></i>
    </button>
    <section class="main-container--content"></section>
  </article>
</template>

<style scoped>
.main-container {
  height: 100%;
  display: flex;
  gap: 5px;
  position: relative;
}

.loader-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-container--content {
  height: 100%;
  flex: 1;
  overflow: auto;
  border: 1px solid var(--ter-color);
  border-radius: 5px;
  transition: all 0.2s ease;
}

.sidebar-toggle {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 3px;
  border: none;
  background-color: var(--dark-color);
  color: var(--main-color);
  cursor: pointer;
  opacity: 0.25;
  transition: opacity 0.2s ease;
  z-index: 20;
}

.sidebar-toggle:hover {
  opacity: 1;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}

.error-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .sidebar-toggle {
    top: 0;
    left: 0;
    z-index: 40;
  }
}
</style>
