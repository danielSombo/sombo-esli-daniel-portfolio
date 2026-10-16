<script setup>
import { computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { content, safeUrl , stageOf } from '../stores/content'

const stage = stageOf('certifs')
const certifications = computed(() => content.certifications)

// Les certifications obtenues d'abord, puis les prévues
const sorted = computed(() => [
  ...certifications.value.filter((c) => c.status === 'obtenue'),
  ...certifications.value.filter((c) => c.status !== 'obtenue'),
])
const passed = computed(() => certifications.value.filter((c) => c.status === 'obtenue').length)
const queued = computed(() => certifications.value.length - passed.value)

// Titre adapté : « validé » s'il y en a au moins une, sinon « sera validé »
const title = computed(() => (passed.value > 0 ? 'Ce qui est validé' : 'Ce qui sera validé'))
</script>

<template>
  <section :id="stage.id" class="scroll-mt-20 bg-sand">
   <div class="mx-auto flex max-w-[1320px] flex-col gap-10 px-4 py-24 sm:px-8 lg:px-12">
    <SectionTitle :code="stage.code" :title="title" />

    <div v-reveal class="border-[1.5px] border-ink bg-[#F4F1EA]">
      <!-- Ligne de commande + compteur -->
      <div
        class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b-[1.5px] border-ink px-5 py-4 font-mono text-sm"
      >
        <div>
          $ pipeline validate --certifications<span
            class="blink ml-1.5 inline-block h-[15px] w-2 bg-ink align-[-2px]"
            aria-hidden="true"
          ></span>
        </div>
        <div class="flex gap-4.5">
          <!-- On n'affiche pas « 0 validée » : seulement ce qui existe -->
          <span v-if="passed" class="font-semibold text-signal-dark">
            {{ passed }} validée{{ passed > 1 ? 's' : '' }}
          </span>
          <span v-if="queued">{{ queued }} prévue{{ queued > 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Une ligne par certification, comme des tests qui passent -->
      <ul class="m-0 list-none p-0">
        <li
          v-for="(c, i) in sorted"
          :key="c.id || c.code + c.name"
          v-reveal="i * 120"
          class="flex flex-wrap items-center gap-x-6 gap-y-3.5 border-b border-ink/20 p-5 last:border-b-0"
        >
          <div
            v-if="c.status === 'obtenue'"
            class="flex w-[132px] flex-none items-center gap-2 bg-signal px-2.5 py-[7px] font-mono text-[13px] font-semibold text-on-signal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m5 12 5 5 9-10" />
            </svg>
            VALIDÉE
          </div>
          <div
            v-else
            class="flex w-[132px] flex-none items-center gap-2 border-[1.5px] border-dashed border-ink px-2.5 py-1.5 font-mono text-[13px] font-semibold"
          >
            <span
              class="spin h-3 w-3 rounded-full border-2 border-ink border-r-transparent"
              aria-hidden="true"
            ></span>
            PRÉVUE
          </div>

          <div class="flex flex-[1_1_280px] flex-col gap-0.5">
            <h3 class="m-0 text-2xl leading-tight font-extrabold tracking-tight">{{ c.name }}</h3>
            <div class="text-base text-[#4A4741]">{{ c.issuer }}</div>
          </div>

          <div class="min-w-[90px] flex-none font-mono text-sm font-semibold">{{ c.code }}</div>
          <div class="min-w-[150px] flex-none font-mono text-[13px] text-[#4A4741]">
            {{ c.status === 'obtenue' ? 'Obtenue' : 'Visée' }} : {{ c.date }}
          </div>

          <a
            v-if="c.status === 'obtenue' && c.verifyUrl"
            :href="safeUrl(c.verifyUrl)"
            target="_blank"
            rel="noopener"
            class="flex min-h-11 flex-none items-center border-[1.5px] border-ink px-3.5 text-[15px] font-semibold no-underline transition-colors hover:bg-ink hover:text-bone"
          >
            Vérifier
          </a>
        </li>
      </ul>
    </div>
   </div>
  </section>
</template>
