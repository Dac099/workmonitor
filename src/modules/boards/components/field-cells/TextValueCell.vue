<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value: Value
}

const props = defineProps<Props>()
const parsedValue = computed(() => JSON.parse(props.value.value))
</script>

<template>
  <span class="cell-text">{{ parsedValue }}</span>
</template>

<style scoped>
.cell-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
