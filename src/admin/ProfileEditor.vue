<script setup>
// Profil, titre de poste, liens, bandeaux de la stack
import { ref, watch } from 'vue'
import FieldInput from './FieldInput.vue'
import PhotoEditor from './PhotoEditor.vue'
import { notify, saveSettings, settingsState } from './store'

const form = ref(null)
const saving = ref(false)

const groups = [
  {
    title: 'PROFIL',
    block: 'profile',
    fields: [
      { key: 'name', label: 'Prénom / nom affiché', type: 'text' },
      { key: 'handle', label: 'Identifiant (logo « …/portfolio »)', type: 'text' },
      { key: 'jobTitle', label: 'Titre de poste (badge du hero)', type: 'text', placeholder: 'Ingénieur Data & Cloud', help: 'Vide = pas de badge' },
      { key: 'status', label: 'Statut (pastille du menu)', type: 'text', placeholder: "Disponible · stage de fin d'études" },
      { key: 'tagline', label: 'Ligne au-dessus du titre', type: 'text' },
      { key: 'city', label: 'Ville (pied de page)', type: 'text' },
      { key: 'intro', label: "Texte d'introduction", type: 'textarea' },
    ],
  },
  {
    title: 'LIENS',
    block: 'links',
    fields: [
      { key: 'emailLabel', label: 'Email de contact', type: 'text', placeholder: 'toi@exemple.com' },
      { key: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/…' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://www.linkedin.com/in/…' },
    ],
  },
  {
    title: 'BANDEAUX DE LA SECTION STACK',
    block: 'marquee',
    fields: [
      { key: 'solid', label: 'Bandeau plein', type: 'tags', help: 'Séparés par des virgules' },
      { key: 'outline', label: 'Bandeau contour', type: 'tags', help: 'Séparés par des virgules' },
    ],
  },
]

watch(
  () => settingsState.data,
  (s) => {
    if (!s) return
    form.value = {
      profile: { ...s.profile },
      links: { ...s.links },
      marquee: { solid: (s.marquee?.solid || []).join(', '), outline: (s.marquee?.outline || []).join(', ') },
    }
  },
  { immediate: true },
)

const split = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

async function save() {
  saving.value = true
  try {
    await saveSettings({
      profile: form.value.profile,
      links: form.value.links,
      marquee: { solid: split(form.value.marquee.solid), outline: split(form.value.marquee.outline) },
    })
    notify('Profil enregistré')
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="font-mono text-[13px]">RÉGLAGES</div>
      <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">Profil & liens</h1>
    </div>

    <PhotoEditor />

    <p v-if="!form" class="m-0 font-mono text-sm">Chargement…</p>
    <form v-else class="flex flex-col gap-6" @submit.prevent="save">
      <fieldset v-for="g in groups" :key="g.block" class="m-0 border-[1.5px] border-ink p-5">
        <legend class="px-2 font-mono text-[13px] font-semibold">{{ g.title }}</legend>
        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="f in g.fields" :key="f.key" :class="f.type === 'textarea' || f.type === 'tags' ? 'md:col-span-2' : ''">
            <FieldInput :id="`${g.block}-${f.key}`" v-model="form[g.block][f.key]" :field="f" />
          </div>
        </div>
      </fieldset>

      <div>
        <button
          type="submit"
          :disabled="saving"
          class="cta flex min-h-12 cursor-pointer items-center border-2 border-ink bg-ink px-6 font-semibold text-bone disabled:cursor-wait disabled:opacity-60"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>
