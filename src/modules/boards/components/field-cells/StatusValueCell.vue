<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value: Value
}

type StatusTag = {
  color: string
  text: string
}

const props = defineProps<Props>()
const statusProperties = computed<StatusTag>(() => JSON.parse(props.value.value))
</script>

<template>
  <span class="cell-text" :style="{ backgroundColor: statusProperties.color }">
    {{ statusProperties.text }}
  </span>
</template>

<style scoped>
.cell-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  height: 100%;
}
</style>
