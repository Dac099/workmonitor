<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const openMenu = ref<string | null>(null)
const navbarRef = ref<HTMLElement | null>(null)

function toggle(menu: string) {
  openMenu.value = openMenu.value === menu ? null : menu
}

function closeAll() {
  openMenu.value = null
}

function onDocumentClick(e: MouseEvent) {
  if (!navbarRef.value) return
  const target = e.target as Node
  if (!navbarRef.value.contains(target)) closeAll()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <article class="navbar" ref="navbarRef">
    <h2>Workmonitor</h2>
    <nav>
      <ul class="navbar--list">
        <li>
          <div class="navbar--overlay">
            <button
              class="overlay--title"
              @click="toggle('projects')"
              :aria-expanded="openMenu === 'projects'"
            >
              Proyectos
            </button>
            <section v-if="openMenu === 'projects'" class="overlay--content">
              <button>Nuevo workspace</button>
              <ul>
                <li>Lista de Workspace</li>
              </ul>
            </section>
          </div>
        </li>

        <li>
          <div class="navbar--overlay">
            <button
              class="overlay--title"
              @click="toggle('reports')"
              :aria-expanded="openMenu === 'reports'"
            >
              Reportes
            </button>
            <section v-if="openMenu === 'reports'" class="overlay--content">
              <ul>
                <li>Lista de páginas</li>
              </ul>
            </section>
          </div>
        </li>

        <li>
          <div class="navbar--overlay">
            <button
              class="overlay--title"
              @click="toggle('notifications')"
              :aria-expanded="openMenu === 'notifications'"
            >
              Notificaciones
            </button>
            <section v-if="openMenu === 'notifications'" class="overlay--content">
              Aqui se muestran tu lista de notificaciones
            </section>
          </div>
        </li>

        <li>
          <div class="navbar--overlay">
            <button
              class="overlay--title"
              @click="toggle('account')"
              :aria-expanded="openMenu === 'account'"
            >
              Cuenta
            </button>
            <section v-if="openMenu === 'account'" class="overlay--content">
              <ul>
                <li>Ver perfil</li>
                <li>Cerrar sesión</li>
              </ul>
            </section>
          </div>
        </li>
      </ul>
    </nav>
  </article>
</template>

<style scoped>
ul {
  list-style: none;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  color: var(--dark-color);
}

.navbar--list {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar--overlay {
  cursor: default;
  position: relative;
  outline: none;
  user-select: none;
}

.navbar--overlay .overlay--content {
  position: absolute;
  box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.12);
  margin: 0.5rem 0;
  padding: 0.6rem 0.6rem;
  width: max-content;
  right: 0;
  border-radius: 0.4rem;
  background: white;
  z-index: 30;
}

.overlay--title {
  color: var(--dark-color);
  padding: 0.2rem 0.6rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.overlay--title[aria-expanded='true'] {
  background-color: var(--highlight-color);
  color: var(--main-color);
}
</style>
