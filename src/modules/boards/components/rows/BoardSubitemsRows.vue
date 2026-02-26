<script setup lang="ts">
import { ref } from 'vue'
import type { Column } from '@/shared/types/columns'
import type { ItemWithValues, SubItemRow } from '../../types/groupDetail'
import type { Value } from '../../types/values'
import TextValueCell from '../field-cells/TextValueCell.vue'
import NumberValueCell from '../field-cells/NumberValueCell.vue'
import DateValueCell from '../field-cells/DateValueCell.vue'
import StatusValueCell from '../field-cells/StatusValueCell.vue'
import TimelineValueCell from '../field-cells/TimelineValueCell.vue'

interface Props {
  itemId: string
  columnsToRender: Column[]
  isExpanded: boolean
  isLoading: boolean
  subitems: SubItemRow[]
  shouldUseCobranzaStatusOptions: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addSubitem: [itemId: string]
  deleteSubitem: [payload: { itemId: string; subitemId: string }]
  editSubitem: [payload: { itemId: string; subitemId: string; name: string }]
}>()

const editingSubitemId = ref<string | null>(null)
const editingSubitemName = ref('')

const getValueForColumn = (item: ItemWithValues, columnId: string): Value | undefined => {
  return item.values.find((value) => value.columnId === columnId)
}

const openEditSubitem = (subitem: SubItemRow) => {
  editingSubitemId.value = subitem.id
  editingSubitemName.value = subitem.name
}

const cancelEditSubitem = () => {
  editingSubitemId.value = null
  editingSubitemName.value = ''
}

const confirmEditSubitem = (subitem: SubItemRow) => {
  const trimmedName = editingSubitemName.value.trim()
  if (!trimmedName) {
    return
  }

  if (trimmedName !== subitem.name) {
    emit('editSubitem', {
      itemId: props.itemId,
      subitemId: subitem.id,
      name: trimmedName,
    })
  }

  cancelEditSubitem()
}

const emitDeleteSubitem = (subitemId: string) => {
  emit('deleteSubitem', {
    itemId: props.itemId,
    subitemId,
  })
}
</script>

<template>
  <tr v-if="isExpanded && isLoading">
    <td :colspan="columnsToRender.length + 2" class="subitem-row__state">Cargando subitems...</td>
  </tr>

  <tr v-if="isExpanded" class="subitem-add-row">
    <td :colspan="columnsToRender.length + 2" class="subitem-add-row__cell">
      <button type="button" class="subitem-add-row__btn" @click="emit('addSubitem', itemId)">
        + Agregar subitem
      </button>
    </td>
  </tr>

  <tr v-for="subitem in subitems" :key="subitem.id" v-show="isExpanded" class="subitem-row">
    <td class="subitem-row__cell">
      <section class="subitem-row__name-cell">
        <section class="subitem-row__name-content">
          <input
            v-if="editingSubitemId === subitem.id"
            v-model="editingSubitemName"
            type="text"
            class="subitem-row__name-input"
          />
          <span v-else class="subitem-row__name">{{ subitem.name }}</span>
        </section>

        <section class="subitem-row__actions">
          <button
            v-if="editingSubitemId === subitem.id"
            type="button"
            class="subitem-row__action-btn"
            title="Guardar nombre"
            @click="confirmEditSubitem(subitem)"
          >
            <i class="nf nf-md-check"></i>
          </button>
          <button
            v-if="editingSubitemId === subitem.id"
            type="button"
            class="subitem-row__action-btn"
            title="Cancelar edición"
            @click="cancelEditSubitem"
          >
            <i class="nf nf-md-close"></i>
          </button>
          <button
            v-else
            type="button"
            class="subitem-row__action-btn"
            title="Editar subitem"
            @click="openEditSubitem(subitem)"
          >
            <i class="nf nf-md-pencil"></i>
          </button>
          <button
            type="button"
            class="subitem-row__action-btn"
            title="Eliminar subitem"
            @click="emitDeleteSubitem(subitem.id)"
          >
            <i class="nf nf-md-delete"></i>
          </button>
        </section>
      </section>
    </td>
    <td v-for="column in columnsToRender" :key="column.id" class="subitem-row__cell">
      <TextValueCell
        v-if="column.type === 'text'"
        :value="getValueForColumn(subitem, column.id)"
        :item-id="subitem.id"
        :column-id="column.id"
      >
        <span class="subitem-row__empty-value"> - </span>
      </TextValueCell>

      <NumberValueCell
        v-else-if="column.type === 'number'"
        :value="getValueForColumn(subitem, column.id)"
        :item-id="subitem.id"
        :column-id="column.id"
      >
        <span class="subitem-row__empty-value"> - </span>
      </NumberValueCell>

      <DateValueCell
        v-else-if="column.type === 'date'"
        :value="getValueForColumn(subitem, column.id)"
        :item-id="subitem.id"
        :column-id="column.id"
      >
        <span class="subitem-row__empty-value"> - </span>
      </DateValueCell>

      <StatusValueCell
        v-else-if="column.type === 'status'"
        :value="getValueForColumn(subitem, column.id)"
        :item-id="subitem.id"
        :column-id="column.id"
        :use-cobranza-status-options="shouldUseCobranzaStatusOptions"
      >
        <span class="subitem-row__empty-value"> - </span>
      </StatusValueCell>

      <TimelineValueCell
        v-else-if="column.type === 'timeline'"
        :value="getValueForColumn(subitem, column.id)"
        :item-id="subitem.id"
        :column-id="column.id"
      >
        <span class="subitem-row__empty-value"> - </span>
      </TimelineValueCell>
    </td>
    <td class="subitem-row__control-cell"></td>
  </tr>
</template>

<style scoped>
.subitem-row__cell {
  border: 1px solid var(--ter-color);
  cursor: pointer;
  height: 38px;
  background-color: rgba(0, 0, 0, 0.02);
}

.subitem-row__control-cell {
  min-width: 100px;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ter-color);
  height: 38px;
}

.subitem-row__name-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding-left: 34px;
  gap: 8px;
}

.subitem-row__name {
  color: var(--font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subitem-row__name-content {
  min-width: 0;
  flex: 1;
}

.subitem-row__name-input {
  width: 100%;
  border: 1px solid var(--ter-color);
  background-color: var(--sec-color);
  color: var(--font-color);
  border-radius: 3px;
  font: inherit;
  padding: 2px 6px;
}

.subitem-row__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.subitem-row__action-btn {
  border: none;
  background-color: transparent;
  color: var(--font-color);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.subitem-row__action-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.subitem-row__state {
  border: 1px solid var(--ter-color);
  padding: 6px 10px;
  color: var(--font-color);
}

.subitem-row__empty-value {
  background-color: rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
</style>
