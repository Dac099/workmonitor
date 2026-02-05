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
    </table>
  </article>
</template>

<style scoped>
.column-item--name {
  min-width: 200px;
  width: 200px;
  text-align: left;
  border: 1px solid var(--ter-color);
  padding: 3px 6px;
  font-weight: 400;
  resize: horizontal;
  overflow: hidden;
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
  table-layout: fixed;
  width: max-content;
  min-width: 100%;
}
</style>
