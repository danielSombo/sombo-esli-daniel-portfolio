<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { content, cvHref, visibleStages } from '../stores/content'

const profile = computed(() => content.settings.profile)
const cv = computed(() => content.settings.cv)

// Barre de progression = avancée du visiteur dans le pipeline
const progress = ref(0)
// Section actuellement visible (pour surligner le lien du menu)
const active = ref('')

let sectionObserver

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) active.value = e.target.id
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  observeSections()
})

// Les sections peuvent apparaître/disparaître selon les réglages du dashboard
async function observeSections() {
  if (!sectionObserver) return
  await nextTick()
  sectionObserver.disconnect()
  visibleStages.value.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) sectionObserver.observe(el)
  })
}
watch(() => visibleStages.value.map((s) => s.id).join(), observeSections)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  sectionObserver?.disconnect()
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-bone/90 backdrop-blur-md">
    <div
      class="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-4 font-mono text-sm sm:px-8 lg:px-12"
    >
      <a href="#top" class="font-semibold no-underline">
        {{ profile.handle }}<span class="text-signal-dark">/</span>portfolio
      </a>

      <nav aria-label="Sections" class="flex flex-wrap gap-x-6 gap-y-1">
        <a
          v-for="(s, i) in visibleStages"
          :key="s.id"
          :href="`#${s.id}`"
          class="flex min-h-8 items-center no-underline transition-colors hover:text-signal-dark"
          :class="active === s.id ? 'text-signal-dark' : ''"
        >
          {{ s.num }} {{ s.label }}
        </a>
      </nav>

      <div class="flex items-center gap-2.5">
        <div class="hidden items-center gap-2 rounded-full border-[1.5px] border-ink px-3.5 py-1.5 lg:flex">
          <span class="blink h-2 w-2 rounded-full bg-signal"></span>
          {{ profile.status }}
        </div>
        <a
          :href="cvHref()"
          :download="cv.downloadName"
          class="flex min-h-9 items-center gap-2 rounded-full bg-ink px-3.5 font-semibold text-bone no-underline transition-colors hover:bg-signal hover:text-on-signal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v12" /><path d="m6 11 6 6 6-6" /><path d="M4 21h16" />
          </svg>
          CV
        </a>
      </div>
    </div>

    <!-- Le « débit » du pipeline -->
    <div class="h-[3px] w-full bg-ink/10" aria-hidden="true">
      <div class="h-full bg-signal transition-[width] duration-150" :style="{ width: progress + '%' }"></div>
    </div>
  </header>
</template>
