<script setup>
// Tableau de bord : ce qui est en ligne, ce qui reste à compléter, les derniers messages
import { computed, onMounted, ref } from 'vue'
import { dashboardState, loadDashboard } from './store'

const loading = ref(true)
const error = ref('')
const data = computed(() => dashboardState.data)

onMounted(async () => {
  try {
    await loadDashboard()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const pad = (n) => String(n).padStart(2, '0')
const visibleCount = computed(() => data.value?.sections.filter((s) => s.visible).length ?? 0)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="font-mono text-[13px]">$ pipeline status</div>
      <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">Tableau de bord</h1>
    </div>

    <p v-if="loading" class="m-0 font-mono text-sm">Chargement…</p>
    <p v-else-if="error" role="alert" class="m-0 bg-ink px-3.5 py-2.5 font-mono text-sm text-bone">{{ error }}</p>

    <template v-else-if="data">
      <!-- Chiffres clés -->
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] border-t-[1.5px] border-l-[1.5px] border-ink">
        <RouterLink
          to="/admin/messages"
          class="flex flex-col gap-2 border-r-[1.5px] border-b-[1.5px] border-ink p-5 no-underline transition-colors hover:bg-ink/5"
          :class="data.messages.unread ? 'bg-signal text-on-signal hover:bg-signal' : ''"
        >
          <span class="font-mono text-[13px] font-semibold">MESSAGES NON LUS</span>
          <span class="text-[56px] leading-none font-extrabold tracking-[-0.04em]">{{ pad(data.messages.unread) }}</span>
        </RouterLink>
        <RouterLink to="/admin/projets" class="flex flex-col gap-2 border-r-[1.5px] border-b-[1.5px] border-ink p-5 no-underline transition-colors hover:bg-ink/5">
          <span class="font-mono text-[13px] font-semibold">PROJETS PUBLIÉS</span>
          <span class="text-[56px] leading-none font-extrabold tracking-[-0.04em]">{{ pad(data.projects.published) }}</span>
          <span class="font-mono text-[13px] text-[#4A4741]">{{ data.projects.drafts }} brouillon{{ data.projects.drafts > 1 ? 's' : '' }}</span>
        </RouterLink>
        <RouterLink to="/admin/moments" class="flex flex-col gap-2 border-r-[1.5px] border-b-[1.5px] border-ink p-5 no-underline transition-colors hover:bg-ink/5">
          <span class="font-mono text-[13px] font-semibold">MOMENTS</span>
          <span class="text-[56px] leading-none font-extrabold tracking-[-0.04em]">{{ pad(data.moments.total) }}</span>
          <span v-if="data.moments.withoutPhotos" class="font-mono text-[13px] text-signal-dark">
            {{ data.moments.withoutPhotos }} avec photos d'exemple
          </span>
        </RouterLink>
        <div class="flex flex-col gap-2 border-r-[1.5px] border-b-[1.5px] border-ink p-5">
          <span class="font-mono text-[13px] font-semibold">SECTIONS EN LIGNE</span>
          <span class="text-[56px] leading-none font-extrabold tracking-[-0.04em]">
            {{ pad(visibleCount) }}<span class="text-2xl text-[#4A4741]"> / {{ pad(data.sections.length) }}</span>
          </span>
          <span class="font-mono text-[13px] text-[#4A4741]">+ accueil et contact</span>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- À compléter -->
        <section class="flex flex-col border-[1.5px] border-ink">
          <h2 class="m-0 border-b-[1.5px] border-ink px-5 py-4 text-2xl font-extrabold tracking-tight">À compléter</h2>
          <ul v-if="data.todo.length" class="m-0 list-none p-0">
            <li v-for="t in data.todo" :key="t.label" class="border-b border-ink/20 last:border-b-0">
              <RouterLink
                :to="`/admin/${t.route}`"
                class="flex min-h-14 items-center justify-between gap-4 px-5 font-semibold no-underline transition-colors hover:bg-ink/5"
              >
                <span class="flex items-center gap-3">
                  <span class="h-4 w-4 flex-none border-[1.5px] border-ink" aria-hidden="true"></span>
                  {{ t.label }}
                </span>
                <span aria-hidden="true">→</span>
              </RouterLink>
            </li>
          </ul>
          <p v-else class="m-0 p-5">Tout est complet.</p>
        </section>

        <!-- État des sections -->
        <section class="flex flex-col border-[1.5px] border-ink">
          <h2 class="m-0 border-b-[1.5px] border-ink px-5 py-4 text-2xl font-extrabold tracking-tight">Sections du site</h2>
          <ul class="m-0 list-none p-0">
            <li v-for="s in data.sections" :key="s.id" class="border-b border-ink/20 last:border-b-0">
              <RouterLink
                :to="`/admin/${s.route}`"
                class="flex min-h-14 items-center justify-between gap-4 px-5 font-semibold no-underline transition-colors hover:bg-ink/5"
              >
                {{ s.label }}
                <span
                  class="px-2 py-0.5 font-mono text-[11px] font-semibold"
                  :class="s.visible ? 'bg-ink text-bone' : 'border border-ink'"
                >
                  {{ s.visible ? 'VISIBLE' : !s.enabled ? 'MASQUÉE' : 'VIDE · MASQUÉE' }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>

      <!-- Derniers messages -->
      <section class="flex flex-col border-[1.5px] border-ink">
        <div class="flex items-center justify-between gap-4 border-b-[1.5px] border-ink px-5 py-4">
          <h2 class="m-0 text-2xl font-extrabold tracking-tight">Derniers messages</h2>
          <RouterLink to="/admin/messages" class="font-mono text-sm font-semibold underline">TOUT VOIR</RouterLink>
        </div>
        <ul v-if="data.messages.last.length" class="m-0 list-none p-0">
          <li v-for="m in data.messages.last" :key="m.id" class="border-b border-ink/20 last:border-b-0">
            <RouterLink
              to="/admin/messages"
              class="flex min-h-16 items-center gap-4 px-5 py-3 no-underline transition-colors hover:bg-ink/5"
            >
              <span class="h-2.5 w-2.5 flex-none rounded-full" :class="m.read ? 'border border-ink' : 'bg-signal'" :aria-label="m.read ? 'Lu' : 'Non lu'"></span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="font-extrabold">{{ m.name }}</span>
                <span class="truncate text-[15px] text-[#4A4741]">{{ m.subject || m.message }}</span>
              </span>
              <span class="flex-none font-mono text-[13px]">{{ formatDate(m.createdAt) }}</span>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="m-0 p-5">Aucun message pour l'instant. Ils arrivent ici depuis le formulaire de contact du site.</p>
      </section>
    </template>
  </div>
</template>
