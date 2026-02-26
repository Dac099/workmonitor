<script setup lang="ts">
import { ref } from 'vue'
import GeneralSearch from './GeneralSearch.vue'
import SearchResults from './SearchResults.vue'
import type { SearcherResponse } from '../types/searcher'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarOpen = ref(false)
const isSearchResultsOpen = ref(false)
const searchResults = ref<SearcherResponse | null>(null)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleSearch = (results: SearcherResponse) => {
  searchResults.value = results
  isSearchResultsOpen.value = true
}

const handleSearchClose = () => {
  isSearchResultsOpen.value = false
}

const handleGroupSelect = (boardId: string, groupId: string) => {
  router.push({
    path: `/projects/boards/${boardId}`,
    query: groupId ? { groupId } : {},
    replace: true,
  })

  setTimeout(() => {
    isSearchResultsOpen.value = false
  }, 100)
}

const handleItemSelect = (boardId: string, groupId: string, itemId: string) => {
  const query: Record<string, string> = {}
  if (groupId) query.groupId = groupId
  if (itemId) query.searchItemId = itemId

  router.push({
    path: `/projects/boards/${boardId}`,
    query: Object.keys(query).length > 0 ? query : {},
    replace: true,
  })

  setTimeout(() => {
    isSearchResultsOpen.value = false
  }, 100)
}
</script>

<template>
  <article class="navbar">
    <div class="navHeader">
      <RouterLink to="/" class="navTitle">Workmonitor</RouterLink>
      <!-- General Search Component -->
      <GeneralSearch @search="handleSearch" />
    </div>

    <!-- Botón hamburguesa para móvil -->
    <button class="hamburger" @click="toggleSidebar" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Navegación desktop -->
    <section class="navList navList--desktop">
      <RouterLink class="navListItem" to="/projects"> Tableros </RouterLink>
      <RouterLink class="navListItem" to="/reports"> Reportes </RouterLink>
      <RouterLink class="navListItem" to="/tracking"> Seguimiento </RouterLink>
      <RouterLink class="navListItem" to="/account"> Cuenta </RouterLink>
    </section>

    <!-- Overlay -->
    <div v-if="isSidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar  -->
    <aside class="sidebar" :class="{ 'sidebar--open': isSidebarOpen }">
      <nav class="sidebar__nav">
        <RouterLink class="sidebar__item" to="/projects" @click="closeSidebar">
          Tableros
        </RouterLink>
        <RouterLink class="sidebar__item" to="/reports" @click="closeSidebar">
          Reportes
        </RouterLink>
        <RouterLink class="sidebar__item" to="/tracking" @click="closeSidebar">
          Seguimiento
        </RouterLink>
        <RouterLink class="sidebar__item" to="/account" @click="closeSidebar"> Cuenta </RouterLink>
      </nav>
    </aside>

    <!-- Search Results Sidebar -->
    <SearchResults
      :is-open="isSearchResultsOpen"
      :results="searchResults"
      @close="handleSearchClose"
      @group-select="handleGroupSelect"
      @item-select="handleItemSelect"
    />
  </article>
  <hr />
</template>

<style scoped>
a {
  text-decoration: none;
  color: var(--light-dark-color);
}

.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.2rem 1rem;
}

.navHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navTitle {
  font-size: 1.3rem;
  color: var(--dark-color);
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}

.navList {
  display: flex;
  gap: 5px;
  flex-grow: 1;
  justify-content: flex-end;
}

.navListItem {
  padding: 0.3rem 1rem;
  border-radius: 3px;
  transition: all 0.5s ease;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.navListItem:hover {
  background-color: var(--dark-color);
  color: white;
}

.navListItem.router-link-active {
  background-color: var(--dark-color);
  color: white;
}

/* Botón hamburguesa */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
  flex-shrink: 0;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: var(--dark-color);
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 280px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  padding: 2rem 0;
}

.sidebar--open {
  right: 0;
}

.sidebar__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--dark-color);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.sidebar__close:hover {
  background-color: var(--dark-color);
  color: white;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 3rem;
  padding: 0 1rem;
}

.sidebar__item {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.sidebar__item:hover {
  background-color: var(--dark-color);
  color: white;
  transform: translateX(5px);
}

.sidebar__item.router-link-active {
  background-color: var(--dark-color);
  color: white;
  font-weight: 600;
}

/* Overlay */
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Media queries para móvil */
@media (max-width: 768px) {
  .navList--desktop {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .overlay {
    display: block;
  }

  .navbar {
    gap: 0.5rem;
    padding: 0.2rem 0.5rem;
  }
}
</style>
