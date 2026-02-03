<script setup lang="ts">
import { computed, type Ref, ref } from 'vue'
import { type Board, type SubmitBoardDto } from '../types/board'
import { useRouter } from 'vue-router'
import Sidebar from '@/shared/components/SideBar.vue'
import BoardForm from './BoardForm.vue'
import BoardsList from './BoardsList.vue'
import { API_BASE_URL } from '@/utils/contants'
import LoaderComponent from '@/core/components/LoaderComponent.vue'

const router = useRouter()
const isSidebarOpen: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(true)
const error: Ref<string | null> = ref(null)
const boards: Ref<Board[]> = ref([])

fetch(`${API_BASE_URL}/boards`)
  .then((response) => response.json())
  .then((data) => {
    boards.value = data
  })
  .catch((err) => {
    error.value = err.message
  })
  .finally(() => {
    loading.value = false
  })

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openSidebar = () => {
  isSidebarOpen.value = true
}

const searchQuery: Ref<string> = ref('')

const filteredBoards = computed(() => {
  if (!searchQuery.value.trim()) {
    return boards.value
  }
  const query = searchQuery.value.toLowerCase()
  return boards.value.filter((board) => {
    const workspaceName = (board.workspaceName || '').toLowerCase()
    const boardName = (board.name || '').toLowerCase()
    return workspaceName.includes(query) || boardName.includes(query)
  })
})

const addNewBoard = (newBoard: SubmitBoardDto) => {
  console.log('New Board Submitted:', newBoard)
}

const handleSubmitNewBoard = (newBoard: SubmitBoardDto) => {
  addNewBoard(newBoard)
  closeSidebar()
}
</script>

<template>
  <article class="main-container">
    <article class="data-container">
      <h1>Tableros</h1>
      <div class="search-container" v-if="!loading">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Buscar por workspace o nombre del board..."
        />
      </div>
      <article class="loader-container" v-if="loading">
        <LoaderComponent />
      </article>
      <BoardsList v-if="!loading" :boards="filteredBoards" />
    </article>
  </article>
  <Sidebar :is-open="isSidebarOpen" @close="closeSidebar">
    <template #header>
      <h2>Nuevo Tablero</h2>
    </template>

    <BoardForm @submit="handleSubmitNewBoard" />
  </Sidebar>
</template>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

h1,
h2 {
  color: var(--dark-color);
  margin-bottom: 15px;
}

.data-container {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  margin: 20px 0;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  background-color: var(--main-color);
  color: var(--dark-color);
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--contrast-color);
  box-shadow: 0 0 0 3px rgba(43, 130, 240, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
