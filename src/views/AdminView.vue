<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CollectionEditor from '../admin/CollectionEditor.vue'
import AppearanceEditor from '../admin/AppearanceEditor.vue'
import ProfileEditor from '../admin/ProfileEditor.vue'
import CvEditor from '../admin/CvEditor.vue'
import DashboardHome from '../admin/DashboardHome.vue'
import MessagesInbox from '../admin/MessagesInbox.vue'
import { collections, navItems } from '../admin/schemas'
import { logout } from '../admin/api'
import { dashboardState, loadDashboard, loadSettings, notify, settingsState, toasts } from '../admin/store'

const route = useRoute()
const router = useRouter()

const section = computed(() => route.params.section || 'tableau')
const COLLECTION_OF = {
  certifications: 'certifications',
  experience: 'experiences',
  projets: 'projets',
  parcours: 'parcours',
  moments: 'moments',
  stack: 'stack',
}
const collection = computed(() => collections[COLLECTION_OF[section.value]])

// État « visible / masquée » de chaque section, affiché dans le menu
const SECTION_KEY = {
  certifications: 'certifs',
  experience: 'experience',
  projets: 'projets',
  parcours: 'parcours',
  moments: 'moments',
  stack: 'stack',
}
const hidden = (id) => SECTION_KEY[id] && settingsState.data?.sections?.[SECTION_KEY[id]] === false

onMounted(() => {
  loadSettings().catch((e) => notify(e.message, 'error'))
  // Pour la pastille « messages non lus » du menu
  if (section.value !== 'tableau') loadDashboard().catch(() => {})
})

function signOut() {
  logout()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-bone text-ink">
    <!-- Barre du haut -->
    <header class="sticky top-0 z-40 border-b-[1.5px] border-ink bg-bone">
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div class="font-mono text-sm font-semibold">daniel<span class="text-signal-dark">/</span>admin</div>
        <div class="flex items-center gap-2 font-mono text-sm">
          <RouterLink
            to="/"
            target="_blank"
            class="flex min-h-11 items-center border-[1.5px] border-ink px-3.5 font-semibold no-underline transition-colors hover:bg-ink hover:text-bone"
          >
            Voir le site ↗
          </RouterLink>
          <button type="button" class="min-h-11 cursor-pointer px-3 font-semibold underline" @click="signOut">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="flex flex-wrap">
      <!-- Menu -->
      <nav
        aria-label="Sections du dashboard"
        class="w-full border-b-[1.5px] border-ink md:min-h-[calc(100vh-70px)] md:w-60 md:border-r-[1.5px] md:border-b-0"
      >
        <ul class="m-0 flex list-none gap-0 overflow-x-auto p-0 md:flex-col md:py-4">
          <li v-for="item in navItems" :key="item.id" class="flex-none">
            <RouterLink
              :to="`/admin/${item.id}`"
              class="flex min-h-12 items-center justify-between gap-3 px-4 font-semibold whitespace-nowrap no-underline transition-colors md:px-6"
              :class="section === item.id ? 'bg-ink text-bone' : 'hover:bg-ink/5'"
            >
              {{ item.label }}
              <span v-if="hidden(item.id)" class="font-mono text-[10px] font-semibold opacity-70">MASQUÉE</span>
              <span
                v-else-if="item.id === 'messages' && dashboardState.unread"
                class="min-w-6 bg-signal px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-on-signal"
              >
                {{ dashboardState.unread }}<span class="sr-only"> non lu{{ dashboardState.unread > 1 ? 's' : '' }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Contenu -->
      <main class="min-w-0 flex-[999_1_480px] px-4 py-8 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-[960px]">
          <DashboardHome v-if="section === 'tableau'" />
          <MessagesInbox v-else-if="section === 'messages'" />
          <CollectionEditor v-else-if="collection" :key="section" :config="collection" />
          <AppearanceEditor v-else-if="section === 'apparence'" />
          <ProfileEditor v-else-if="section === 'profil'" />
          <CvEditor v-else-if="section === 'cv'" />
        </div>
      </main>
    </div>

    <!-- Notifications -->
    <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2" aria-live="polite">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto max-w-[360px] border-[1.5px] border-ink px-4 py-3 font-semibold shadow-[4px_4px_0_var(--color-ink)]"
        :class="t.type === 'error' ? 'bg-ink text-bone' : 'bg-signal text-on-signal'"
        :role="t.type === 'error' ? 'alert' : 'status'"
      >
        {{ t.message }}
      </div>
    </div>
  </div>
</template>
