<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { GroupDetail } from '../types/groups'
import type { Value } from '../types/values'
import { useColumnsStore } from '@/stores/columns'
import { useContabilityColumnsStore } from '@/stores/contabilityColumns'
import TextValueCell from './field-cells/TextValueCell.vue'
import NumberValueCell from './field-cells/NumberValueCell.vue'
import DateValueCell from './field-cells/DateValueCell.vue'
import StatusValueCell from './field-cells/StatusValueCell.vue'
import TimelineValueCell from './field-cells/TimelineValueCell.vue'
import ColumnComponent from './field-cells/ColumnComponent.vue'
import ItemNameCell from './field-cells/ItemNameCell.vue'
import BoardColumnSidebar from './BoardColumnSidebar.vue'
import BoardItemSidebar from './BoardItemSidebar.vue'
import type { ItemDetail, SubItemDetail } from '../types/items'
import type { Group } from '../types/groups'
import { API_BASE_URL } from '@/utils/contants'

interface MoveItemsPayload {
  itemIds: string[]
  targetGroupId: string
}

interface CopyItemPayload {
  itemIds: string[]
  targetGroupId: string
}

interface DeleteItemsPayload {
  itemIds: string[]
}

interface ItemWithValues {
  values: Array<Value>
}

interface SubItemRow {
  id: string
  itemParent: string
  name: string
  values: Array<Value>
}

type GetSubItemsResponse = Array<SubItemDetail>

interface Props {
  group: GroupDetail
  groups?: Group[]
}

const props = defineProps<Props>()
const columnsStore = useColumnsStore()
const contabilityColumnsStore = useContabilityColumnsStore()
const itemsSelected = ref<string[]>([])
const localItems = ref<GroupDetail['items']>([])
const expandedItemIds = ref<string[]>([])
const subitemsByItemId = ref<Record<string, Array<SubItemRow>>>({})
const loadingSubitemsByItemId = ref<Record<string, boolean>>({})
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
    expandedItemIds.value = []
    subitemsByItemId.value = {}
    loadingSubitemsByItemId.value = {}
  },
  { immediate: true },
)

const getValueForColumn = (item: ItemWithValues, columnId: string): Value | undefined => {
  return item.values.find((value) => value.columnId === columnId)
}

const mapSubItemValues = (subItem: SubItemDetail): Array<Value> => {
  return subItem.values.map((value) => ({
    id: value.id,
    itemId: value.itemId ?? subItem.id,
    columnId: value.columnId,
    value: value.value ?? '',
    columnType: value.columnType,
  }))
}

const mapSubItemsResponse = (subItems: GetSubItemsResponse): Array<SubItemRow> => {
  return subItems.map((subItem) => ({
    id: subItem.id,
    itemParent: subItem.itemParent,
    name: subItem.name,
    values: mapSubItemValues(subItem),
  }))
}

const isItemExpanded = (itemId: string): boolean => {
  return expandedItemIds.value.includes(itemId)
}

const isSubitemsLoading = (itemId: string): boolean => {
  return loadingSubitemsByItemId.value[itemId] ?? false
}

const getSubitems = (itemId: string): Array<SubItemRow> => {
  return subitemsByItemId.value[itemId] ?? []
}

const fetchSubitemsByItemId = async (itemId: string) => {
  if (subitemsByItemId.value[itemId] || isSubitemsLoading(itemId)) {
    return
  }

  loadingSubitemsByItemId.value = {
    ...loadingSubitemsByItemId.value,
    [itemId]: true,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/subitems/parent/${itemId}`)

    if (!response.ok) {
      return
    }

    const data: unknown = await response.json()
    const mappedSubItems = Array.isArray(data)
      ? mapSubItemsResponse(data as GetSubItemsResponse)
      : []

    subitemsByItemId.value = {
      ...subitemsByItemId.value,
      [itemId]: mappedSubItems,
    }
  } catch (error) {
    console.error('Error al cargar subitems:', error)
  } finally {
    loadingSubitemsByItemId.value = {
      ...loadingSubitemsByItemId.value,
      [itemId]: false,
    }
  }
}

const toggleSubitems = async (itemId: string) => {
  if (isItemExpanded(itemId)) {
    expandedItemIds.value = expandedItemIds.value.filter((id) => id !== itemId)
    return
  }

  expandedItemIds.value = [...expandedItemIds.value, itemId]
  await fetchSubitemsByItemId(itemId)
}

const showColumnSidebar = ref(false)

const openSidebar = () => {
  showColumnSidebar.value = true
}

const showItemSidebar = ref(false)

const openItemSidebar = () => {
  showItemSidebar.value = true
}

const handleItemCreated = (item: ItemDetail) => {
  localItems.value.push({
    ...item,
  })
}

const handleItemSelection = (itemId: string, isSelected: boolean) => {
  if (isSelected) {
    itemsSelected.value.push(itemId)
  } else {
    itemsSelected.value = itemsSelected.value.filter((id) => id !== itemId)
  }
}

const handleItemEdited = (payload: { id: string; name: string }) => {
  const itemIndex = localItems.value.findIndex((item) => item.id === payload.id)
  if (itemIndex !== -1) {
    localItems.value[itemIndex]!.name = payload.name
  }
}

const handleItemDeleted = async (itemId: string) => {
  const itemIsSelected = itemsSelected.value.includes(itemId)
  if (!itemIsSelected) itemsSelected.value.push(itemId)

  try {
    const payload: DeleteItemsPayload = {
      itemIds: [...itemsSelected.value],
    }

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return
    }

    localItems.value = localItems.value.filter((item) => !itemsSelected.value.includes(item.id))
    itemsSelected.value = []
  } catch (error) {
    console.error('Error al eliminar items:', error)
  }
}

const handleItemsMove = async (itemId: string, targetGroupId: string) => {
  const itemIsSelected = itemsSelected.value.includes(itemId)
  if (!itemIsSelected) itemsSelected.value.push(itemId)

  try {
    const payload: MoveItemsPayload = {
      itemIds: [...itemsSelected.value],
      targetGroupId: targetGroupId,
    }

    const response = await fetch(`${API_BASE_URL}/items/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return
    }

    localItems.value = localItems.value.filter((item) => !itemsSelected.value.includes(item.id))
    itemsSelected.value = []
  } catch (error) {
    console.error('Error al mover item:', error)
  }
}

const handleItemsCopy = async (itemId: string, targetGroupId: string) => {
  const itemIsSelected = itemsSelected.value.includes(itemId)
  if (!itemIsSelected) itemsSelected.value.push(itemId)
  try {
    const payload: CopyItemPayload = {
      itemIds: [...itemsSelected.value],
      targetGroupId: targetGroupId,
    }

    const response = await fetch(`${API_BASE_URL}/items/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return
    }
  } catch (error) {
    console.error('Error al copiar item:', error)
  }
}
</script>

<template>
  <article class="group-container" :style="{ '--group-color': group.color }">
    <section class="header-container">
      <p :title="group.name">{{ group.name }}</p>
      <section class="header--controls">
        <button
          type="button"
          class="header--btn"
          title="Exportar a Excel"
          v-if="!isContabilityMode"
        >
          <i class="nf nf-md-microsoft_excel"></i>
        </button>
        <button class="header--btn" title="Agregar item" @click="openItemSidebar">
          <i class="nf nf-md-playlist_plus"></i>
        </button>
        <button
          v-if="!isContabilityMode"
          type="button"
          class="header--btn"
          title="Agregar columna"
          @click="openSidebar"
        >
          <i class="nf nf-md-table_column_plus_after"></i>
        </button>
      </section>
    </section>

    <table class="table-data">
      <thead>
        <tr>
          <th class="column-item--name">Item</th>
          <template v-for="column in columnsToRender" :key="column.id">
            <ColumnComponent v-if="!isContabilityMode" :column="column" />
            <th v-else class="column-header-readonly">{{ column.name }}</th>
          </template>
          <th class="control-component"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in localItems" :key="item.id">
          <tr>
            <td>
              <section class="item-cell">
                <button
                  type="button"
                  class="item-cell__expand-btn"
                  :title="isItemExpanded(item.id) ? 'Ocultar subitems' : 'Mostrar subitems'"
                  @click="toggleSubitems(item.id)"
                >
                  <span
                    class="item-cell__expand-icon"
                    :class="{ 'item-cell__expand-icon--expanded': isItemExpanded(item.id) }"
                  >
                    ▶
                  </span>
                </button>
                <ItemNameCell
                  :item="item"
                  :groups="props.groups ?? []"
                  @selectionChange="handleItemSelection"
                  @edit="handleItemEdited"
                  @delete="handleItemDeleted"
                  @move="handleItemsMove"
                  @copy="handleItemsCopy"
                  :multiple-selected="itemsSelected.length > 0"
                />
              </section>
            </td>
            <td v-for="column in columnsToRender" :key="column.id">
              <TextValueCell
                v-if="column.type === 'text'"
                :value="getValueForColumn(item, column.id)"
                :item-id="item.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </TextValueCell>

              <NumberValueCell
                v-else-if="column.type === 'number'"
                :value="getValueForColumn(item, column.id)"
                :item-id="item.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </NumberValueCell>

              <DateValueCell
                v-else-if="column.type === 'date'"
                :value="getValueForColumn(item, column.id)"
                :item-id="item.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </DateValueCell>

              <StatusValueCell
                v-else-if="column.type === 'status'"
                :value="getValueForColumn(item, column.id)"
                :item-id="item.id"
                :column-id="column.id"
                :use-cobranza-status-options="shouldUseCobranzaStatusOptions"
              >
                <span class="empty-value"> - </span>
              </StatusValueCell>

              <TimelineValueCell
                v-else-if="column.type === 'timeline'"
                :value="getValueForColumn(item, column.id)"
                :item-id="item.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </TimelineValueCell>
            </td>
            <td class="control-component"></td>
          </tr>

          <tr v-if="isItemExpanded(item.id) && isSubitemsLoading(item.id)">
            <td :colspan="columnsToRender.length + 2" class="subitem-row__state">
              Cargando subitems...
            </td>
          </tr>

          <tr v-if="isItemExpanded(item.id)" class="subitem-add-row">
            <td :colspan="columnsToRender.length + 2" class="subitem-add-row__cell">
              <button type="button" class="subitem-add-row__btn">+ Agregar subitem</button>
            </td>
          </tr>

          <tr
            v-for="subitem in getSubitems(item.id)"
            :key="subitem.id"
            v-show="isItemExpanded(item.id)"
            class="subitem-row"
          >
            <td>
              <section class="subitem-row__name-cell">
                <span class="subitem-row__name">{{ subitem.name }}</span>
              </section>
            </td>
            <td v-for="column in columnsToRender" :key="column.id">
              <TextValueCell
                v-if="column.type === 'text'"
                :value="getValueForColumn(subitem, column.id)"
                :item-id="subitem.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </TextValueCell>

              <NumberValueCell
                v-else-if="column.type === 'number'"
                :value="getValueForColumn(subitem, column.id)"
                :item-id="subitem.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </NumberValueCell>

              <DateValueCell
                v-else-if="column.type === 'date'"
                :value="getValueForColumn(subitem, column.id)"
                :item-id="subitem.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </DateValueCell>

              <StatusValueCell
                v-else-if="column.type === 'status'"
                :value="getValueForColumn(subitem, column.id)"
                :item-id="subitem.id"
                :column-id="column.id"
                :use-cobranza-status-options="shouldUseCobranzaStatusOptions"
              >
                <span class="empty-value"> - </span>
              </StatusValueCell>

              <TimelineValueCell
                v-else-if="column.type === 'timeline'"
                :value="getValueForColumn(subitem, column.id)"
                :item-id="subitem.id"
                :column-id="column.id"
              >
                <span class="empty-value"> - </span>
              </TimelineValueCell>
            </td>
            <td class="control-component"></td>
          </tr>
        </template>
      </tbody>
    </table>

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
  </article>
</template>

<style scoped>
.column-item--name {
  min-width: 200px;
  text-align: left;
  border: 1px solid var(--ter-color);
  padding: 3px 6px;
  font-weight: 400;
}

.column-header-readonly {
  min-width: 200px;
  text-align: left;
  border: 1px solid var(--ter-color);
  padding: 3px 6px;
  font-weight: 400;
}

.empty-value {
  background-color: rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.table-data td {
  border: 1px solid var(--ter-color);
  cursor: pointer;
  height: 38px;
}

.item-cell {
  display: flex;
  align-items: stretch;
}

.item-cell__expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  border: none;
  border-right: 1px solid var(--ter-color);
  background-color: transparent;
  color: var(--font-color);
  cursor: pointer;
}

.item-cell__expand-icon {
  display: inline-flex;
  transform: rotate(0deg);
  transition: transform 0.2s ease-in-out;
}

.item-cell__expand-icon--expanded {
  transform: rotate(90deg);
}

.subitem-row td {
  background-color: rgba(0, 0, 0, 0.02);
}

.subitem-row__name-cell {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding-left: 34px;
}

.subitem-row__name {
  color: var(--font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subitem-row__state {
  border: 1px solid var(--ter-color);
  padding: 6px 10px;
  color: var(--font-color);
}

.subitem-add-row__cell {
  border: 1px solid var(--ter-color);
  padding: 0;
  background-color: transparent;
}

.subitem-add-row__btn {
  border: none;
  background-color: transparent;
  color: var(--font-color);
  padding: 0 10px 0 34px;
  min-height: 38px;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.subitem-add-row__btn:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.control-component {
  min-width: 100px;
  background-color: rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  user-select: none;
  margin-bottom: 20px;
}

.header-container p {
  white-space: nowrap;
  max-width: 700px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header--controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header--btn {
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

.header--btn:hover {
  transform: scale(1.1);
}

.header-container p {
  color: var(--group-color);
  font-size: 1.3rem;
  font-weight: 500;
}

.table-data {
  border-collapse: collapse;
  table-layout: auto;
  width: max-content;
}
</style>
