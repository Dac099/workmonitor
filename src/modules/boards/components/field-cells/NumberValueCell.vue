<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value?: Value
}

const props = defineProps<Props>()
const formatedValue = computed(() => (props.value ? JSON.parse(props.value.value) : null))
</script>

<template>
  <slot v-if="!value" />
  <span v-else class="cell-text">{{ formatedValue }}</span>
</template>

<style scoped>
.cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
