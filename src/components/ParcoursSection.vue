<script setup>
import SectionTitle from './SectionTitle.vue'
import { computed } from 'vue'
import { content , isShown, momentsView, stageOf } from '../stores/content'

const parcours = computed(() => content.parcours)

// « Voir les photos » : seulement si des moments portent l'étiquette de cette étape
const hasMoments = (tag) => tag && isShown('moments') && content.moments.some((m) => m.context === tag)
function showMoments(tag) {
  momentsView.context = tag
}

const stage = stageOf('parcours')
</script>

<template>
  <section :id="stage.id" class="scroll-mt-20 bg-sand">
   <div class="mx-auto flex max-w-[1320px] flex-col gap-12 px-4 py-24 sm:px-8 lg:px-12">
    <SectionTitle :code="stage.code" :title="stage.title" />

    <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-5">
      <article
        v-for="(p, i) in parcours"
        :key="p.id || p.source + p.title"
        v-reveal="i * 120"
        class="flex min-h-60 flex-col gap-3.5 p-7"
        :class="p.highlight ? 'bg-ink text-bone' : 'border-[1.5px] border-ink'"
      >
        <div class="font-mono text-[13px]" :class="p.highlight ? 'text-signal-light' : ''">{{ p.source }}</div>
        <h3 class="m-0 text-3xl leading-[1.05] font-extrabold tracking-tight">{{ p.title }}</h3>
        <p class="m-0 text-lg leading-normal">{{ p.text }}</p>
        <a
          v-if="hasMoments(p.moments)"
          href="#moments"
          class="mt-auto flex min-h-11 items-center gap-2 self-start font-mono text-sm font-semibold underline underline-offset-4"
          :class="p.highlight ? 'text-signal-light' : 'text-signal-dark'"
          @click="showMoments(p.moments)"
        >
          VOIR LES PHOTOS →
        </a>
      </article>
    </div>
   </div>
  </section>
</template>
