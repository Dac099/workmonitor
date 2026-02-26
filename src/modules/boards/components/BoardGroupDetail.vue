<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { GroupDetail } from '../types/groups'
import { useColumnsStore } from '@/stores/columns'
import { useContabilityColumnsStore } from '@/stores/contabilityColumns'
import BoardColumnSidebar from './BoardColumnSidebar.vue'
import BoardItemSidebar from './BoardItemSidebar.vue'
import BoardGroupTable from './BoardGroupTable.vue'
import BoardSubitemSidebar from './BoardSubitemSidebar.vue'
import type { ItemDetail } from '../types/items'
import type { Group } from '../types/groups'
import type { SubItemRow } from '../types/groupDetail'
import { useGroupSubitems } from '../composables/useGroupSubitems'
import { useGroupItemsSelection } from '../composables/useGroupItemsSelection'
import { useGroupItemActions } from '../composables/useGroupItemActions'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  group: GroupDetail
  groups?: Group[]
}

const props = defineProps<Props>()
const columnsStore = useColumnsStore()
const contabilityColumnsStore = useContabilityColumnsStore()
const localItems = ref<GroupDetail['items']>([])
const {
  isItemExpanded,
  isSubitemsLoading,
  getSubitems,
  toggleSubitems,
  appendSubitem,
  removeSubitem,
  updateSubitemName,
  resetSubitemsState,
} = useGroupSubitems()
const { itemsSelected, handleItemSelection, ensureItemSelected, resetSelection } =
  useGroupItemsSelection()
const isContabilityMode = computed(() => !props.groups || props.groups.length === 0)
const shouldUseCobranzaStatusOptions = computed(() => isContabilityMode.value)
const columnsToRender = computed(() => {
  if (isContabilityMode.value) {
    return contabilityColumnsStore.getColumnsSorted()
  }

  return columnsStore.getColumnsSorted()
})

watch(
  () => props.group,
  (group) => {
    localItems.value = group.items.map((item) => ({
      ...item,
      values: item.values.map((value) => ({ ...value })),
    }))
    resetSubitemsState()
    resetSelection()
  },
  { immediate: true },
)

const showColumnSidebar = ref(false)

const openSidebar = () => {
  showColumnSidebar.value = true
}

const showItemSidebar = ref(false)
const showSubitemSidebar = ref(false)
const selectedParentItemId = ref('')

const openItemSidebar = () => {
  showItemSidebar.value = true
}

const openSubitemSidebar = (itemId: string) => {
  selectedParentItemId.value = itemId
  showSubitemSidebar.value = true
}

const closeSubitemSidebar = () => {
  showSubitemSidebar.value = false
  selectedParentItemId.value = ''
}

const handleItemCreated = (item: ItemDetail) => {
  localItems.value.push({
    ...item,
  })
}

const handleItemEdited = (payload: { id: string; name: string }) => {
  const itemIndex = localItems.value.findIndex((item) => item.id === payload.id)
  if (itemIndex !== -1) {
    localItems.value[itemIndex]!.name = payload.name
  }
}

const handleSubitemCreated = (subitem: SubItemRow) => {
  appendSubitem(subitem.itemParent, subitem)
}

const handleSubitemDeleted = async (payload: { itemId: string; subitemId: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subitems/${payload.subitemId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      return
    }

    removeSubitem(payload.itemId, payload.subitemId)
  } catch (error) {
    console.error('Error al eliminar subitem:', error)
  }
}

const handleSubitemEdited = async (payload: {
  itemId: string
  subitemId: string
  name: string
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subitems/${payload.subitemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
      }),
    })

    if (!response.ok) {
      return
    }

    updateSubitemName(payload.itemId, payload.subitemId, payload.name)
  } catch (error) {
    console.error('Error al editar subitem:', error)
  }
}

const { handleItemDeleted, handleItemsMove, handleItemsCopy } = useGroupItemActions({
  localItems,
  getSelectedItemIds: () => [...itemsSelected.value],
  ensureItemSelected,
  resetSelection,
})
</script>

<template>
  <article class="group-container" :style="{ '--group-color': group.color }">
    <section class="group-header">
      <p class="group-header__title" :title="group.name">{{ group.name }}</p>
      <section class="group-header__controls">
        <button
          type="button"
          class="group-header__btn"
          title="Exportar a Excel"
          v-if="!isContabilityMode"
        >
          <i class="nf nf-md-microsoft_excel"></i>
        </button>
        <button class="group-header__btn" title="Agregar item" @click="openItemSidebar">
          <i class="nf nf-md-playlist_plus"></i>
        </button>
        <button
          v-if="!isContabilityMode"
          type="button"
          class="group-header__btn"
          title="Agregar columna"
          @click="openSidebar"
        >
          <i class="nf nf-md-table_column_plus_after"></i>
        </button>
      </section>
    </section>

    <BoardGroupTable
      :items="localItems"
      :groups="props.groups ?? []"
      :columns-to-render="columnsToRender"
      :is-contability-mode="isContabilityMode"
      :should-use-cobranza-status-options="shouldUseCobranzaStatusOptions"
      :multiple-selected="itemsSelected.length > 0"
      :is-item-expanded="isItemExpanded"
      :is-subitems-loading="isSubitemsLoading"
      :get-subitems="getSubitems"
      @toggle-subitems="toggleSubitems"
      @add-subitem="openSubitemSidebar"
      @delete-subitem="handleSubitemDeleted"
      @edit-subitem="handleSubitemEdited"
      @selection-change="handleItemSelection"
      @edit="handleItemEdited"
      @delete="handleItemDeleted"
      @move="handleItemsMove"
      @copy="handleItemsCopy"
    />

    <BoardColumnSidebar
      :visible="showColumnSidebar"
      :board-id="group.boardId"
      @close="showColumnSidebar = false"
    />

    <BoardItemSidebar
      :visible="showItemSidebar"
      :group-id="group.id"
      :is-contability-mode="isContabilityMode"
      @close="showItemSidebar = false"
      @created="handleItemCreated"
    />

    <BoardSubitemSidebar
      :visible="showSubitemSidebar"
      :item-parent="selectedParentItemId"
      @close="closeSubitemSidebar"
      @created="handleSubitemCreated"
    />
  </article>
</template>

<style scoped>
.group-header {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  user-select: none;
  margin-bottom: 20px;
}

.group-header__title {
  white-space: nowrap;
  max-width: 700px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--group-color);
  font-size: 1.3rem;
  font-weight: 500;
}

.group-header__controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.group-header__btn {
  font-size: 1.2rem;
  background-color: var(--group-color);
  color: var(--main-color);
  border: none;
  padding: 2px 5px;
  border-radius: 3px;
  cursor: pointer;
  width: 40px;
  transition: all 0.2s ease-in-out;
}

.group-header__btn:hover {
  transform: scale(1.1);
}
</style>
