<script lang="ts" setup>
import { computed } from 'vue'
import type { Value } from '../../types/values'

interface Props {
  value: Value
}

const props = defineProps<Props>()
const formatedValue = computed(() => JSON.parse(props.value.value))
</script>

<template>
  <span class="cell-text">{{ formatedValue }}</span>
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
