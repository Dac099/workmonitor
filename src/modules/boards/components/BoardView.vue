<script lang="ts" setup>
import BoardSidebar from './BoardSidebar.vue'
import LoaderComponent from '@/core/components/LoaderComponent.vue'
import ErrorComponent from '@/core/components/ErrorComponent.vue'
import { useBoardView } from '../composables/useBoardView'
import BoardGroupDetail from './BoardGroupDetail.vue'

const {
  groupsList,
  isLoading,
  isError,
  isGroupLoading,
  groupError,
  showSidebar,
  selectedGroupId,
  groupToRender,
  boardData,
  highlightedItemId,
  toggleSidebar,
  handleErrorAction,
  handleGroupErrorAction,
  handleSelectGroup,
  handleGroupsChange,
} = useBoardView()
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
    <!-- Sidebar section -->
    <Transition name="sidebar-slide">
      <BoardSidebar
        v-if="showSidebar"
        :groups="groupsList"
        :selected-group-id="selectedGroupId"
        :board-name="boardData!.name"
        :board-id="boardData!.id"
        :has-timeline="boardData!.hasTimeline ?? false"
        @close="toggleSidebar"
        @select="handleSelectGroup"
        @groups-change="handleGroupsChange"
      />
    </Transition>
    <button v-if="!showSidebar" class="sidebar-toggle" type="button" @click="toggleSidebar">
      <i class="nf nf-cod-layout_sidebar_left"></i>
    </button>

    <!-- Section where the group detail renders -->
    <section class="main-container--content">
      <section v-if="isGroupLoading" class="loader-container">
        <LoaderComponent />
      </section>
      <section v-else-if="groupError" class="error-container">
        <ErrorComponent
          :title="groupError"
          details="Presione el botón para reintentar."
          :action="handleGroupErrorAction"
        />
      </section>
      <BoardGroupDetail
        v-else-if="groupToRender"
        :group="groupToRender"
        :groups="groupsList"
        :highlighted-item-id="highlightedItemId"
      />
      <div v-else class="content-empty">Selecciona un grupo</div>
    </section>
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
  min-height: 0;
  flex: 1;
  overflow: auto;
  border-radius: 5px;
  transition: all 0.2s ease;
  padding: 5px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.main-container--content:hover {
  scrollbar-color: var(--dark-color) transparent;
}

.main-container--content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.main-container--content::-webkit-scrollbar-track {
  background: transparent;
}

.main-container--content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.main-container--content:hover::-webkit-scrollbar-thumb {
  background: var(--dark-color);
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

.content-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .sidebar-toggle {
    top: 0;
    left: 0;
    z-index: 40;
  }
}
</style>
