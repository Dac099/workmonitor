<script lang="ts" setup>
interface Props {
  value?: string
}

const props = defineProps<Props>()
</script>

<template>
  <slot v-if="!value" />
  <span v-else class="cell-text">{{ props.value }}</span>
</template>

<style scoped>
.cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
