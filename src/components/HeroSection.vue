<script setup>
import { computed } from 'vue'
import { content, isShown, photoHref, totalExperience, visibleStages } from '../stores/content'

const profile = computed(() => content.settings.profile)
const photo = computed(() => photoHref())
// Badge « X ans d'expérience » : seulement si la section Expérience est activée et remplie
const showExperience = computed(
  () => isShown('experience') && Boolean(totalExperience.value),
)

const lines = [
  { text: 'Du code', end: '' },
  { text: 'à la donnée', end: ',' },
  { text: 'du local', end: '' },
  { text: 'au cloud', end: '.' },
]
</script>

<template>
  <section id="top" class="mx-auto flex max-w-[1320px] flex-col gap-12 px-4 pt-12 pb-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
    <div class="fadeup flex flex-col gap-3">
      <div class="font-mono text-sm tracking-wide">{{ profile.tagline }}</div>
      <div v-if="profile.jobTitle || showExperience" class="flex flex-wrap gap-2 font-mono text-sm">
        <span v-if="profile.jobTitle" class="bg-ink px-3 py-1.5 font-semibold text-bone">{{ profile.jobTitle }}</span>
        <a
          v-if="showExperience"
          href="#experience"
          class="border-[1.5px] border-ink px-3 py-1 font-semibold no-underline transition-colors hover:bg-signal hover:text-on-signal"
        >
          {{ totalExperience }} d'expérience
        </a>
      </div>
    </div>

    <h1 class="m-0 text-[clamp(52px,9.4vw,150px)] leading-[0.88] font-extrabold tracking-[-0.045em]">
      <span v-for="(l, i) in lines" :key="l.text" class="mask">
        <span class="rise" :style="{ animationDelay: `${0.05 + i * 0.12}s` }">
          {{ l.text }}<span v-if="l.end" class="text-signal-mark">{{ l.end }}</span>
        </span>
      </span>
    </h1>

    <div class="fadeup flex flex-wrap items-end justify-between gap-8" style="animation-delay: 0.6s">
      <div class="flex flex-wrap items-end gap-6">
        <img
          v-if="photo"
          :src="photo"
          :alt="`Photo de ${profile.name}`"
          width="148"
          height="148"
          class="size-37 flex-none border-2 border-ink object-cover shadow-[6px_6px_0_var(--color-signal)]"
        />
        <p class="m-0 max-w-[560px] flex-[1_1_300px] text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-pretty">
          {{ profile.intro }}
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <a
          href="#projets"
          class="cta flex min-h-[52px] items-center border-2 border-ink bg-signal px-6 text-lg font-semibold text-on-signal no-underline"
        >
          Voir les projets
        </a>
        <a
          href="#cv"
          class="cta flex min-h-[52px] items-center gap-2.5 border-2 border-ink px-6 text-lg font-semibold text-ink no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v12" /><path d="m6 11 6 6 6-6" /><path d="M4 21h16" />
          </svg>
          Mon CV
        </a>
      </div>
    </div>

    <!-- Le pipeline : des paquets de données qui circulent -->
    <div class="fadeup flex flex-col gap-3.5" style="animation-delay: 0.8s">
      <div class="relative h-3" aria-hidden="true">
        <div class="absolute inset-x-0 top-[5px] h-0.5 bg-ink"></div>
        <div v-for="n in 4" :key="n" class="packet" :style="{ animationDelay: `${(n - 1) * 0.9}s` }"></div>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3 font-mono text-sm">
        <a
          v-for="(s, i) in visibleStages"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex min-h-11 items-center justify-between border-[1.5px] border-ink px-4 py-3.5 no-underline transition-colors"
          :class="i === visibleStages.length - 1 ? 'bg-ink text-bone hover:bg-signal hover:text-on-signal' : 'hover:bg-ink hover:text-bone'"
        >
          <span>{{ s.code }}</span>
          <span>{{ s.label }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
