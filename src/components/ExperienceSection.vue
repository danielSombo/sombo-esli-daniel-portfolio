<script setup>
import { computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { content, experienceMonths, formatDuration, formatMonth, stageOf, totalExperience } from '../stores/content'

const stage = stageOf('experience')

// Le poste le plus récent en premier
const items = computed(() =>
  [...content.experiences]
    .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0) || String(b.start).localeCompare(String(a.start)))
    .map((e) => ({
      ...e,
      period: `${formatMonth(e.start)} — ${e.current ? "aujourd'hui" : formatMonth(e.end) || "aujourd'hui"}`,
      duration: formatDuration(experienceMonths(e)),
    })),
)
</script>

<template>
  <section :id="stage.id" class="mx-auto flex max-w-[1320px] scroll-mt-20 flex-col gap-12 px-4 py-24 sm:px-8 lg:px-12">
    <SectionTitle :code="stage.code" :title="stage.title" />

    <div v-if="totalExperience" v-reveal class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span class="text-[clamp(44px,6vw,80px)] leading-none font-extrabold tracking-[-0.04em] text-signal-mark">
        {{ totalExperience }}
      </span>
      <span class="font-mono text-sm">D'EXPÉRIENCE EN ENTREPRISE</span>
    </div>

    <ol class="m-0 flex list-none flex-col p-0">
      <li
        v-for="(e, i) in items"
        :key="e.id || e.company + e.start"
        v-reveal="i * 120"
        class="grid gap-x-10 gap-y-4 border-t-[1.5px] border-ink py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 font-mono text-[13px]">
            <span v-if="e.current" class="blink h-2 w-2 rounded-full bg-signal" aria-hidden="true"></span>
            <span :class="e.current ? 'font-semibold text-signal-dark' : ''">{{ e.current ? 'EN PRODUCTION' : 'TERMINÉ' }}</span>
          </div>
          <div class="font-mono text-sm">{{ e.period }}</div>
          <div class="font-mono text-[13px] text-[#4A4741]">{{ e.duration }}<span v-if="e.location"> · {{ e.location }}</span></div>
        </div>

        <div class="flex flex-col gap-3">
          <h3 class="m-0 text-[clamp(28px,3vw,40px)] leading-[1.05] font-extrabold tracking-[-0.03em]">{{ e.role }}</h3>
          <div class="text-xl font-semibold">{{ e.company }}</div>
          <p v-if="e.description" class="m-0 max-w-[680px] text-lg leading-relaxed">{{ e.description }}</p>
          <div v-if="e.stack?.length" class="flex flex-wrap gap-2 pt-1">
            <span v-for="s in e.stack" :key="s" class="border border-ink/40 px-2.5 py-1 font-mono text-[13px]">{{ s }}</span>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
