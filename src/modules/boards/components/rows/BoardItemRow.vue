<script setup lang="ts">
import type { Column } from '@/shared/types/columns'
import type { Group } from '../../types/groups'
import type { ItemDetail } from '../../types/items'
import type { ItemWithValues } from '../../types/groupDetail'
import type { Value } from '../../types/values'
import TextValueCell from '../field-cells/TextValueCell.vue'
import NumberValueCell from '../field-cells/NumberValueCell.vue'
import DateValueCell from '../field-cells/DateValueCell.vue'
import StatusValueCell from '../field-cells/StatusValueCell.vue'
import TimelineValueCell from '../field-cells/TimelineValueCell.vue'
import ItemNameCell from '../field-cells/ItemNameCell.vue'

interface ItemEditedPayload {
  id: string
  name: string
}

interface Props {
  item: ItemDetail
  groups: Group[]
  columnsToRender: Column[]
  shouldUseCobranzaStatusOptions: boolean
  isExpanded: boolean
  multipleSelected: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSubitems: [itemId: string]
  selectionChange: [itemId: string, isSelected: boolean]
  edit: [payload: ItemEditedPayload]
  delete: [itemId: string]
  move: [itemId: string, targetGroupId: string]
  copy: [itemId: string, targetGroupId: string]
}>()

const getValueForColumn = (item: ItemWithValues, columnId: string): Value | undefined => {
  return item.values.find((value) => value.columnId === columnId)
}
</script>

<template>
  <tr class="item-row">
    <td class="item-row__cell">
      <section class="item-row__cell-content">
        <button
          type="button"
          class="item-row__expand-btn"
          :title="isExpanded ? 'Ocultar subitems' : 'Mostrar subitems'"
          @click="emit('toggleSubitems', item.id)"
        >
          <span
            class="item-row__expand-icon"
            :class="{ 'item-row__expand-icon--expanded': isExpanded }"
          >
            ▶
          </span>
        </button>
        <ItemNameCell
          :item="item"
          :groups="groups"
          :multiple-selected="multipleSelected"
          @selection-change="(itemId, selected) => emit('selectionChange', itemId, selected)"
          @edit="(payload) => emit('edit', payload)"
          @delete="(itemId) => emit('delete', itemId)"
          @move="(itemId, targetGroupId) => emit('move', itemId, targetGroupId)"
          @copy="(itemId, targetGroupId) => emit('copy', itemId, targetGroupId)"
        />
      </section>
    </td>
    <td v-for="column in columnsToRender" :key="column.id" class="item-row__cell">
      <TextValueCell
        v-if="column.type === 'text'"
        :value="getValueForColumn(item, column.id)"
        :item-id="item.id"
        :column-id="column.id"
      >
        <span class="item-row__empty-value"> - </span>
      </TextValueCell>

      <NumberValueCell
        v-else-if="column.type === 'number'"
        :value="getValueForColumn(item, column.id)"
        :item-id="item.id"
        :column-id="column.id"
      >
        <span class="item-row__empty-value"> - </span>
      </NumberValueCell>

      <DateValueCell
        v-else-if="column.type === 'date'"
        :value="getValueForColumn(item, column.id)"
        :item-id="item.id"
        :column-id="column.id"
      >
        <span class="item-row__empty-value"> - </span>
      </DateValueCell>

      <StatusValueCell
        v-else-if="column.type === 'status'"
        :value="getValueForColumn(item, column.id)"
        :item-id="item.id"
        :column-id="column.id"
        :use-cobranza-status-options="shouldUseCobranzaStatusOptions"
      >
        <span class="item-row__empty-value"> - </span>
      </StatusValueCell>

      <TimelineValueCell
        v-else-if="column.type === 'timeline'"
        :value="getValueForColumn(item, column.id)"
        :item-id="item.id"
        :column-id="column.id"
      >
        <span class="item-row__empty-value"> - </span>
      </TimelineValueCell>
    </td>
    <td class="item-row__control-cell"></td>
  </tr>
</template>

<style scoped>
.item-row__cell {
  border: 1px solid var(--ter-color);
  cursor: pointer;
  height: 38px;
}

.item-row__control-cell {
  min-width: 100px;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ter-color);
  height: 38px;
}

.item-row__cell-content {
  display: flex;
  align-items: stretch;
}

.item-row__expand-btn {
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

.item-row__expand-icon {
  display: inline-flex;
  transform: rotate(0deg);
  transition: transform 0.2s ease-in-out;
}

.item-row__expand-icon--expanded {
  transform: rotate(90deg);
}

.item-row__empty-value {
  background-color: rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
