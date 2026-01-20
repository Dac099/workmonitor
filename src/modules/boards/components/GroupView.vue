<script lang="ts" setup>
import type { Group } from '../types/groups'

defineProps<{
  selectedGroup: Group | null
}>()

const emit = defineEmits<{
  addColumn: []
  moveGroup: []
  editGroup: []
}>()

const handleAddColumn = () => {
  emit('addColumn')
}

const handleMoveGroup = () => {
  emit('moveGroup')
}

const handleEditGroup = () => {
  emit('editGroup')
}
</script>

<template>
  <article class="group-view">
    <div v-if="selectedGroup" class="group-content">
      <header class="group-header">
        <h2 class="group-title" :style="{ color: selectedGroup.color }">
          {{ selectedGroup.name }}
        </h2>

        <div class="group-actions">
          <button type="button" class="action-btn" @click="handleAddColumn" title="Agregar columna">
            <i class="nf nf-md-table_column_plus_after"></i>
            <span class="action-label">Agregar columna</span>
          </button>
          <button type="button" class="action-btn" @click="handleMoveGroup" title="Mover grupo">
            <i class="nf nf-md-folder_move"></i>
            <span class="action-label">Mover</span>
          </button>
          <button type="button" class="action-btn" @click="handleEditGroup" title="Editar grupo">
            <i class="nf nf-md-pencil"></i>
            <span class="action-label">Editar</span>
          </button>
        </div>
      </header>

      <section class="group-body">
        <p class="empty-state">El contenido del grupo se mostrará aquí</p>
      </section>
    </div>

    <div v-else class="empty-state-container">
      <div class="empty-state-icon">📋</div>
      <h3 class="empty-state-title">No hay grupo seleccionado</h3>
      <p class="empty-state-description">Selecciona un grupo de la lista para ver su contenido</p>
    </div>
  </article>
</template>

<style scoped>
.group-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.group-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.group-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  flex: 1;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background-color: white;
  color: #202124;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background-color: #f1f3f4;
  border-color: #1a73e8;
}

.action-btn:active {
  background-color: #e8eaed;
}

.action-btn i {
  font-size: 1.125rem;
  line-height: 1;
}

.action-label {
  font-weight: 500;
}

.group-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.empty-state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #202124;
  font-weight: 500;
}

.empty-state-description {
  margin: 0;
  font-size: 0.875rem;
  color: #5f6368;
  max-width: 400px;
}

.empty-state {
  color: #5f6368;
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem;
}
</style>
