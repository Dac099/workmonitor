<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue'
import type { Value } from '../../types/values'
import { useLocalValue } from '../../composables/useLocalValue'
import { useTableValueAPI } from '../../composables/useTableValueAPI'

interface Props {
  value?: Value
  itemId: string
  columnId: string
}

const props = defineProps<Props>()
const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const editValue = ref<number | string>('')

const { localValue, updateLocal, setId } = useLocalValue(props.value, {
  itemId: props.itemId,
  columnId: props.columnId,
  columnType: 'number',
})

const { save: saveToAPI } = useTableValueAPI()

// Use localValue for optimistic updates, falling back to props if undefined
const displayValue = computed(() => {
  const v = localValue.value ?? props.value
  if (!v) return ''
  try {
    return JSON.parse(v.value)
  } catch {
    return v.value
  }
})

const startEditing = async () => {
  editValue.value = displayValue.value
  isEditing.value = true
  await nextTick()
  inputRef.value?.focus()
}

const cancelEditing = () => {
  isEditing.value = false
  editValue.value = ''
}

const save = async () => {
  // Only save if changed
  const newValue = editValue.value
  const oldValue = displayValue.value

  // Convert to string for comparison to handle potential type mismatches
  if (String(newValue) === String(oldValue)) {
    isEditing.value = false
    return
  }

  // Optimistic update
  const jsonValue = JSON.stringify(newValue)
  updateLocal(jsonValue)
  isEditing.value = false

  // API call
  await saveToAPI({
    valueId: props.value?.id,
    itemId: props.itemId,
    columnId: props.columnId,
    value: jsonValue,
    onSuccess: (response) => {
      setId(response.id)
    },
  })
}
</script>

<template>
  <div class="cell-container" @dblclick="startEditing">
    <template v-if="!isEditing">
      <slot v-if="displayValue === '' || displayValue === null || displayValue === undefined" />
      <span v-else class="cell-text" :title="String(displayValue)">{{ displayValue }}</span>
    </template>

    <input
      v-else
      ref="inputRef"
      v-model="editValue"
      type="number"
      class="cell-input"
      @blur="save"
      @keydown.enter="save"
      @keydown.esc="cancelEditing"
    />
  </div>
</template>

<style scoped>
.cell-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-text {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  text-align: center;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0 5px;
  margin: 0;
  text-align: center;
}

/* Remove arrows/spinners from number input */
.cell-input::-webkit-outer-spin-button,
.cell-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cell-input {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
