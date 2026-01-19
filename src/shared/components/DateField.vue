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
  <input type="date" :value="value" @input="handleInput" class="date-field" />
</template>

<style scoped>
.date-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
  color: #202124;
}

.date-field:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

/* Style the calendar icon */
.date-field::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.date-field::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
