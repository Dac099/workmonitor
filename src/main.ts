import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { addIcons, OhVueIcon } from 'oh-vue-icons'
import {
  FaProjectDiagram,
  HiSolidDocumentReport,
  CoMagnifyingGlass,
  FaUser,
} from 'oh-vue-icons/icons'

import App from './App.vue'
import router from './router'

const app = createApp(App)

addIcons(FaProjectDiagram, HiSolidDocumentReport, CoMagnifyingGlass, FaUser)

app.use(createPinia())
app.component('v-icon', OhVueIcon)
app.use(router)

app.mount('#app')
