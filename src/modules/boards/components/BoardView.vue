<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Group } from '../types/groups'
import { API_BASE_URL } from '@/utils/contants'
import type { Board } from '../types/board'
import { useColumnsStore } from '@/stores/columns'
import BoardSidebar from './BoardSidebar.vue'

const route = useRoute()
const boardData = ref<Board | null>(null)
const groupsList = ref<Group[]>([])
const isLoading = ref(true)
const isError = ref('')
const columnsStore = useColumnsStore()
const showSidebar = ref(window.innerWidth > 768)
const selectedGroupId = ref<string | null>(null)

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
  }

  isLoading.value = false
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
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
  <article class="main-container">
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
    <section class="main--container--content"></section>
  </article>
</template>

<style scoped>
.main-container {
  height: 100%;
  display: flex;
  gap: 1rem;
  position: relative;
}

.main-container--content {
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

@media (max-width: 768px) {
  .sidebar-toggle {
    top: 0;
    left: 0;
    z-index: 40;
  }
}
</style>
