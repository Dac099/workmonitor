<script setup lang="ts">
import { computed } from 'vue'
import { type Board } from '../types/board'
import { useRouter } from 'vue-router'

interface Props {
  boards: Board[]
}

const props = defineProps<Props>()
const router = useRouter()

const groupedBoards = computed(() => {
  const grouped = new Map<string, Board[]>()
  props.boards.forEach((board) => {
    const workspace = board.workspaceName || 'Sin workspace'
    if (!grouped.has(workspace)) {
      grouped.set(workspace, [])
    }
    grouped.get(workspace)!.push(board)
  })
  return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
})

const goToBoard = (boardId: string) => {
  router.push(`projects/boards/${boardId}`)
}
</script>

<template>
  <div class="boards-container">
    <div
      v-for="[workspaceName, workspaceBoards] in groupedBoards"
      :key="workspaceName"
      class="workspace-group"
    >
      <h2 class="workspace-title">{{ workspaceName }}</h2>
      <div class="boards-list">
        <article
          class="board-card"
          v-for="board in workspaceBoards"
          :key="board.id"
          @click="goToBoard(board.id)"
        >
          <div class="board-icon">
            <i class="nf nf-md-bulletin_board"></i>
          </div>
          <div class="board-content">
            <h3>{{ board.name }}</h3>
            <p class="board-description">{{ board.description || 'Sin descripción' }}</p>
            <p class="board-id">ID: {{ board.workspaceId }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boards-container {
  margin-top: 20px;
}

.workspace-group {
  margin-bottom: 30px;
}

.workspace-title {
  color: var(--dark-color);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ter-color);
}

.boards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--sec-color);
  border: 1px solid var(--ter-color);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.board-card:hover {
  background-color: var(--main-color);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--contrast-color);
  transform: translateY(-2px);
}

.board-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--contrast-color);
  border-radius: 6px;
  flex-shrink: 0;
}

.board-icon i {
  color: var(--main-color);
  font-size: 20px;
}

.board-content {
  flex: 1;
}

.board-content h3 {
  color: var(--dark-color);
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
}

.board-description {
  color: var(--dark-color);
  margin: 0 0 6px 0;
  font-size: 14px;
}

.board-id {
  color: #999;
  margin: 0;
  font-size: 12px;
  font-style: italic;
}
</style>
