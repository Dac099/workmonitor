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
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

:root {
  --main-color: #fffffe;
  --dark-color: #262d33;
  --sec-color: #f9f9f9;
  --ter-color: #ddd;
  --contrast-color: #2b82f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

body {
  background-color: var(--main-color);
}

header {
  height: 38px;
  width: 100vw;
}

main {
  height: calc(100vh - 38px);
  width: 100vw;
  padding: 10px;
  overflow: auto;
}
</style>
