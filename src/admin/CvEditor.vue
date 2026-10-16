<script setup>
// Remplacement du CV PDF + textes du bloc de téléchargement
import { onMounted, ref, watch } from 'vue'
import FieldInput from './FieldInput.vue'
import { api } from './api'
import { notify, refreshSite, saveSettings, settingsState } from './store'
import { apiUrl } from '../stores/content'

const info = ref(null) // { available, size, updatedAt, originalName }
const uploading = ref(false)
const fileInput = ref(null)
const texts = ref(null)
const savingTexts = ref(false)
const confirmDelete = ref(false)

const fields = [
  { key: 'label', label: 'Nom affiché', type: 'text', placeholder: 'cv_daniel.pdf' },
  { key: 'downloadName', label: 'Nom du fichier téléchargé', type: 'text', placeholder: 'CV-Daniel.pdf' },
  { key: 'meta', label: 'Détails affichés', type: 'text', placeholder: 'PDF · 1 page · mis à jour en novembre 2026' },
]

async function loadInfo() {
  const data = await api.get('/api/content')
  info.value = data.cv
}
onMounted(() => loadInfo().catch((e) => notify(e.message, 'error')))

watch(
  () => settingsState.data?.cv,
  (cv) => {
    if (cv) texts.value = { ...cv }
  },
  { immediate: true },
)

async function upload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    notify('Choisis un fichier PDF', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    notify('Le fichier dépasse 5 Mo', 'error')
    return
  }
  uploading.value = true
  try {
    info.value = await api.upload('/api/cv', file)
    notify('Nouveau CV en ligne')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

async function removeCv() {
  try {
    await api.del('/api/cv')
    info.value = { available: false }
    notify('CV retiré (le PDF de secours du site sera utilisé)')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirmDelete.value = false
  }
}

async function saveTexts() {
  savingTexts.value = true
  try {
    await saveSettings({ cv: texts.value })
    notify('Textes du CV enregistrés')
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    savingTexts.value = false
  }
}

const formatSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(b / 1024)} Ko`)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="font-mono text-[13px]">FICHIER</div>
      <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">CV</h1>
    </div>

    <section class="flex flex-wrap items-center gap-6 border-[1.5px] border-ink p-5">
      <div class="relative h-[96px] w-[74px] flex-none bg-ink" aria-hidden="true">
        <div class="absolute bottom-2.5 left-2.5 bg-signal px-1.5 py-0.5 font-mono text-[11px] font-semibold text-on-signal">PDF</div>
      </div>
      <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
        <template v-if="info?.available">
          <div class="text-xl font-extrabold">{{ info.originalName || 'CV en ligne' }}</div>
          <div class="font-mono text-[13px] text-[#4A4741]">
            {{ formatSize(info.size) }} · envoyé le {{ formatDate(info.updatedAt) }}
          </div>
          <a :href="apiUrl('/api/cv')" class="mt-1 inline-flex min-h-11 items-center font-semibold">Télécharger pour vérifier</a>
        </template>
        <template v-else-if="info">
          <div class="text-xl font-extrabold">Aucun CV dans la base</div>
          <div class="text-[#4A4741]">Le site propose le fichier de secours <code>public/cv-daniel.pdf</code>.</div>
        </template>
        <div v-else class="font-mono text-sm">Chargement…</div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <input ref="fileInput" type="file" accept="application/pdf" class="sr-only" @change="upload" />
        <button
          type="button"
          :disabled="uploading"
          class="cta flex min-h-12 cursor-pointer items-center gap-2 border-2 border-ink bg-signal px-5 font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
          @click="fileInput.click()"
        >
          {{ uploading ? 'Envoi…' : info?.available ? 'Remplacer le PDF' : 'Envoyer un PDF' }}
        </button>
        <template v-if="info?.available">
          <span v-if="confirmDelete" class="flex items-center gap-2">
            <button type="button" class="min-h-11 cursor-pointer bg-ink px-4 font-semibold text-bone" @click="removeCv">Oui, retirer</button>
            <button type="button" class="min-h-11 cursor-pointer px-2 underline" @click="confirmDelete = false">Non</button>
          </span>
          <button v-else type="button" class="min-h-11 cursor-pointer px-2 font-semibold text-signal-dark underline" @click="confirmDelete = true">
            Retirer
          </button>
        </template>
      </div>
    </section>
    <p class="-mt-5 m-0 text-sm text-[#4A4741]">PDF uniquement, 5 Mo maximum.</p>

    <form v-if="texts" class="flex flex-col gap-5 border-[1.5px] border-ink p-5" @submit.prevent="saveTexts">
      <div class="font-mono text-[13px] font-semibold">TEXTES DU BLOC « EXPORT »</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="f in fields" :key="f.key" :class="f.key === 'meta' ? 'md:col-span-2' : ''">
          <FieldInput :id="`cv-${f.key}`" v-model="texts[f.key]" :field="f" />
        </div>
      </div>
      <div>
        <button
          type="submit"
          :disabled="savingTexts"
          class="cta flex min-h-12 cursor-pointer items-center border-2 border-ink bg-ink px-6 font-semibold text-bone disabled:opacity-60"
        >
          {{ savingTexts ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>
