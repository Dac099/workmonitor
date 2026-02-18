<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Value } from '../../types/values'
import type { TableValue } from '../../types/tableValues'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import { useTableValuesStore } from '@/stores/tableValues'
import { useColorsStore } from '@/stores/colors'
import { API_BASE_URL } from '@/utils/contants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  value: Value
  itemId?: string
  columnId?: string
}

type StatusTag = {
  color: string
  text: string
}

type ActiveView = 'grid' | 'create' | 'edit'

// ─── Setup ────────────────────────────────────────────────────────────────────

const props = defineProps<Props>()
const tableValuesStore = useTableValuesStore()
const colorsStore = useColorsStore()
const overlayMenu = ref<InstanceType<typeof OverlayMenu> | null>(null)
const localValue = ref<Value>({ ...props.value })

// ─── View state ───────────────────────────────────────────────────────────────

const activeView = ref<ActiveView>('grid')
const isEditMode = ref(false)
const isDeleteMode = ref(false)

// ─── Form state (shared between create & edit) ────────────────────────────────

const formText = ref('')
const formColor = ref(colorsStore.availableColors[0] ?? '')
const isSaving = ref(false)
const editingTag = ref<TableValue | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const statusProperties = computed<StatusTag>(() => JSON.parse(localValue.value.value))

const columnOptions = computed<TableValue[]>(() => {
  const col = tableValuesStore.tableValuesByColumn.find(
    (c) => c.columnId === localValue.value.columnId,
  )
  return col?.values ?? []
})

const activeColumnId = computed(() => props.columnId ?? localValue.value.columnId)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseTag = (rawValue: string): StatusTag => {
  try {
    return JSON.parse(rawValue)
  } catch {
    return { color: '#cccccc', text: rawValue }
  }
}

const buildTagValue = (text: string, color: string) => JSON.stringify({ color, text: text.trim() })

const findStoreColumn = (columnId: string) =>
  tableValuesStore.tableValuesByColumn.find((c) => c.columnId === columnId)

// ─── Grid actions ─────────────────────────────────────────────────────────────

const selectTag = (tableValue: TableValue) => {
  localValue.value.value = tableValue.value

  if (!props.value.id) {
    fetch(`${API_BASE_URL}/tableValues/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: props.itemId,
        columnId: props.columnId,
        value: tableValue.value,
      }),
    })
  } else {
    fetch(`${API_BASE_URL}/tableValues/${props.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: tableValue.value }),
    })
  }

  overlayMenu.value?.close()
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  isDeleteMode.value = false
  editingTag.value = null
}

const toggleDeleteMode = () => {
  isDeleteMode.value = !isDeleteMode.value
  isEditMode.value = false
  editingTag.value = null
}

// ─── Create form ──────────────────────────────────────────────────────────────

const openCreateForm = () => {
  formText.value = ''
  formColor.value = colorsStore.availableColors[0] ?? ''
  activeView.value = 'create'
}

const createTag = async () => {
  if (!formText.value.trim() || isSaving.value) return

  isSaving.value = true
  try {
    const tagValue = buildTagValue(formText.value, formColor.value)
    const response = await fetch(`${API_BASE_URL}/tableValues/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: null, columnId: activeColumnId.value, value: tagValue }),
    })
    const created: TableValue = await response.json()

    findStoreColumn(created.columnId)?.values.push(created)
    activeView.value = 'grid'
  } finally {
    isSaving.value = false
  }
}

// ─── Edit form ────────────────────────────────────────────────────────────────

const openEditForm = (option: TableValue) => {
  if (!isEditMode.value) return
  const tag = parseTag(option.value)
  editingTag.value = option
  formText.value = tag.text
  formColor.value = tag.color
  activeView.value = 'edit'
}

const saveTag = async () => {
  if (!formText.value.trim() || isSaving.value || !editingTag.value) return

  isSaving.value = true
  const targetId = editingTag.value.id
  const tagValue = buildTagValue(formText.value, formColor.value)

  try {
    const response = await fetch(`${API_BASE_URL}/tableValues/${targetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: tagValue }),
    })

    if (!response.ok) return

    // Close form immediately on success
    editingTag.value = null
    isEditMode.value = false
    activeView.value = 'grid'

    // Update store — best-effort regardless of response body
    try {
      const updated: TableValue = await response.json()
      const col = findStoreColumn(updated.columnId)
      if (col) {
        const idx = col.values.findIndex((v) => v.id === updated.id)
        if (idx !== -1) col.values[idx] = updated
      }
    } catch {
      // Fallback: update optimistically with local data
      const col = findStoreColumn(activeColumnId.value)
      if (col) {
        const idx = col.values.findIndex((v) => v.id === targetId)
        if (idx !== -1) {
          const existing = col.values[idx]!
          col.values[idx] = {
            id: existing.id,
            itemId: existing.itemId,
            columnId: existing.columnId,
            value: tagValue,
          }
        }
      }
    }
  } finally {
    isSaving.value = false
  }
}

const cancelForm = () => {
  editingTag.value = null
  activeView.value = 'grid'
}

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteTag = async (option: TableValue) => {
  if (!isDeleteMode.value) return

  const response = await fetch(`${API_BASE_URL}/tableValues/${option.id}`, {
    method: 'DELETE',
  })

  if (response.status === 204) {
    const col = findStoreColumn(option.columnId)
    if (col) {
      col.values = col.values.filter((v) => v.id !== option.id)
    }
  } else if (response.status === 409) {
    alert('No se puede eliminar un estado que está en uso.')
  }
}
</script>

<template>
  <span
    class="cell-text"
    :style="{ backgroundColor: statusProperties.color }"
    @click="overlayMenu?.toggle($event)"
  >
    {{ statusProperties.text }}
  </span>

  <OverlayMenu ref="overlayMenu">
    <template #header>Etiquetas</template>
    <template #content>
      <!-- Create / Edit form -->
      <div v-if="activeView !== 'grid'" class="tag-form">
        <input
          v-model="formText"
          class="tag-form__input"
          placeholder="Nombre de la etiqueta"
          @keyup.enter="activeView === 'create' ? createTag() : saveTag()"
        />
        <div class="tag-form__colors">
          <button
            v-for="color in colorsStore.availableColors"
            :key="color"
            class="tag-form__color-btn"
            :class="{ 'tag-form__color-btn--selected': formColor === color }"
            :style="{ backgroundColor: color }"
            @click="formColor = color"
          />
        </div>
        <div class="tag-form__actions">
          <button class="tag-form__btn tag-form__btn--cancel" @click="cancelForm">Cancelar</button>
          <button
            class="tag-form__btn tag-form__btn--create"
            :disabled="!formText.trim() || isSaving"
            @click="activeView === 'create' ? createTag() : saveTag()"
          >
            {{ isSaving ? 'Guardando…' : activeView === 'create' ? 'Crear' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <!-- Tag grid -->
      <template v-else>
        <div class="status-grid-header">
          <button class="add-tag-btn" @click="openCreateForm">+ Agregar etiqueta</button>
          <button
            class="add-tag-btn"
            :class="{ 'edit-tag-btn--active': isEditMode }"
            @click="toggleEditMode"
          >
            {{ isEditMode ? '✓ Listo' : '✎ Editar' }}
          </button>
          <button
            class="add-tag-btn delete-tag-btn"
            :class="{ 'edit-tag-btn--active': isDeleteMode }"
            @click="toggleDeleteMode"
          >
            {{ isDeleteMode ? '✓ Listo' : '🗑 Eliminar' }}
          </button>
        </div>
        <div class="status-grid">
          <div
            v-for="option in columnOptions"
            :key="option.id"
            class="status-grid__item"
            :class="{
              'status-grid__item--shaking': isEditMode || isDeleteMode,
              'status-grid__item--delete': isDeleteMode,
            }"
            :style="{ backgroundColor: parseTag(option.value).color }"
            @click="
              isEditMode
                ? openEditForm(option)
                : isDeleteMode
                  ? deleteTag(option)
                  : selectTag(option)
            "
          >
            {{ parseTag(option.value).text }}
          </div>
        </div>
      </template>
    </template>
  </OverlayMenu>
</template>

<style scoped>
.cell-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* ─── Grid ─────────────────────────────────────────────────────────────────── */

.status-grid-header {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  padding: 0.5rem;
  min-width: 400px;
}

@media (max-width: 767px) {
  .status-grid {
    grid-template-columns: repeat(3, 1fr);
    min-width: unset;
    width: 100%;
  }
}

.status-grid__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.5rem;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s ease;
}

.status-grid__item:hover {
  opacity: 0.85;
}

.status-grid__item--shaking {
  animation: shake 0.5s infinite;
}

.status-grid__item--delete:hover {
  opacity: 1;
  outline: 2px solid #e53935;
  outline-offset: -2px;
}

.delete-tag-btn:hover,
.delete-tag-btn.edit-tag-btn--active {
  background: #e53935;
  color: #fff;
  border-color: #e53935;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20%,
  60% {
    transform: rotate(-2deg);
  }
  40%,
  80% {
    transform: rotate(2deg);
  }
}

/* ─── Header buttons ───────────────────────────────────────────────────────── */

.add-tag-btn {
  background: none;
  border: 1px solid #555;
  border-radius: 4px;
  color: var(--dark-color);
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.add-tag-btn:hover {
  background: var(--dark-color);
  color: var(--main-color);
}

.edit-tag-btn--active {
  background: var(--dark-color);
  color: var(--main-color);
}

/* ─── Tag form ─────────────────────────────────────────────────────────────── */

.tag-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  min-width: 320px;
}

.tag-form__input {
  background: var(--main-color);
  border: 1px solid #444;
  border-radius: 4px;
  color: var(--dark-color);
  font-size: 0.875rem;
  padding: 0.4rem 0.6rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.tag-form__input:focus {
  border-color: #888;
}

.tag-form__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-form__color-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    border-color 0.1s ease;
}

.tag-form__color-btn:hover {
  transform: scale(1.15);
}

.tag-form__color-btn--selected {
  border-color: #fff;
  transform: scale(1.2);
}

.tag-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.tag-form__btn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35rem 0.8rem;
  transition: opacity 0.15s ease;
}

.tag-form__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tag-form__btn--cancel {
  background: #333;
  color: #ccc;
}

.tag-form__btn--cancel:hover:not(:disabled) {
  background: #444;
}

.tag-form__btn--create {
  background: #266dd3;
  color: #fff;
}

.tag-form__btn--create:hover:not(:disabled) {
  opacity: 0.85;
}
</style>
