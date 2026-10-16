import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router'
import { reveal } from './directives/reveal'
import { content, loadContent } from './stores/content'
import { applyTheme } from './theme'
import './style.css'

// Les couleurs suivent les réglages du dashboard (ou de portfolio.js)
watch(() => ({ ...content.settings.theme }), applyTheme, { immediate: true, deep: true })

loadContent()

createApp(App).use(router).directive('reveal', reveal).mount('#app')
