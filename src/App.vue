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
@import 'https://www.nerdfonts.com/assets/css/webfont.css';

@font-face {
  font-family: 'Fira Code';
  src: url('/fonts/FiraCodeNerdFont-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('/fonts/FiraCodeNerdFont-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Fira Code';
  src: url('/fonts/FiraCodeNerdFont-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

:root {
  --main-color: #fffffe;
  --highlight-color: #3da9fc;
  --secondary-color: #ef4565;
  --dark-color: #094067;
  --light-dark-color: #5f6c7b;
  --shadow-color: rgba(0, 0, 0, 0.3);
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira Code', monospace, sans-serif;
}

body {
  background-color: var(--main-color);
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
