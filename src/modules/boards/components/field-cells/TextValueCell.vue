<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value?: Value
}

const props = defineProps<Props>()
const parsedValue = computed(() => (props.value ? JSON.parse(props.value.value) : null))
</script>

<template>
  <slot v-if="!value" />
  <span v-else class="cell-text">{{ parsedValue }}</span>
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
