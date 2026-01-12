<script setup lang="ts">
import NavBar from './core/components/NavBar.vue'
</script>

<!-- This is the root componente of the app. Here we define the main layout of the application -->
<template>
  <header>
    <NavBar />
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
:root {
  --main-color: #fffffe;
  --highlight-color: #3da9fc;
  --secondary-color: #ef4565;
  --dark-color: #094067;
  --light-dark-color: #5f6c7b;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--main-color);
  font-family: sans-serif;
}

header {
  height: 28px;
  width: 100vw;
}

main {
  height: calc(100vh - 28px);
  width: 100vw;
  padding: 1rem;
  overflow: auto;
}
</style>
