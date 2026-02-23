<script lang="ts" setup>
import { ref, toRef } from 'vue'
import type { Group } from '../types/groups'
import SideBar from '@/shared/components/SideBar.vue'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import { useColorsStore } from '@/stores/colors'
import { useGroupsList } from '../composables/useGroupsList'

interface Props {
  groups: Group[]
  selectedGroupId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', groupId: string): void
  (e: 'groups-change', groups: Group[]): void
}>()
const colorsStore = useColorsStore()
const groupsRef = toRef(props, 'groups')

const {
  localGroups,
  isEditOpen,
  isMoveOpen,
  isCopyOpen,
  editForm,
  boardsList,
  targetBoardId,
  openEdit,
  closeEdit,
  submitEdit,
  handleDelete,
  closeMove,
  submitMove,
  closeCopy,
  submitCopy,
} = useGroupsList({
  groups: groupsRef,
  onSelect: (groupId) => emit('select', groupId),
  onGroupsChange: (groups) => emit('groups-change', groups),
})

const menuRef = ref<InstanceType<typeof OverlayMenu> | null>(null)
const activeMenuGroup = ref<Group | null>(null)

const openMenu = (group: Group, event: MouseEvent) => {
  activeMenuGroup.value = group
  menuRef.value?.toggle(event)
}

const closeMenu = () => {
  menuRef.value?.close()
}
</script>

<template>
  <div class="groups-list">
    <article
      v-for="group in localGroups"
      :key="group.id"
      class="group-item"
      :class="{ 'is-selected': group.id === props.selectedGroupId }"
      :style="group.id === props.selectedGroupId ? { '--group-color': group.color } : undefined"
      @click="emit('select', group.id)"
    >
      <div class="group-item__main">
        <i class="nf nf-md-folder_table_outline icon-group"></i>
        <span class="group-name" :title="group.name">{{ group.name }}</span>
      </div>
      <button class="group-menu__toggle" type="button" @click.stop="openMenu(group, $event)">
        <i class="nf nf-md-dots_vertical"></i>
      </button>
    </article>
  </div>

  <OverlayMenu ref="menuRef">
    <template #header>
      <span class="group-menu__title">Acciones</span>
    </template>
    <template #content>
      <div class="group-menu" @click.stop>
        <button
          type="button"
          class="group-menu__item"
          :disabled="!activeMenuGroup"
          @click="activeMenuGroup && (openEdit(activeMenuGroup), closeMenu())"
        >
          Editar
        </button>
        <button
          type="button"
          class="group-menu__item"
          :disabled="!activeMenuGroup"
          @click="activeMenuGroup && (handleDelete(activeMenuGroup.id), closeMenu())"
        >
          Eliminar
        </button>
        <!-- <button
          type="button"
          class="group-menu__item"
          :disabled="!activeMenuGroup"
          @click="activeMenuGroup && (openMove(activeMenuGroup), closeMenu())"
        >
          Mover
        </button>
        <button
          type="button"
          class="group-menu__item"
          :disabled="!activeMenuGroup"
          @click="activeMenuGroup && (openCopy(activeMenuGroup), closeMenu())"
        >
          Copiar
        </button> -->
      </div>
    </template>
  </OverlayMenu>

  <SideBar :is-open="isEditOpen" @close="closeEdit">
    <template #header>
      <h4>Editar grupo</h4>
    </template>
    <form class="edit-form" @submit.prevent="submitEdit">
      <label class="form-field">
        <span>Nombre</span>
        <input v-model="editForm.name" type="text" placeholder="Nombre del grupo" />
      </label>
      <div class="form-field">
        <span>Color</span>
        <div class="color-options">
          <button
            v-for="color in colorsStore.availableColors"
            :key="color"
            type="button"
            class="color-swatch"
            :class="{ 'is-selected': editForm.color === color }"
            :style="{ backgroundColor: color }"
            @click="editForm.color = color"
          ></button>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="closeEdit">Cancelar</button>
        <button type="submit" class="btn-primary">Guardar</button>
      </div>
    </form>
  </SideBar>

  <SideBar :is-open="isMoveOpen" @close="closeMove">
    <template #header>
      <h4>Mover grupo</h4>
    </template>
    <form class="edit-form" @submit.prevent="submitMove">
      <label class="form-field">
        <span>Tablero destino</span>
        <select v-model="targetBoardId">
          <option value="" disabled>Selecciona un tablero</option>
          <option v-for="board in boardsList" :key="board.id" :value="board.id">
            {{ board.name }}
          </option>
        </select>
      </label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="closeMove">Cancelar</button>
        <button type="submit" class="btn-primary">Mover</button>
      </div>
    </form>
  </SideBar>

  <SideBar :is-open="isCopyOpen" @close="closeCopy">
    <template #header>
      <h4>Copiar grupo</h4>
    </template>
    <form class="edit-form" @submit.prevent="submitCopy">
      <label class="form-field">
        <span>Tablero destino</span>
        <select v-model="targetBoardId">
          <option value="" disabled>Selecciona un tablero</option>
          <option v-for="board in boardsList" :key="board.id" :value="board.id">
            {{ board.name }}
          </option>
        </select>
      </label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="closeCopy">Cancelar</button>
        <button type="submit" class="btn-primary">Copiar</button>
      </div>
    </form>
  </SideBar>
</template>

<style scoped>
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  height: 44px;
  border-radius: 3px;
  border-left: 10px solid transparent;
  cursor: pointer;
  background: var(--main-color);
}

.group-item.is-selected {
  border-left-color: var(--group-color);
  background: rgba(0, 0, 0, 0.04);
}

.group-item__main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.icon-group {
  color: var(--group-color);
}

.group-name {
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  display: inline-block;
  max-width: 100%;
  color: var(--group-color);
}

.group-menu__toggle {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--dark-color);
  padding: 4px;
}

.group-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
}

.group-menu__title {
  font-weight: 600;
}

.group-menu__item {
  text-align: left;
  padding: 6px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: var(--dark-color);
}

.group-menu__item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.group-menu__item:disabled {
  opacity: 0.5;
  cursor: default;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--dark-color);
}

.form-field input[type='text'],
.form-field select {
  padding: 8px 10px;
  border: 1px solid var(--ter-color);
  border-radius: 6px;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.color-swatch.is-selected {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 2px var(--main-color) inset;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary,
.btn-primary {
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary {
  background: var(--shadow-color);
  color: var(--dark-color);
}

.btn-primary {
  background: var(--contrast-color);
  color: var(--main-color);
}
</style>
