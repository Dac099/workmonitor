<script lang="ts" setup>
import { computed } from 'vue'
import type { ItemDetail } from '../../types/items'

interface Props {
  item: ItemDetail
}

interface Task {
  id: string
  message: string
  completed: boolean
}

const props = defineProps<Props>()

const taskCompletion = computed(() => {
  let totalTasks = 0
  let completedTasks = 0

  props.item.chats.forEach((chat) => {
    if (chat.tasks) {
      try {
        const tasks: Task[] = JSON.parse(chat.tasks)
        totalTasks += tasks.length
        completedTasks += tasks.filter((task) => task.completed).length
      } catch {
        // Si hay error al parsear, ignorar este chat
      }
    }
  })

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  return { percentage, totalTasks, completedTasks }
})

const dialStrokeDasharray = computed(() => {
  const circumference = 2 * Math.PI * 10 // radio = 10
  const progress = (taskCompletion.value.percentage / 100) * circumference
  return `${progress} ${circumference}`
})
</script>

<template>
  <div class="item-name-cell">
    <span class="item-name">{{ props.item.name }}</span>
    <div class="item-controls">
      <button type="button" class="chat-btn" title="Chats">
        <i class="nf nf-fa-message"></i>
      </button>
      <div
        class="dial-container"
        :title="`${taskCompletion.completedTasks}/${taskCompletion.totalTasks} tareas completadas`"
      >
        <svg class="dial-svg" viewBox="0 0 24 24">
          <!-- Background circle -->
          <circle class="dial-bg" cx="12" cy="12" r="10" fill="none" stroke-width="2" />
          <!-- Progress circle -->
          <circle
            class="dial-progress"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke-width="2"
            :stroke-dasharray="dialStrokeDasharray"
            transform="rotate(-90 12 12)"
          />
        </svg>
        <span class="dial-text">{{ taskCompletion.percentage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-name-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  gap: 8px;
}

.item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  font-size: 0.85rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.chat-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chat-btn:hover {
  color: var(--contrast-color);
  transform: scale(1.1);
}

.dial-container {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dial-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.dial-bg {
  stroke: rgba(0, 0, 0, 0.1);
}

.dial-progress {
  stroke: var(--contrast-color);
  transition: stroke-dasharray 0.3s ease;
}

.dial-text {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--dark-color);
  z-index: 1;
}
</style>
