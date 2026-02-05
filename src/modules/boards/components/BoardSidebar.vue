<script lang="ts" setup>
import type { Group } from '../types/groups'
import BoardGroupsList from './BoardGroupsList.vue'

interface Props {
  groups: Group[]
  selectedGroupId: string | null
  boardName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', groupId: string): void
  (e: 'groups-change', groups: Group[]): void
}>()
</script>

<template>
  <article>
    <aside class="main-container--sidebar">
      <section class="sidebar-header">
        <h4 :title="props.boardName">{{ props.boardName }}</h4>
        <div>
          <button type="button">+</button>
          <button type="button" @click="emit('close')">
            <i class="nf nf-cod-layout_sidebar_left"></i>
          </button>
        </div>
      </section>
      <hr />
      <section class="sidebar-content">
        <BoardGroupsList
          :groups="props.groups"
          :selected-group-id="props.selectedGroupId"
          @select="emit('select', $event)"
          @groups-change="emit('groups-change', $event)"
        />
      </section>
    </aside>
  </article>
</template>

<style scoped>
.main-container--sidebar {
  width: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  border: 1px solid var(--ter-color);
  border-radius: 5px;
  background-color: var(--main-color);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  user-select: none;

  h4 {
    color: var(--contrast-color);
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button {
    width: 30px;
    margin-right: 5px;
    cursor: pointer;
    background-color: var(--dark-color);
    border: none;
    color: var(--main-color);
    border-radius: 3px;
    font-size: 1.2rem;
  }

  button:hover {
    background-color: var(--contrast-color);
  }
}

.sidebar-content {
  padding: 8px 6px 12px;
}

@media (max-width: 768px) {
  .main-container--sidebar {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    z-index: 30;
  }
}
</style>
