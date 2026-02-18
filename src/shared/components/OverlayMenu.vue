<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

const isVisible = ref(false)
const menuRef = ref<HTMLDivElement | null>(null)
const position = ref({ top: 0, left: 0 })
const isMobile = computed(() => window.innerWidth < 768)

const toggle = async (event: MouseEvent) => {
  if (isVisible.value) {
    isVisible.value = false
    return
  }

  isVisible.value = true

  if (isMobile.value) return

  await nextTick()

  const trigger = event.currentTarget as HTMLElement
  const triggerRect = trigger.getBoundingClientRect()
  const menu = menuRef.value

  if (!menu) return

  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  // Default: open downward
  let top = triggerRect.bottom + window.scrollY + 6
  let left = triggerRect.left + window.scrollX

  // Flip horizontally if overflows right edge
  if (left + menuWidth > viewportWidth - 8) {
    left = triggerRect.right + window.scrollX - menuWidth
  }

  // Only flip upward if there's not enough space below AND more space above
  if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - menuHeight - 6
  }

  position.value = { top, left }
}

const close = () => {
  isVisible.value = false
}

const handleOutsideClick = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close()
  }
}

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

defineExpose({ toggle, close })
</script>

<template>
  <Teleport to="body">
    <Transition :name="isMobile ? 'overlay-modal' : 'overlay-menu'">
      <div
        v-if="isVisible"
        class="overlay-menu-backdrop"
        :class="{ 'is-modal': isMobile }"
        @mousedown.self="onBackdropClick"
        @click.self="onBackdropClick"
      >
        <div
          ref="menuRef"
          class="overlay-menu"
          :class="{ 'is-modal': isMobile }"
          :style="isMobile ? {} : { top: `${position.top}px`, left: `${position.left}px` }"
        >
          <div v-if="$slots.header" class="overlay-menu__header">
            <slot name="header" />
            <button v-if="isMobile" class="overlay-menu__close" @click="close">✕</button>
          </div>
          <div class="overlay-menu__content">
            <slot name="content" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.overlay-menu-backdrop.is-modal {
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-menu {
  position: absolute;
  background: var(--bg-color, #ffffff);
  border: 1px solid var(--shadow-color, #e2e8f0);
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  overflow: hidden;
}

.overlay-menu.is-modal {
  position: relative;
  width: 90vw;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
}

.overlay-menu__header {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--shadow-color, #e2e8f0);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--dark-color, #1e293b);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overlay-menu__close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--dark-color, #1e293b);
  line-height: 1;
  padding: 0;
}

.overlay-menu__content {
  padding: 0.5rem 0;
}

/* Popover transition */
.overlay-menu-enter-active,
.overlay-menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.overlay-menu-enter-from,
.overlay-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* Modal transition */
.overlay-modal-enter-active,
.overlay-modal-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-modal-enter-active .overlay-menu,
.overlay-modal-leave-active .overlay-menu {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.overlay-modal-enter-from,
.overlay-modal-leave-to {
  opacity: 0;
}

.overlay-modal-enter-from .overlay-menu,
.overlay-modal-leave-to .overlay-menu {
  transform: scale(0.95);
  opacity: 0;
}
</style>
