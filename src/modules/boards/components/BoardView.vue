<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <h1>Board {{ route.params.boardId }}</h1>
</template>
