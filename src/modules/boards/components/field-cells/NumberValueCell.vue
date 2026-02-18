<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue'
import type { Value } from '../../types/values'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  value?: Value
  itemId: string
  columnId: string
}

const props = defineProps<Props>()
const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const localValue = ref<Value | undefined>(props.value ? { ...props.value } : undefined)
const editValue = ref<number | string>('')

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
  // Ensure we store it as a number if possible, but JSON.stringify handles it
  const jsonValue = JSON.stringify(newValue)

  if (localValue.value) {
    localValue.value.value = jsonValue
  } else {
    localValue.value = {
      id: '', // temp
      itemId: props.itemId,
      columnId: props.columnId,
      value: jsonValue,
      columnType: 'number',
    }
  }

  isEditing.value = false

  try {
    if (props.value?.id) {
      await fetch(`${API_BASE_URL}/tableValues/${props.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: jsonValue }),
      })
    } else {
      const response = await fetch(`${API_BASE_URL}/tableValues/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: props.itemId,
          columnId: props.columnId,
          value: jsonValue,
        }),
      })

      if (response.ok) {
        const created = await response.json()
        if (localValue.value) {
          localValue.value.id = created.id
        }
      }
    }
  } catch (error) {
    console.error('Failed to save number value', error)
    // TODO revert optimistic update?
  }
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
