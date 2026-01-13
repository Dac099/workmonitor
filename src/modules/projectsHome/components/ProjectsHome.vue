<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { type Board } from '../types/board'
import GeneralBtn from '@/shared/GeneralBtn.vue'
import { useRouter } from 'vue-router'
import getDateString from '@/utils/transformers'

const router = useRouter()
const boards: Ref<Board[]> = ref([
  {
    id: 1,
    name: 'Proyectos 2025',
    category: 'Proyectos',
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'Global Planning',
    category: 'Proyectos',
    createdAt: new Date(),
  },
])

const showModal = () => {}
const goToBoard = (boardId: number) => {
  router.push(`/boards/${boardId}`)
}
</script>

<template>
  <section class="boards-container">
    <section class="container--header">
      <h2>Tableros</h2>
      <GeneralBtn title="Nuevo tablero" type="button" :action="showModal" severity="contrast" />
    </section>
    <section class="boards-grid">
      <article
        class="board-card"
        v-for="board in boards"
        :key="board.id"
        @click="goToBoard(board.id)"
      >
        <section class="board-card--header">
          <div><i class="nf nf-md-dots_grid"></i>{{ board.name }}</div>
          <p>{{ board.category }}</p>
        </section>
        <section class="board-card--footer">
          <i>{{ getDateString(board.createdAt) }}</i>
        </section>
      </article>
    </section>
  </section>
</template>

<style scoped>
.boards-container {
  max-width: 1000px;
  margin: 0 auto;
}

.container--header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--highlight-color);
  margin-bottom: 1rem;
}

.boards-grid {
}

.board-card {
  box-shadow: 2px 2px 4px 0px var(--shadow-color);
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-card:hover {
  transform: scale(1.01);
}

.board-card--header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.board-card--header div {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.board-card--header p {
  color: var(--light-dark-color);
  font-size: 0.9rem;
  font-weight: 300;
  font-style: italic;
}

.board-card--footer {
  text-align: right;
  font-size: 0.8rem;
  color: var(--light-dark-color);
}
</style>
