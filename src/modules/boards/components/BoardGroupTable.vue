<script setup lang="ts">
import type { Column } from '@/shared/types/columns'
import type { Group } from '../types/groups'
import type { ItemDetail } from '../types/items'
import type { SubItemRow } from '../types/groupDetail'
import BoardItemRow from './rows/BoardItemRow.vue'
import BoardSubitemsRows from './rows/BoardSubitemsRows.vue'
import ColumnComponent from './field-cells/ColumnComponent.vue'

interface ItemEditedPayload {
  id: string
  name: string
}

interface Props {
  items: ItemDetail[]
  groups: Group[]
  columnsToRender: Column[]
  isContabilityMode: boolean
  shouldUseCobranzaStatusOptions: boolean
  multipleSelected: boolean
  isItemExpanded: (itemId: string) => boolean
  isSubitemsLoading: (itemId: string) => boolean
  getSubitems: (itemId: string) => SubItemRow[]
  highlightedItemId?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSubitems: [itemId: string]
  addSubitem: [itemId: string]
  deleteSubitem: [payload: { itemId: string; subitemId: string }]
  editSubitem: [payload: { itemId: string; subitemId: string; name: string }]
  selectionChange: [itemId: string, isSelected: boolean]
  edit: [payload: ItemEditedPayload]
  delete: [itemId: string]
  move: [itemId: string, targetGroupId: string]
  copy: [itemId: string, targetGroupId: string]
}>()
</script>

<template>
  <table class="group-table">
    <thead>
      <tr>
        <th class="group-table__item-column">Item</th>
        <template v-for="column in columnsToRender" :key="column.id">
          <ColumnComponent v-if="!isContabilityMode" :column="column" />
          <th v-else class="group-table__readonly-column">{{ column.name }}</th>
        </template>
        <th class="group-table__control-column"></th>
      </tr>
    </thead>
    <tbody>
      <template v-for="item in items" :key="item.id">
        <BoardItemRow
          :item="item"
          :groups="groups"
          :columns-to-render="columnsToRender"
          :should-use-cobranza-status-options="shouldUseCobranzaStatusOptions"
          :is-expanded="isItemExpanded(item.id)"
          :multiple-selected="multipleSelected"
          :is-highlighted="item.id === highlightedItemId"
          @toggle-subitems="(itemId) => emit('toggleSubitems', itemId)"
          @selection-change="(itemId, selected) => emit('selectionChange', itemId, selected)"
          @edit="(payload) => emit('edit', payload)"
          @delete="(itemId) => emit('delete', itemId)"
          @move="(itemId, targetGroupId) => emit('move', itemId, targetGroupId)"
          @copy="(itemId, targetGroupId) => emit('copy', itemId, targetGroupId)"
        />

        <BoardSubitemsRows
          :item-id="item.id"
          :columns-to-render="columnsToRender"
          :is-expanded="isItemExpanded(item.id)"
          :is-loading="isSubitemsLoading(item.id)"
          :subitems="getSubitems(item.id)"
          :should-use-cobranza-status-options="shouldUseCobranzaStatusOptions"
          @add-subitem="(itemId) => emit('addSubitem', itemId)"
          @delete-subitem="(payload) => emit('deleteSubitem', payload)"
          @edit-subitem="(payload) => emit('editSubitem', payload)"
        />
      </template>
    </tbody>
  </table>
</template>

<style scoped>
.group-table {
  border-collapse: collapse;
  table-layout: auto;
  width: max-content;
}

.group-table__item-column {
  min-width: 200px;
  text-align: left;
  border: 1px solid var(--ter-color);
  padding: 3px 6px;
  font-weight: 400;
}

.group-table__readonly-column {
  min-width: 200px;
  text-align: left;
  border: 1px solid var(--ter-color);
  padding: 3px 6px;
  font-weight: 400;
}

.group-table__control-column {
  min-width: 100px;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ter-color);
}
</style>
