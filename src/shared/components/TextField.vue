<script lang="ts" setup>
const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
}
</script>

<template>
  <input
    type="text"
    :value="value"
    @input="handleInput"
    class="text-field"
    placeholder="Ingresa texto..."
  />
</template>

<style scoped>
.text-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.text-field:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.text-field::placeholder {
  color: #5f6368;
}
</style>
