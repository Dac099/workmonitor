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
            <div class="board-footer">
              <span class="board-id">ID: {{ board.workspaceId }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boards-container {
  margin-top: 20px;
  padding-bottom: 40px;
}

.workspace-group {
  margin-bottom: 40px;
}

.workspace-title {
  color: var(--dark-color);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ter-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.boards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.board-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  background-color: var(--sec-color);
  border: 1px solid var(--ter-color);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 100%;
  position: relative;
}

.board-card:hover {
  background-color: var(--main-color);
  box-shadow: 0 10px 25px -5px var(--shadow-color);
  border-color: var(--contrast-color);
  transform: translateY(-4px);
}

.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.board-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: var(--contrast-color);
  border-radius: 12px;
  flex-shrink: 0;
  margin-bottom: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.board-icon i {
  color: var(--main-color);
  font-size: 24px;
}

.board-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.board-content h3 {
  color: var(--dark-color);
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.board-description {
  color: var(--dark-color);
  opacity: 0.8;
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.board-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.board-id {
  color: #999;
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 600px) {
  .boards-list {
    grid-template-columns: 1fr;
  }

  .board-card {
    flex-direction: row;
    align-items: center;
    padding: 16px;
  }

  .board-icon {
    margin-bottom: 0;
    width: 40px;
    height: 40px;
  }

  .board-icon i {
    font-size: 20px;
  }

  .board-description,
  .board-footer {
    display: none;
  }

  .board-content h3 {
    margin-bottom: 0;
    font-size: 16px;
  }
}
</style>
