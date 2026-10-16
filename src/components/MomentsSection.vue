<script setup>
// Moments : photos de la vie professionnelle, reliées à une expérience (filtres + visionneuse)
import { computed, nextTick, ref } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { content, imageHref, momentsView, stageOf } from '../stores/content'

const stage = stageOf('moments')
const moments = computed(() => content.moments)

// Étiquettes d'expérience présentes (les filtres n'apparaissent que s'il y en a plusieurs)
const contexts = computed(() => [...new Set(moments.value.map((m) => m.context).filter(Boolean))])
const shown = computed(() =>
  momentsView.context ? moments.value.filter((m) => m.context === momentsView.context) : moments.value,
)

const pad = (n) => String(n).padStart(2, '0')
const meta = (m) => [m.place, m.date].filter(Boolean).join(' · ')
const countLabel = (m) =>
  m.photos?.length ? `${pad(m.photos.length)} PHOTO${m.photos.length > 1 ? 'S' : ''}` : "PHOTOS D'EXEMPLE"

// ─── Visionneuse ───
const dialog = ref(null)
const openMoment = ref(null)
const index = ref(0)
const current = computed(() => openMoment.value?.photos?.[index.value])

async function open(m, i = 0) {
  if (!m.photos?.length) return
  openMoment.value = m
  index.value = i
  await nextTick()
  dialog.value?.showModal()
}
function close() {
  dialog.value?.close()
}
function step(dir) {
  const n = openMoment.value?.photos?.length || 0
  if (n) index.value = (index.value + dir + n) % n
}
function onKey(e) {
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}
// Un clic sur le fond (hors de la visionneuse) la ferme
function onBackdrop(e) {
  if (e.target === dialog.value) close()
}
</script>

<template>
  <!-- Fond noir : les cartes claires ressortent comme des tirages photo -->
  <section :id="stage.id" class="scroll-mt-20 bg-ink text-bone">
   <div class="mx-auto flex max-w-[1320px] flex-col gap-10 px-4 py-24 sm:px-8 lg:px-12">
    <SectionTitle :code="stage.code" :title="stage.title" dark />

    <!-- Filtres par expérience -->
    <div v-if="contexts.length > 1" v-reveal role="group" aria-label="Filtrer les moments" class="flex flex-wrap gap-2.5">
      <button
        type="button"
        :aria-pressed="!momentsView.context"
        class="flex min-h-11 cursor-pointer items-center border-[1.5px] border-bone px-4 font-mono text-[13px] font-semibold transition-colors"
        :class="!momentsView.context ? 'bg-bone text-ink' : 'hover:bg-bone/10'"
        @click="momentsView.context = ''"
      >
        TOUT
      </button>
      <button
        v-for="c in contexts"
        :key="c"
        type="button"
        :aria-pressed="momentsView.context === c"
        class="flex min-h-11 cursor-pointer items-center border-[1.5px] border-bone px-4 font-mono text-[13px] font-semibold uppercase transition-colors"
        :class="momentsView.context === c ? 'bg-bone text-ink' : 'hover:bg-bone/10'"
        @click="momentsView.context = c"
      >
        {{ c }}
      </button>
    </div>
    <p v-else-if="momentsView.context" class="m-0 -mt-4 font-mono text-[13px] text-muted">
      FILTRE : {{ momentsView.context.toUpperCase() }} ·
      <button type="button" class="cursor-pointer font-semibold text-bone underline" @click="momentsView.context = ''">tout afficher</button>
    </p>

    <!-- Mosaïque -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-5">
      <article
        v-for="(m, i) in shown"
        :key="m.id || m.title"
        v-reveal="i * 120"
        class="flex flex-col border-[1.5px] border-bone bg-bone text-ink"
      >
        <!-- Photo de couverture, ou photo d'exemple tant que les vraies ne sont pas ajoutées -->
        <button
          v-if="m.photos?.length"
          type="button"
          class="group relative block aspect-[4/3] cursor-zoom-in overflow-hidden border-b-[1.5px] border-ink bg-ink p-0"
          :aria-label="`Voir les photos : ${m.title}`"
          @click="open(m)"
        >
          <img
            :src="imageHref(m.photos[0].id)"
            :alt="m.photos[0].caption || m.title"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span class="absolute right-3 bottom-3 bg-signal px-2 py-1 font-mono text-[11px] font-semibold text-on-signal">
            {{ countLabel(m) }}
          </span>
        </button>
        <div
          v-else
          class="relative flex aspect-[4/3] items-center justify-center border-b-[1.5px] border-ink bg-[#2b2a27]"
          role="img"
          :aria-label="`Photo d'exemple : ${m.title}`"
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-bone/40" aria-hidden="true">
            <path d="M3.5 8.5h3.2l1.8-2.7h7l1.8 2.7h3.2v10H3.5z" /><circle cx="12" cy="13.2" r="3.4" />
          </svg>
          <span class="absolute bottom-3 left-3 bg-signal px-2 py-1 font-mono text-[11px] font-semibold text-on-signal">
            PHOTO D'EXEMPLE
          </span>
        </div>

        <div class="flex flex-1 flex-col gap-2 p-5">
          <div v-if="m.context" class="font-mono text-[13px] font-semibold text-signal-dark uppercase">{{ m.context }}</div>
          <h3 class="m-0 text-2xl leading-tight font-extrabold tracking-tight">{{ m.title }}</h3>
          <p v-if="m.description" class="m-0 text-base leading-normal">{{ m.description }}</p>
          <div v-if="meta(m)" class="mt-auto pt-2 font-mono text-[13px] text-[#4A4741]">{{ meta(m) }}</div>
        </div>
      </article>
    </div>

    <!-- Visionneuse -->
    <dialog
      ref="dialog"
      class="m-auto max-h-[100dvh] w-[min(1100px,100vw)] max-w-none border-[1.5px] border-bone bg-ink p-0 text-bone backdrop:bg-ink/85"
      :aria-label="openMoment ? `Photos : ${openMoment.title}` : 'Photos'"
      @click="onBackdrop"
      @keydown="onKey"
      @close="openMoment = null"
    >
      <div v-if="openMoment && current" class="flex flex-col">
        <div class="flex items-center justify-between gap-4 border-b border-bone/20 px-4 py-3 font-mono text-[13px]">
          <span class="min-w-0 truncate">{{ openMoment.title }}</span>
          <span class="flex flex-none items-center gap-3">
            <span>{{ pad(index + 1) }} / {{ pad(openMoment.photos.length) }}</span>
            <button
              type="button"
              class="flex h-11 w-11 cursor-pointer items-center justify-center border-[1.5px] border-bone transition-colors hover:bg-bone hover:text-ink"
              aria-label="Fermer"
              @click="close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </span>
        </div>

        <div class="relative flex items-center justify-center bg-black">
          <img
            :key="current.id"
            :src="imageHref(current.id)"
            :alt="current.caption || openMoment.title"
            class="max-h-[72dvh] w-full object-contain"
          />
          <template v-if="openMoment.photos.length > 1">
            <button
              type="button"
              class="absolute top-1/2 left-3 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center bg-bone text-ink transition-colors hover:bg-signal hover:text-on-signal"
              aria-label="Photo précédente"
              @click="step(-1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <button
              type="button"
              class="absolute top-1/2 right-3 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center bg-bone text-ink transition-colors hover:bg-signal hover:text-on-signal"
              aria-label="Photo suivante"
              @click="step(1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </template>
        </div>

        <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3.5">
          <p class="m-0 text-lg">{{ current.caption || openMoment.title }}</p>
          <span class="font-mono text-[13px] text-muted">{{ [openMoment.context, meta(openMoment)].filter(Boolean).join(' · ') }}</span>
        </div>
      </div>
    </dialog>
   </div>
  </section>
</template>

<style scoped>
/* Fond sombre derrière la visionneuse */
dialog::backdrop {
  background: rgb(17 17 16 / 0.85);
}
</style>
