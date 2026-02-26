<script lang="ts" setup>
import { ref } from 'vue'
import SideBar from '@/shared/components/SideBar.vue'
import { API_BASE_URL } from '@/utils/contants'
import type {
  CreateSubitemPayload,
  CreateSubitemResponse,
  CreateSubitemValueResponse,
  SubItemRow,
} from '../types/groupDetail'
import type { Value } from '../types/values'

interface Props {
  visible: boolean
  itemParent: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', subitem: SubItemRow): void
}>()

const isSubmitting = ref(false)
const subitemName = ref('')

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const mapResponseValue = (responseValue: CreateSubitemValueResponse, itemId: string): Value => {
  return {
    id: responseValue.id,
    itemId: responseValue.itemId ?? itemId,
    columnId: responseValue.columnId,
    value: responseValue.value ?? '',
    columnType: responseValue.columnType,
  }
}

const parseCreateSubitemResponse = (
  data: unknown,
  fallbackItemParent: string,
  fallbackName: string,
): SubItemRow | null => {
  if (!isRecord(data)) {
    return null
  }

  const id = data.id
  if (typeof id !== 'string' || !id.trim()) {
    return null
  }

  const itemParent = typeof data.itemParent === 'string' ? data.itemParent : fallbackItemParent
  const name = typeof data.name === 'string' ? data.name : fallbackName

  const parsedResponse: CreateSubitemResponse = {
    id,
    itemParent,
    name,
    values: Array.isArray(data.values)
      ? data.values
          .filter((value) => isRecord(value))
          .filter(
            (value) =>
              typeof value.id === 'string' &&
              typeof value.columnId === 'string' &&
              typeof value.columnType === 'string',
          )
          .map((value) => ({
            id: value.id as string,
            itemId: typeof value.itemId === 'string' || value.itemId === null ? value.itemId : null,
            columnId: value.columnId as string,
            value: typeof value.value === 'string' || value.value === null ? value.value : null,
            columnType: value.columnType as string,
          }))
      : [],
  }

  return {
    id: parsedResponse.id,
    itemParent: parsedResponse.itemParent,
    name: parsedResponse.name,
    values: parsedResponse.values?.map((value) => mapResponseValue(value, parsedResponse.id)) ?? [],
  }
}

const resetForm = () => {
  subitemName.value = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const submit = async () => {
  const trimmedName = subitemName.value.trim()
  if (!trimmedName || !props.itemParent || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    const payload: CreateSubitemPayload = {
      name: trimmedName,
      itemParent: props.itemParent,
    }

    const response = await fetch(`${API_BASE_URL}/subitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return
    }

    const data: unknown = await response.json()
    const createdSubitem = parseCreateSubitemResponse(data, props.itemParent, trimmedName)

    if (!createdSubitem) {
      return
    }

    emit('created', createdSubitem)
    handleClose()
  } catch (error) {
    console.error('Error al crear subitem:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <SideBar :is-open="visible" @close="handleClose">
    <template #header>
      <h3 class="subitem-sidebar__title">Agregar Subitem</h3>
    </template>

    <section class="subitem-sidebar">
      <section class="subitem-sidebar__group">
        <label class="subitem-sidebar__label">Nombre del subitem</label>
        <input
          v-model="subitemName"
          type="text"
          class="subitem-sidebar__input"
          placeholder="Escribe el nombre del subitem"
        />
      </section>

      <button
        class="subitem-sidebar__submit"
        :disabled="!subitemName.trim() || isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? 'Creando...' : 'Crear Subitem' }}
      </button>
    </section>
  </SideBar>
</template>

<style scoped>
.subitem-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subitem-sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subitem-sidebar__title {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}

.subitem-sidebar__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dark-color);
}

.subitem-sidebar__input {
  padding: 0.8rem;
  border: 1px solid var(--shadow-color);
  border-radius: 4px;
  background-color: var(--sec-color);
  color: var(--dark-color);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.subitem-sidebar__input:focus {
  border-color: var(--contrast-color);
}

.subitem-sidebar__submit {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: var(--contrast-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.subitem-sidebar__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
