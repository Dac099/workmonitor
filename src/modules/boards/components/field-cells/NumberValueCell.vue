<script lang="ts" setup>
interface Props {
  value: string
}

const props = defineProps<Props>()
</script>

<template>
  <span class="cell-text">{{ props.value }}</span>
</template>

<style scoped>
.cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
