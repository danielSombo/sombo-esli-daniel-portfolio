<script setup>
import { computed, ref, watch } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { content, imageHref, PROJECT_CATEGORIES, stageOf } from '../stores/content'

const stage = stageOf('projets')

// Filtres : seulement les catégories utilisées par au moins un projet publié
const published = computed(() => content.projects.filter((p) => p.published !== false))
const categories = computed(() =>
  PROJECT_CATEGORIES.filter((c) => published.value.some((p) => p.categories?.includes(c.value))),
)
const category = ref('')
const projects = computed(() =>
  category.value ? published.value.filter((p) => p.categories?.includes(category.value)) : published.value,
)
const selected = ref(0)
watch(category, () => (selected.value = 0))
const current = computed(() => projects.value[selected.value])

// Si des projets sont supprimés depuis le dashboard, on reste sur un index valide
watch(
  () => projects.value.length,
  (n) => {
    if (selected.value >= n) selected.value = Math.max(0, n - 1)
  },
)

const pad = (n) => String(n + 1).padStart(2, '0')
const isPlaceholder = (url) => !url || url.startsWith('[')
</script>

<template>
  <section :id="stage.id" class="mx-auto flex max-w-[1320px] scroll-mt-20 flex-col gap-12 px-4 py-24 sm:px-8 lg:px-12">
    <SectionTitle :code="stage.code" :title="stage.title" />

    <!-- Filtres par catégorie -->
    <div v-if="categories.length > 1" v-reveal role="group" aria-label="Filtrer les projets" class="-mt-4 flex flex-wrap gap-2.5">
      <button
        type="button"
        :aria-pressed="!category"
        class="flex min-h-11 cursor-pointer items-center border-[1.5px] border-ink px-4 font-mono text-[13px] font-semibold transition-colors"
        :class="!category ? 'bg-ink text-bone' : 'hover:bg-ink/5'"
        @click="category = ''"
      >
        TOUT
      </button>
      <button
        v-for="c in categories"
        :key="c.value"
        type="button"
        :aria-pressed="category === c.value"
        class="flex min-h-11 cursor-pointer items-center border-[1.5px] border-ink px-4 font-mono text-[13px] font-semibold uppercase transition-colors"
        :class="category === c.value ? 'bg-ink text-bone' : 'hover:bg-ink/5'"
        @click="category = c.value"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="flex flex-wrap items-stretch gap-6">
      <!-- Liste des projets -->
      <div v-reveal class="flex flex-[1_1_320px] flex-col border-t-[1.5px] border-ink">
        <button
          v-for="(p, i) in projects"
          :key="p.id || p.name"
          type="button"
          :aria-pressed="selected === i"
          class="group flex min-h-16 cursor-pointer items-center gap-4.5 border-b-[1.5px] border-ink px-4.5 py-4 text-left transition-all duration-300 hover:pl-7.5"
          :class="selected === i ? 'bg-ink text-bone' : 'bg-transparent text-ink hover:bg-ink/5'"
          @click="selected = i"
        >
          <span class="font-mono text-sm">{{ pad(i) }}</span>
          <span class="flex-1 text-[26px] font-extrabold tracking-tight">{{ p.name }}</span>
          <span class="font-mono text-[13px]">{{ p.kind }}</span>
        </button>
      </div>

      <!-- Fiche du projet sélectionné -->
      <div
        v-reveal="150"
        class="relative min-h-[520px] min-w-0 flex-[999_1_560px] overflow-hidden border-[1.5px] border-ink bg-ink text-bone"
      >
        <Transition name="panel" mode="out-in">
          <article v-if="current" :key="current.id || current.name" class="relative flex min-h-[520px] flex-col gap-5.5 p-[clamp(24px,3.5vw,44px)]">
            <div
              aria-hidden="true"
              class="pointer-events-none absolute -top-8 -right-2.5 text-[240px] leading-none font-extrabold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_rgba(236,232,223,0.18)]"
            >
              {{ pad(selected) }}
            </div>

            <div class="relative flex flex-wrap items-center gap-3 font-mono text-[13px] text-signal-light">
              <span>{{ current.kind }}</span>
              <span
                v-if="current.inProgress"
                class="flex items-center gap-2 border-[1.5px] border-signal-light px-2 py-0.5 font-semibold"
              >
                <span class="blink h-2 w-2 rounded-full bg-signal" aria-hidden="true"></span>
                EN COURS
              </span>
            </div>
            <!-- Capture de l'application : affichée en entier, sans recadrage, quelle que soit sa forme
                 (une capture très haute, de téléphone par exemple, est limitée en hauteur et centrée) -->
            <figure v-if="current.imageId" class="relative m-0 max-w-[620px] border-[1.5px] border-bone/40">
              <img
                :src="imageHref(current.imageId)"
                :alt="`Capture : ${current.name}`"
                loading="lazy"
                class="block h-auto max-h-[460px] w-full object-contain"
              />
            </figure>
            <h3 class="relative m-0 text-[clamp(44px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.04em]">
              {{ current.name }}
            </h3>
            <p class="relative m-0 max-w-[560px] text-[22px] leading-snug">{{ current.tagline }}</p>
            <p class="relative m-0 max-w-[600px] text-lg leading-relaxed text-muted">{{ current.learned }}</p>

            <div class="relative mt-auto flex flex-wrap gap-2">
              <span
                v-for="s in current.stack"
                :key="s"
                class="border border-bone/40 px-2.5 py-1.5 font-mono text-[13px]"
              >
                {{ s }}
              </span>
            </div>

            <div class="relative flex flex-wrap gap-3">
              <a
                v-if="current.demo"
                :href="isPlaceholder(current.demo) ? '#' : current.demo"
                target="_blank"
                rel="noopener"
                class="cta cta--light flex min-h-12 items-center bg-signal px-5 font-semibold text-on-signal no-underline"
              >
                Voir la démo
              </a>
              <!-- Pas de lien GitHub (projet confidentiel ou dépôt privé) : pas de bouton -->
              <a
                v-if="current.repo"
                :href="isPlaceholder(current.repo) ? '#' : current.repo"
                target="_blank"
                rel="noopener"
                class="flex min-h-12 items-center border-[1.5px] border-bone px-5 font-semibold text-bone no-underline transition-colors hover:bg-bone hover:text-ink"
              >
                Code sur GitHub
              </a>
            </div>
          </article>
        </Transition>
      </div>
    </div>
  </section>
</template>
