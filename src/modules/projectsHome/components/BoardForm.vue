<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import type { SubmitBoardDto } from '../types/board'

const boardName: Ref<string> = ref('')
const category: Ref<string> = ref('')
const mainView: Ref<string> = ref('groups')
const isPersonal: Ref<boolean> = ref(false)
const options: Ref<string[]> = ref(['Proyectos', 'Diseño', 'Cobranza', 'Servicios'])
const showInput: Ref<boolean> = ref(false)
const newCategoryName: Ref<string> = ref('')

const emit = defineEmits<{
  (e: 'submit', board: SubmitBoardDto): void
}>()

const handleSubmit = () => {
  emit('submit', {
    category: category.value,
    mainView: mainView.value,
    isPersonal: isPersonal.value,
    name: boardName.value,
    ownerId: 2,
    createdAt: new Date(),
  })
}

const addNewOption = (newOption: string) => {
  if (!newOption) return
  options.value.push(newOption)
  newCategoryName.value = ''
  toggleInput()
}

const toggleInput = () => {
  showInput.value = !showInput.value
}
</script>

<template>
  <form action="#">
    <div class="input-group">
      <label for="boardName">Nombre del tablero</label>
      <input type="text" name="boardName" id="boardName" v-model="boardName" />
    </div>

    <div class="input-group">
      <div class="input-group--controls">
        <label for="category">Categoría</label>
        <i class="nf nf-fa-square_plus" @click="toggleInput()"></i>
      </div>
      <input
        type="text"
        v-model="newCategoryName"
        @keyup.enter.prevent="addNewOption(newCategoryName)"
        v-if="showInput"
        autocapitalize="true"
        autofocus="true"
      />
      <select name="category" id="category" v-model="category">
        <option value="">Selecciona una categoría</option>
        <option v-for="opt in options" :value="opt" :key="opt">{{ opt }}</option>
      </select>
    </div>

    <div class="input-group">
      <label for="mainView">Vista principal</label>
      <select name="mainView" id="mainView" v-model="mainView">
        <option value="groups">Grupos</option>
        <option value="gantt">Gantt</option>
      </select>
    </div>

    <div class="input-group">
      <label for="isPersonal">Uso personal</label>
      <input type="checkbox" name="isPersonal" id="isPersonal" v-model="isPersonal" />
      <small
        >Por defecto un tablero personal solo es visible por ti. Esto puede cambiarse después</small
      >
    </div>

    <div class="form-controls">
      <button type="button" @click="handleSubmit()">Guardar</button>
    </div>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: var(--main-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark-color);
  text-transform: capitalize;
}

input[type='text'],
select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--ter-color);
  border-radius: 5px;
  font-size: 0.95rem;
  background-color: var(--sec-color);
  color: var(--dark-color);
  transition: all 0.3s ease;
}

input[type='text']:focus,
select:focus {
  outline: none;
  border-color: var(--contrast-color);
  background-color: var(--main-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
}

input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--contrast-color);
}

.input-group input[type='checkbox'] {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.input-group small {
  font-size: 0.8rem;
  color: #666;
  font-weight: 400;
  margin-top: 0.25rem;
}

.form-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.input-group--controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: var(--dark-color);
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button[type='submit'] {
  background-color: var(--contrast-color);
  color: var(--main-color);
}

button[type='submit']:hover {
  background-color: #1e6ed9;
  box-shadow: 0 4px 12px rgba(43, 130, 240, 0.3);
}

button[type='submit']:active {
  transform: scale(0.98);
}

button[type='button'] {
  background-color: var(--sec-color);
  color: var(--dark-color);
  border: 2px solid var(--ter-color);
}

button[type='button']:hover {
  background-color: var(--ter-color);
  border-color: #bbb;
}

button[type='button']:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  form {
    padding: 1.5rem;
    gap: 1.25rem;
    min-width: max-content;
  }

  .form-controls {
    flex-direction: column-reverse;
  }

  button {
    width: 100%;
  }
}
</style>
