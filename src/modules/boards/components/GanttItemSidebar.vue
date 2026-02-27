<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import SideBar from '@/shared/components/SideBar.vue'
import ProjectSearchSelect from '@/shared/components/ProjectSearchSelect.vue'
import { API_BASE_URL } from '@/utils/contants'
import type { ItemDetail } from '../types/items'
import type { ProjectSearchItem } from '@/shared/types/project'
import type { Group } from '../types/groups'

interface Props {
  visible: boolean
  groups: Group[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', item: ItemDetail): void
  (e: 'update:visible', value: boolean): void
}>()

const isLoading = ref(false)
const itemName = ref('')
const selectedProject = ref<ProjectSearchItem | null>(null)
const selectedGroupId = ref<string>('')

const canSubmit = computed(() => {
  return itemName.value.trim().length > 0 && selectedGroupId.value.length > 0
})

watch(selectedProject, (newSelectedProject) => {
  if (!newSelectedProject) {
    return
  }

  itemName.value = `${newSelectedProject.idProyect.trim()} | ${newSelectedProject.nomProyecto ?? ''}`
})

const handleClose = () => {
  itemName.value = ''
  selectedProject.value = null
  selectedGroupId.value = ''
  emit('close')
  emit('update:visible', false)
}

const submit = async () => {
  if (!canSubmit.value || isLoading.value) return
  isLoading.value = true

  try {
    const payload = {
      groupId: selectedGroupId.value,
      name: itemName.value,
      projectId: selectedProject.value?.idProyect,
    }

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to create item: ${response.statusText}`)
    }

    const newItem = await response.json()
    emit('created', {
      ...newItem,
      values: [],
      chats: [],
    })

    // Reset form
    itemName.value = ''
    selectedProject.value = null
    selectedGroupId.value = ''

    handleClose()
  } catch (error) {
    console.error('Failed to create item', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <SideBar :is-open="props.visible" @close="handleClose">
    <template #header>
      <h3>Agregar Item</h3>
    </template>

    <div class="form-container">
      <div class="form-group">
        <label for="group-select">Grupo</label>
        <select id="group-select" v-model="selectedGroupId" class="form-select">
          <option value="">Selecciona un grupo</option>
          <option v-for="group in props.groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="item-name">Nombre del Item</label>
        <input
          id="item-name"
          v-model="itemName"
          type="text"
          class="form-input"
          placeholder="Escribe el nombre del item"
        />
      </div>

      <ProjectSearchSelect v-model="selectedProject" />

      <button class="submit-btn" :disabled="!canSubmit || isLoading" @click="submit">
        {{ isLoading ? 'Creando...' : 'Crear Item' }}
      </button>
    </div>
  </SideBar>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dark-color);
}

.form-input,
.form-select {
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

.form-input:focus,
.form-select:focus {
  border-color: var(--contrast-color);
}

.form-select {
  cursor: pointer;
}

.submit-btn {
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

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

h3 {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}
</style>
