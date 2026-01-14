<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';

interface Props {
  isOpen: boolean;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialWidth: 400,
  minWidth: 250,
  maxWidth: 800,
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const sidebarWidth = ref<number>(props.initialWidth);
const isResizing = ref<boolean>(false);
const isMobile = ref<boolean>(window.innerWidth <= 768);

const startResizing = (): void => {
  if (isMobile.value) return;

  isResizing.value = true;

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);

  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';
};

const handleMouseMove = (event: MouseEvent): void => {
  if (!isResizing.value) return;

  const newWidth = window.innerWidth - event.clientX;

  if (newWidth >= props.minWidth && newWidth <= props.maxWidth) {
    sidebarWidth.value = newWidth;
  }
};

const stopResizing = (): void => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);

  document.body.style.userSelect = 'auto';
  document.body.style.cursor = 'default';
};

const updateMobileState = (): void => {
  isMobile.value = window.innerWidth <= 768;
};

window.addEventListener('resize', updateMobileState);

onUnmounted(() => {
  stopResizing();
  window.removeEventListener('resize', updateMobileState);
});

const sidebarStyle = computed(() => ({
  width: isMobile.value ? '100%' : `${sidebarWidth.value}px`,
}));
</script>

<template>
  <Transition name="slide">
    <div v-if="isOpen" class="sidebar-wrapper">
      <div class="overlay" @click="emit('close')" ></div>

      <aside class="sidebar-panel" :style="sidebarStyle">
        <div
          v-if="!isMobile"
          class="resizer"
          :class="{ 'is-active': isResizing }"
          @mousedown="startResizing"
        ></div>

        <div class="sidebar-header">
          <slot name="header">
          </slot>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="sidebar-body">
          <slot></slot>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.sidebar-panel {
  position: relative;
  background: white;
  height: 100%;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.resizer {
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.2s;
}

.resizer:hover, .resizer.is-active {
  background: var(--contrast-color);
  width: 4px;
}

.sidebar-header {
  padding: 10px 1.5rem;
  border-bottom: 1px solid var(--shadow-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--dark-color);
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
