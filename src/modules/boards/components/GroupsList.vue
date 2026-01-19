<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import type { Group } from '../types/groups'

const props = defineProps<{
  groups: Group[]
  selectedGroupId: number
}>()

const emit = defineEmits<{
  groupSelected: [groupId: number]
}>()

const showOverlay = ref(false)
const menuWrapperRef = ref<HTMLElement | null>(null)

const selectGroup = (groupId: number) => {
  showOverlay.value = false
  emit('groupSelected', groupId)
}

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuWrapperRef.value && !menuWrapperRef.value.contains(event.target as Node)) {
    showOverlay.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <article class="list-container">
    <div class="toggle-button-wrapper" ref="menuWrapperRef">
      <i class="nf nf-cod-menu toggle-button" @click="toggleOverlay"></i>

      <Transition name="menu-fade">
        <div v-if="showOverlay" class="context-menu">
          <h3 class="context-menu-title">Grupos</h3>
          <div class="context-menu-groups">
            <button
              v-for="group in props.groups"
              :key="group.id"
              class="context-menu-item"
              :class="{ 'context-menu-item--selected': props.selectedGroupId === group.id }"
              @click="selectGroup(group.id)"
            >
              {{ group.name }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <section class="groups-list">
      <button
        v-for="group in props.groups"
        :key="group.id"
        class="group-item"
        :class="{ 'group-item--selected': props.selectedGroupId === group.id }"
        @click="selectGroup(group.id)"
      >
        {{ group.name }}
      </button>
    </section>
  </article>
</template>

<style scoped>
.list-container {
  display: grid;
  height: max-content;
  grid-template-columns: max-content 1fr;
  align-items: center;
  padding: 5px 0;
}

.toggle-button-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-button {
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  height: 100%;
}

.groups-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  max-width: 700px;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  position: relative;
  padding-bottom: 10px;
}

.groups-list:hover {
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.groups-list::-webkit-scrollbar {
  height: 6px;
}

.groups-list::-webkit-scrollbar-track {
  background: transparent;
}

.groups-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
}

.groups-list:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}

.groups-list:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.group-item {
  text-wrap: nowrap;
  display: grid;
  place-content: center;
  text-decoration: none;
  color: #202124;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 6px 12px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  font-size: 0.875rem;
}

.group-item:hover {
  background-color: #f1f3f4;
  border-color: #dadce0;
}

.group-item--selected {
  background-color: #e8f0fe;
  color: #1a73e8;
  font-weight: 500;
  border-color: #1a73e8;
}

.group-item--selected:hover {
  background-color: #d2e3fc;
  border-color: #1a73e8;
}

.context-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  background-color: white;
  border-radius: 4px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border: 1px solid #dadce0;
}

.context-menu-title {
  margin: 0 0 8px 0;
  color: #5f6368;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px 16px;
  border-bottom: 1px solid #e8eaed;
}

.context-menu-groups {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 300px;
  overflow-y: auto;
}

.context-menu-item {
  width: 100%;
  padding: 8px 16px;
  background-color: transparent;
  border: none;
  color: #202124;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: inherit;
  font-size: 0.875rem;
  text-align: left;
  position: relative;
  padding-left: 40px;
}

.context-menu-item:hover {
  background-color: #f1f3f4;
}

.context-menu-item--selected {
  background-color: #e8f0fe;
  color: #1a73e8;
  font-weight: 500;
}

.context-menu-item--selected::before {
  content: '✓';
  position: absolute;
  left: 16px;
  color: #1a73e8;
  font-weight: bold;
}

.context-menu-item--selected:hover {
  background-color: #d2e3fc;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.menu-fade-enter-to,
.menu-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
