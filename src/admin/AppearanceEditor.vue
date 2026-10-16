<script setup>
// Couleurs du site : accent prédéfini ou personnalisé, fond, texte — avec aperçu en direct
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { notify, saveSettings, settingsState } from './store'
import { applyTheme, contrast, deriveAccent, isHex } from '../theme'
import { content } from '../stores/content'

const PRESETS = [
  { id: 'orange', label: 'Orange', hex: '#ff4f1a' },
  { id: 'cobalt', label: 'Cobalt', hex: '#2d4bff' },
  { id: 'emeraude', label: 'Émeraude', hex: '#00a86b' },
  { id: 'lime', label: 'Lime', hex: '#c8f031' },
  { id: 'violet', label: 'Violet', hex: '#6b3bff' },
]
const DEFAULT_BG = '#ece8df'
const DEFAULT_INK = '#111110'

const theme = ref({ accent: 'orange', customAccent: '#ff4f1a', background: '', ink: '' })
const saving = ref(false)

watch(
  () => settingsState.data?.theme,
  (t) => {
    if (t) theme.value = { ...theme.value, ...t }
  },
  { immediate: true },
)

// Aperçu en direct sur tout le dashboard pendant les réglages
watch(theme, (t) => applyTheme(t), { deep: true })

const bg = computed(() => (isHex(theme.value.background) ? theme.value.background : DEFAULT_BG))
const ink = computed(() => (isHex(theme.value.ink) ? theme.value.ink : DEFAULT_INK))
const accentHex = computed(() =>
  theme.value.accent === 'custom'
    ? theme.value.customAccent
    : PRESETS.find((p) => p.id === theme.value.accent)?.hex || '#ff4f1a',
)
const derived = computed(() => (isHex(accentHex.value) ? deriveAccent(accentHex.value, bg.value, ink.value) : null))
const textContrast = computed(() => contrast(ink.value, bg.value))

function pick(id) {
  theme.value.accent = id
}

async function save() {
  saving.value = true
  try {
    await saveSettings({ theme: theme.value })
    notify('Couleurs enregistrées')
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    saving.value = false
  }
}

function resetBase() {
  theme.value.background = ''
  theme.value.ink = ''
}

// En quittant la page sans enregistrer, on revient aux couleurs du site
onBeforeUnmount(() => applyTheme(content.settings.theme))
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="font-mono text-[13px]">APPARENCE</div>
      <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">Couleurs</h1>
      <p class="m-0 text-[#4A4741]">L'aperçu change en direct. Rien n'est publié tant que tu n'as pas cliqué sur Enregistrer.</p>
    </div>

    <!-- Accent -->
    <fieldset class="m-0 flex flex-col gap-4 border-[1.5px] border-ink p-5">
      <legend class="px-2 font-mono text-[13px] font-semibold">COULEUR D'ACCENT</legend>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="p in PRESETS"
          :key="p.id"
          type="button"
          :aria-pressed="theme.accent === p.id"
          class="flex min-h-12 cursor-pointer items-center gap-2.5 border-[1.5px] px-3.5 font-semibold"
          :class="theme.accent === p.id ? 'border-ink bg-ink text-bone' : 'border-ink/30'"
          @click="pick(p.id)"
        >
          <span class="h-6 w-6 border border-ink/30" :style="{ background: p.hex }" aria-hidden="true"></span>
          {{ p.label }}
        </button>
        <label
          class="flex min-h-12 cursor-pointer items-center gap-2.5 border-[1.5px] px-3.5 font-semibold"
          :class="theme.accent === 'custom' ? 'border-ink bg-ink text-bone' : 'border-ink/30'"
        >
          <input
            v-model="theme.customAccent"
            type="color"
            class="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Choisir une couleur personnalisée"
            @input="pick('custom')"
          />
          Personnalisée
        </label>
      </div>
      <p v-if="theme.accent === 'custom'" class="m-0 font-mono text-[13px]">
        {{ theme.customAccent }} · les variantes lisibles (texte, boutons) sont calculées automatiquement
      </p>
    </fieldset>

    <!-- Fond et texte -->
    <fieldset class="m-0 flex flex-col gap-4 border-[1.5px] border-ink p-5">
      <legend class="px-2 font-mono text-[13px] font-semibold">FOND ET TEXTE</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-3">
          <input :value="bg" type="color" class="h-11 w-14 cursor-pointer border-[1.5px] border-ink p-0.5" @input="theme.background = $event.target.value" />
          <span class="flex flex-col"><span class="font-semibold">Fond</span><span class="font-mono text-[13px]">{{ bg }}</span></span>
        </label>
        <label class="flex items-center gap-3">
          <input :value="ink" type="color" class="h-11 w-14 cursor-pointer border-[1.5px] border-ink p-0.5" @input="theme.ink = $event.target.value" />
          <span class="flex flex-col"><span class="font-semibold">Texte</span><span class="font-mono text-[13px]">{{ ink }}</span></span>
        </label>
        <button type="button" class="min-h-11 cursor-pointer self-center underline" @click="resetBase">Couleurs d'origine</button>
      </div>
      <p
        class="m-0 font-mono text-[13px]"
        :class="textContrast < 4.5 ? 'bg-ink px-3 py-2 text-bone' : ''"
        role="status"
      >
        Contraste texte / fond : {{ textContrast.toFixed(1) }}:1
        {{ textContrast >= 7 ? '· excellent' : textContrast >= 4.5 ? '· lisible' : '· trop faible, le texte sera difficile à lire' }}
      </p>
    </fieldset>

    <!-- Aperçu -->
    <div class="flex flex-col gap-2">
      <div class="font-mono text-[13px] font-semibold">APERÇU</div>
      <div class="grid gap-0 border-[1.5px] border-ink md:grid-cols-2">
        <div class="flex flex-col gap-4 bg-bone p-6 text-ink">
          <div class="font-mono text-[13px] font-semibold text-signal-dark">02 · TRANSFORM</div>
          <div class="text-4xl leading-[0.9] font-extrabold tracking-[-0.04em]">Du code à la donnée<span class="text-signal-mark">.</span></div>
          <span class="self-start border-2 border-ink bg-signal px-4 py-2.5 font-semibold text-on-signal">Voir les projets</span>
        </div>
        <div class="flex flex-col gap-4 bg-ink p-6 text-bone">
          <div class="font-mono text-[13px] text-signal-light">EXPORT · cv.pdf</div>
          <div class="text-3xl leading-none font-extrabold tracking-[-0.03em]">Écrivons la suite<span class="text-signal">.</span></div>
          <span class="self-start bg-signal px-4 py-2.5 font-semibold text-on-signal">Télécharger le CV</span>
        </div>
      </div>
      <p v-if="derived" class="m-0 font-mono text-[12px] text-[#4A4741]">
        Accent {{ derived.signal }} · texte accent {{ derived.dark }} · sur fond noir {{ derived.light }} · texte sur bouton {{ derived.on }}
      </p>
    </div>

    <div>
      <button
        type="button"
        :disabled="saving"
        class="cta flex min-h-12 cursor-pointer items-center border-2 border-ink bg-ink px-6 font-semibold text-bone disabled:cursor-wait disabled:opacity-60"
        @click="save"
      >
        {{ saving ? 'Enregistrement…' : 'Enregistrer les couleurs' }}
      </button>
    </div>
  </div>
</template>
