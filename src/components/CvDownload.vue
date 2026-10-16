<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { content, cvHref } from '../stores/content'

const cv = computed(() => content.settings.cv)

// idle → loading (barre de transfert) → done
const status = ref('idle')
let timer

function onDownload() {
  // Le téléchargement est lancé par le navigateur (attribut download),
  // on joue juste l'animation de « transfert » en parallèle.
  clearTimeout(timer)
  status.value = 'loading'
  timer = setTimeout(() => (status.value = 'done'), 1350)
}

onBeforeUnmount(() => clearTimeout(timer))

const labels = {
  idle: 'Télécharger le CV',
  loading: 'Transfert…',
  done: 'CV téléchargé',
}
</script>

<template>
  <div
    id="cv"
    v-reveal
    class="relative flex scroll-mt-24 flex-wrap items-center gap-x-10 gap-y-7 overflow-hidden border-[1.5px] border-bone/35 p-[clamp(24px,3vw,40px)]"
  >
    <!-- Le document qui flotte -->
    <div aria-hidden="true" class="doc-float relative h-[124px] w-24 flex-none bg-bone shadow-[8px_8px_0_var(--color-signal)]">
      <div class="absolute top-0 right-0 h-[26px] w-[26px] bg-ink [clip-path:polygon(0_0,100%_100%,0_100%)]"></div>
      <div class="absolute top-5 left-3.5 h-1.5 w-11 bg-ink"></div>
      <div class="absolute top-10 left-3.5 h-1 w-[66px] bg-[#9A958C]"></div>
      <div class="absolute top-[52px] left-3.5 h-1 w-[58px] bg-[#9A958C]"></div>
      <div class="absolute top-16 left-3.5 h-1 w-[66px] bg-[#9A958C]"></div>
      <div class="absolute bottom-3.5 left-3.5 bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-bone">PDF</div>
    </div>

    <div class="flex flex-[1_1_320px] flex-col gap-2.5">
      <div class="font-mono text-[13px] text-signal-light">EXPORT · {{ cv.label }}</div>
      <h3 class="m-0 text-[clamp(30px,3.4vw,46px)] leading-none font-extrabold tracking-[-0.03em]">
        Tout le pipeline, sur une page.
      </h3>
      <p class="m-0 text-[17px] text-muted">
        Parcours, projets et compétences dans un PDF à garder ou à transmettre. · {{ cv.meta }}
      </p>
      <div aria-hidden="true" class="relative mt-1.5 h-1.5 overflow-hidden bg-bone/12">
        <div
          class="stream absolute inset-y-0 left-0 transition-[width] duration-[1300ms] ease-[cubic-bezier(.65,0,.35,1)]"
          :style="{ width: status === 'idle' ? '0%' : '100%' }"
        ></div>
      </div>
    </div>

    <a
      :href="cvHref()"
      :download="cv.downloadName"
      class="cta cta--light flex min-h-[60px] flex-none items-center gap-3 bg-signal px-7 text-xl font-bold text-on-signal no-underline"
      @click="onDownload"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12" /><path d="m6 11 6 6 6-6" /><path d="M4 21h16" />
      </svg>
      <span aria-live="polite">{{ labels[status] }}</span>
    </a>
  </div>
</template>
