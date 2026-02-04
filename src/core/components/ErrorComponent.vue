<script lang="ts" setup>
interface Props {
  title: string
  details: string
  action: () => void
}

const props = defineProps<Props>()
</script>

<template>
  <div>
    <p class="error-title">{{ props.title }}</p>
    <p class="error-details">{{ props.details }}</p>
    <button class="error-action" type="button" @click="props.action">
      <i class="nf nf-fa-refresh"></i>
    </button>
  </div>
</template>

<style scoped>
.error-title {
  font-size: 15px;
  color: red;
  text-align: left;
  margin: 0 0 4px;
}

.error-details {
  font-size: 10px;
  color: #b5b5b5;
  text-align: left;
  margin: 0 0 12px;
}

.error-action {
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
  margin-right: 0;
  display: block;
}
</style>
