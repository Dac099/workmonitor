<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { GroupDetail } from '../types/groups'
import type { Value } from '../types/values'
import { useColumnsStore } from '@/stores/columns'
import TextValueCell from './field-cells/TextValueCell.vue'
import NumberValueCell from './field-cells/NumberValueCell.vue'
import DateValueCell from './field-cells/DateValueCell.vue'
import StatusValueCell from './field-cells/StatusValueCell.vue'
import TimelineValueCell from './field-cells/TimelineValueCell.vue'
import ColumnComponent from './field-cells/ColumnComponent.vue'
import ItemNameCell from './field-cells/ItemNameCell.vue'
import BoardColumnSidebar from './BoardColumnSidebar.vue'
import BoardItemSidebar from './BoardItemSidebar.vue'
import type { ItemDetail } from '../types/items'
import type { Group } from '../types/groups'
import { API_BASE_URL } from '@/utils/contants'

interface MoveItemsPayload {
  itemIds: string[]
  targetGroupId: string
}

interface Props {
  group: GroupDetail
  groups: Group[]
}

const props = defineProps<Props>()
const columnsStore = useColumnsStore()
const itemsSelected = ref<string[]>([])
const localItems = ref<GroupDetail['items']>([])

watch(
  () => props.group,
  (group) => {
    localItems.value = group.items.map((item) => ({
      ...item,
      values: item.values.map((value) => ({ ...value })),
    }))
  },
  { immediate: true },
)

const getValueForColumn = (item: ItemDetail, columnId: string): Value | undefined => {
  return item.values.find((value) => value.columnId === columnId)
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

const handleItemDeleted = (itemId: string) => {
  localItems.value = localItems.value.filter((item) => item.id !== itemId)
  itemsSelected.value = itemsSelected.value.filter((id) => id !== itemId)
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
</script>

<template>
  <article class="group-container" :style="{ '--group-color': group.color }">
    <section class="header-container">
      <p :title="group.name">{{ group.name }}</p>
      <section class="header--controls">
        <button type="button" class="header--btn" title="Exportar a Excel">
          <i class="nf nf-md-microsoft_excel"></i>
        </button>
        <button class="header--btn" title="Agregar item" @click="openItemSidebar">
          <i class="nf nf-md-playlist_plus"></i>
        </button>
        <button type="button" class="header--btn" title="Agregar columna" @click="openSidebar">
          <i class="nf nf-md-table_column_plus_after"></i>
        </button>
      </section>
    </section>

    <table class="table-data">
      <thead>
        <tr>
          <th class="column-item--name">Item</th>
          <ColumnComponent
            v-for="column in columnsStore.getColumnsSorted()"
            :key="column.id"
            :column="column"
          />
          <th class="control-component"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in localItems" :key="item.id">
          <td>
            <ItemNameCell
              :item="item"
              :groups="props.groups"
              @selectionChange="handleItemSelection"
              @edit="handleItemEdited"
              @delete="handleItemDeleted"
              @move="handleItemsMove"
              :multiple-selected="itemsSelected.length > 0"
            />
          </td>
          <td v-for="column in columnsStore.getColumnsSorted()" :key="column.id">
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
        </tr>
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
