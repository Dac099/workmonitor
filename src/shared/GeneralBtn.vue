<script setup lang="ts">
const props = defineProps<{
  title: string
  type: 'button' | 'submit'
  action: () => void
  severity?: 'primary' | 'contrast' | 'danger'
}>()
</script>

<template>
  <button :type="props.type" @click="props.action()" :class="props.severity">
    {{ props.title }}
  </button>
</template>

<style scoped>
button {
  text-align: center;
  width: max-content;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  cursor: pointer;
  border: none;
  outline: none;
}

button:active {
  transform: scale(0.98);
}

.primary {
  background-color: var(--highlight-color);
  color: var(--main-color);
}

.contrast {
  background-color: var(--light-dark-color);
  color: var(--main-color);
}

.danger {
  background-color: var(--secondary-color);
  color: var(--main-color);
}
</style>
