<script setup>
import SectionTitle from './SectionTitle.vue'
import { computed } from 'vue'
import { content , stageOf } from '../stores/content'

const stage = stageOf('stack')
const stackGroups = computed(() => content.stackGroups)
const solid = computed(() => content.settings.marquee.solid.join(' / ') + ' /')
const outline = computed(() => content.settings.marquee.outline.join(' / ') + ' /')
</script>

<template>
  <section :id="stage.id" class="flex scroll-mt-20 flex-col gap-10 bg-paper py-24">
    <div class="mx-auto w-full max-w-[1320px] px-4 sm:px-8 lg:px-12">
      <SectionTitle :code="stage.code" :title="stage.title" />
    </div>

    <!-- Bandeaux géants qui défilent en sens inverse -->
    <div
      aria-hidden="true"
      class="flex flex-col gap-1.5 overflow-hidden text-[clamp(48px,7vw,110px)] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap"
    >
      <div class="marquee">
        <span class="pr-[0.4em]">{{ solid }}</span><span class="pr-[0.4em]">{{ solid }}</span>
      </div>
      <div class="marquee marquee--reverse outline-text">
        <span class="pr-[0.4em]">{{ outline }}</span><span class="pr-[0.4em]">{{ outline }}</span>
      </div>
    </div>

    <div
      class="mx-auto grid w-full max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5 px-4 sm:px-8 lg:px-12"
    >
      <div v-for="(g, i) in stackGroups" :key="g.id || g.label" v-reveal="i * 100" class="flex flex-col gap-2.5">
        <div class="grow-bar h-1.5" :class="g.learning ? 'bg-signal' : 'bg-ink'" aria-hidden="true"></div>
        <div class="font-mono text-[13px]" :class="g.learning ? 'text-signal-dark' : ''">{{ g.label }}</div>
        <div class="text-xl leading-snug">{{ g.items }}</div>
      </div>
    </div>
  </section>
</template>
