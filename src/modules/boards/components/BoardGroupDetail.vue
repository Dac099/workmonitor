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
import type { ItemDetail } from '../types/items'

interface Props {
  group: GroupDetail
}

const props = defineProps<Props>()
const columnsStore = useColumnsStore()

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
</script>

<template>
  <article class="group-container" :style="{ '--group-color': group.color }">
    <section class="header-container">
      <p :title="group.name">{{ group.name }}</p>
      <section class="header--controls">
        <button type="button" class="header--btn" title="Exportar a Excel">
          <i class="nf nf-md-microsoft_excel"></i>
        </button>
        <button class="header--btn" title="Agregar item">
          <i class="nf nf-md-playlist_plus"></i>
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
            <ItemNameCell :item="item" />
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
            >
              <span class="empty-value"> - </span>
            </NumberValueCell>

            <DateValueCell
              v-else-if="column.type === 'date'"
              :value="getValueForColumn(item, column.id)?.value"
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
            >
              <span class="empty-value"> - </span>
            </TimelineValueCell>
          </td>
        </tr>
      </tbody>
    </table>
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
  min-width: 100%;
}
</style>
