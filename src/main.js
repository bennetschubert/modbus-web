import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { applyPolyfills, defineCustomElements } from '@siemens/ix/loader'
import { defineCustomElements as ixIconsDefineCustomElements } from '@siemens/ix-icons/loader'

import '@siemens/ix/dist/siemens-ix/siemens-ix.css'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@siemens/ix-aggrid/dist/ix-aggrid/ix-aggrid.css'

import App from './App.vue'
;(async () => {
  await applyPolyfills()
  await ixIconsDefineCustomElements()
  defineCustomElements()
  const app = createApp(App)
  app.use(createPinia())
  app.mount('#app')
})()
