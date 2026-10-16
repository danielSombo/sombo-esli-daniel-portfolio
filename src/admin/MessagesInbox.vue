<script setup>
// Boîte de réception : messages envoyés depuis le formulaire de contact du site
import { computed, onMounted, ref } from 'vue'
import { api } from './api'
import { dashboardState, notify } from './store'

const messages = ref([])
const loading = ref(true)
const loadError = ref('')
const filter = ref('inbox') // inbox | unread | archived
const selectedId = ref(null)
const confirmDelete = ref(false)

onMounted(async () => {
  try {
    messages.value = await api.get('/api/messages')
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

const counts = computed(() => ({
  inbox: messages.value.filter((m) => !m.archived).length,
  unread: messages.value.filter((m) => !m.archived && !m.read).length,
  archived: messages.value.filter((m) => m.archived).length,
}))
const FILTERS = [
  { id: 'inbox', label: 'REÇUS' },
  { id: 'unread', label: 'NON LUS' },
  { id: 'archived', label: 'ARCHIVÉS' },
]
const list = computed(() =>
  messages.value.filter((m) =>
    filter.value === 'archived' ? m.archived : !m.archived && (filter.value === 'inbox' || !m.read),
  ),
)
const selected = computed(() => messages.value.find((m) => m.id === selectedId.value))

function syncUnread() {
  dashboardState.unread = counts.value.unread
}

async function update(msg, changes) {
  const updated = await api.put(`/api/messages/${msg.id}`, changes)
  messages.value = messages.value.map((m) => (m.id === updated.id ? updated : m))
  syncUnread()
  return updated
}

async function open(msg) {
  selectedId.value = msg.id
  confirmDelete.value = false
  if (!msg.read) {
    try {
      await update(msg, { read: true })
    } catch (e) {
      notify(e.message, 'error')
    }
  }
}

async function toggle(field) {
  try {
    const msg = selected.value
    const updated = await update(msg, { [field]: !msg[field] })
    if (field === 'archived') {
      notify(updated.archived ? 'Message archivé' : 'Message remis dans les reçus')
      selectedId.value = null
    } else {
      notify(updated.read ? 'Marqué comme lu' : 'Marqué comme non lu')
    }
  } catch (e) {
    notify(e.message, 'error')
  }
}

async function remove() {
  try {
    await api.del(`/api/messages/${selected.value.id}`)
    messages.value = messages.value.filter((m) => m.id !== selectedId.value)
    selectedId.value = null
    syncUnread()
    notify('Message supprimé')
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirmDelete.value = false
  }
}

// Répondre ouvre la messagerie avec l'adresse et l'objet déjà remplis
const replyHref = computed(() => {
  const m = selected.value
  if (!m) return '#'
  const subject = `Re: ${m.subject || 'votre message sur mon portfolio'}`
  return `mailto:${m.email}?subject=${encodeURIComponent(subject)}`
})

const formatDate = (d) =>
  new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const formatShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <div class="font-mono text-[13px]">{{ counts.unread }} NON LU{{ counts.unread > 1 ? 'S' : '' }}</div>
        <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">Messages</h1>
      </div>
      <div role="group" aria-label="Filtrer les messages" class="flex flex-wrap gap-2">
        <button
          v-for="f in FILTERS"
          :key="f.id"
          type="button"
          :aria-pressed="filter === f.id"
          class="flex min-h-11 cursor-pointer items-center gap-2 border-[1.5px] border-ink px-3.5 font-mono text-[13px] font-semibold transition-colors"
          :class="filter === f.id ? 'bg-ink text-bone' : 'hover:bg-ink/5'"
          @click="filter = f.id; selectedId = null"
        >
          {{ f.label }} <span class="opacity-70">{{ counts[f.id] }}</span>
        </button>
      </div>
    </div>

    <p v-if="loading" class="m-0 font-mono text-sm">Chargement…</p>
    <p v-else-if="loadError" role="alert" class="m-0 bg-ink px-3.5 py-2.5 font-mono text-sm text-bone">{{ loadError }}</p>
    <div v-else-if="!list.length" class="border-[1.5px] border-dashed border-ink p-8 text-lg">
      {{ filter === 'archived' ? 'Aucun message archivé.' : "Aucun message pour l'instant. Ils arrivent ici depuis le formulaire de contact du site." }}
    </div>

    <div v-else class="flex flex-wrap items-start gap-6">
      <!-- Liste -->
      <ul class="m-0 flex min-w-0 flex-[1_1_300px] list-none flex-col border-t-[1.5px] border-ink p-0">
        <li v-for="m in list" :key="m.id">
          <button
            type="button"
            class="flex w-full cursor-pointer items-start gap-3 border-b-[1.5px] border-ink px-3 py-3.5 text-left transition-colors"
            :class="selectedId === m.id ? 'bg-ink text-bone' : 'hover:bg-ink/5'"
            :aria-pressed="selectedId === m.id"
            @click="open(m)"
          >
            <span
              class="mt-2 h-2.5 w-2.5 flex-none rounded-full"
              :class="m.read ? 'border border-current' : 'bg-signal'"
              :aria-label="m.read ? 'Lu' : 'Non lu'"
            ></span>
            <span class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="flex items-baseline justify-between gap-3">
                <span class="truncate text-lg" :class="m.read ? 'font-semibold' : 'font-extrabold'">{{ m.name }}</span>
                <span class="flex-none font-mono text-[12px]">{{ formatShort(m.createdAt) }}</span>
              </span>
              <span class="truncate text-[15px] opacity-80">{{ m.subject || m.message }}</span>
            </span>
          </button>
        </li>
      </ul>

      <!-- Lecture -->
      <article v-if="selected" class="flex min-w-0 flex-[999_1_420px] flex-col gap-5 border-[1.5px] border-ink bg-[#F4F1EA] p-[clamp(18px,3vw,28px)]">
        <div class="flex flex-col gap-1">
          <div class="font-mono text-[13px]">{{ formatDate(selected.createdAt) }}</div>
          <h2 class="m-0 text-3xl leading-tight font-extrabold tracking-tight">{{ selected.subject || '(sans objet)' }}</h2>
          <div class="text-lg">
            <span class="font-semibold">{{ selected.name }}</span> ·
            <a :href="`mailto:${selected.email}`" class="underline">{{ selected.email }}</a>
          </div>
        </div>
        <p class="m-0 border-t-[1.5px] border-ink pt-5 text-lg leading-relaxed whitespace-pre-line">{{ selected.message }}</p>

        <div class="flex flex-wrap items-center gap-3 border-t-[1.5px] border-ink pt-5">
          <a
            :href="replyHref"
            class="cta flex min-h-12 items-center border-2 border-ink bg-signal px-5 font-semibold text-on-signal no-underline"
          >
            Répondre par e-mail
          </a>
          <button
            type="button"
            class="min-h-11 cursor-pointer border-[1.5px] border-ink px-4 font-semibold transition-colors hover:bg-ink hover:text-bone"
            @click="toggle('archived')"
          >
            {{ selected.archived ? 'Désarchiver' : 'Archiver' }}
          </button>
          <button type="button" class="min-h-11 cursor-pointer px-2 font-semibold underline" @click="toggle('read')">
            {{ selected.read ? 'Marquer non lu' : 'Marquer lu' }}
          </button>
          <span v-if="confirmDelete" class="flex items-center gap-2">
            <span class="font-mono text-[13px] font-semibold">Supprimer ?</span>
            <button type="button" class="min-h-11 cursor-pointer bg-ink px-4 font-semibold text-bone" @click="remove">Oui, supprimer</button>
            <button type="button" class="min-h-11 cursor-pointer px-2 underline" @click="confirmDelete = false">Non</button>
          </span>
          <button
            v-else
            type="button"
            class="min-h-11 cursor-pointer px-2 font-semibold text-signal-dark underline"
            @click="confirmDelete = true"
          >
            Supprimer
          </button>
        </div>
      </article>
      <p v-else class="m-0 flex-[999_1_420px] font-mono text-sm">Choisis un message pour le lire.</p>
    </div>
  </div>
</template>
