<script setup>
// Éditeur générique : liste + ajout + modification + suppression + réordonnancement
import { computed, nextTick, ref, watch } from 'vue'
import FieldInput from './FieldInput.vue'
import SectionToggle from './SectionToggle.vue'
import ProjectCapture from './ProjectCapture.vue'
import MomentPhotos from './MomentPhotos.vue'
import { api } from './api'
import { notify, refreshSite } from './store'

const props = defineProps({ config: { type: Object, required: true } })

const items = ref([])
const loading = ref(true)
const loadError = ref('')
const form = ref(null) // élément en cours d'édition (copie)
const formError = ref('')
const saving = ref(false)
const confirmId = ref(null) // élément dont on confirme la suppression
const busyId = ref(null)

const isNew = computed(() => form.value && !form.value.id)
const tagFields = computed(() => props.config.fields.filter((f) => f.type === 'tags').map((f) => f.key))

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    items.value = await api.get(props.config.endpoint)
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
}

// Recharge quand on change d'onglet (certifications → projets…)
watch(
  () => props.config.endpoint,
  () => {
    form.value = null
    confirmId.value = null
    load()
  },
  { immediate: true },
)

// Les tags sont édités comme du texte « a, b, c »
function toForm(item) {
  const copy = JSON.parse(JSON.stringify(item))
  tagFields.value.forEach((k) => (copy[k] = (copy[k] || []).join(', ')))
  // Les choix multiples sont toujours un tableau
  props.config.fields.filter((f) => f.type === 'multi').forEach((f) => (copy[f.key] = copy[f.key] || []))
  return copy
}
function fromForm(f) {
  const out = { ...f }
  tagFields.value.forEach((k) => {
    out[k] = String(out[k] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  })
  props.config.fields.filter((fd) => fd.type === 'url').forEach((fd) => {
    if (!out[fd.key]) out[fd.key] = null
  })
  return out
}

async function openForm(item) {
  formError.value = ''
  confirmId.value = null
  form.value = toForm(item || props.config.blank())
  await nextTick()
  document.getElementById('field-0')?.focus()
}

function closeForm() {
  form.value = null
}

async function save() {
  formError.value = ''
  const missing = props.config.fields.find(
    (f) => f.required && !(f.hideIf && f.hideIf(form.value)) && !String(form.value[f.key] ?? '').trim(),
  )
  if (missing) {
    formError.value = `Le champ « ${missing.label} » est obligatoire`
    return
  }
  saving.value = true
  try {
    const payload = fromForm(form.value)
    if (isNew.value) {
      const created = await api.post(props.config.endpoint, payload)
      items.value.push(created)
      // Projets et moments : le formulaire reste ouvert pour ajouter tout de suite la capture ou les photos
      if (props.config.extra) {
        form.value = toForm(created)
        notify('Élément ajouté : tu peux maintenant ajouter les images')
        refreshSite()
        return
      }
      notify('Élément ajouté')
    } else {
      const updated = await api.put(`${props.config.endpoint}/${form.value.id}`, payload)
      items.value = items.value.map((i) => (i.id === updated.id ? updated : i))
      notify('Modifications enregistrées')
    }
    form.value = null
    refreshSite()
  } catch (e) {
    formError.value = e.message
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  busyId.value = item.id
  try {
    await api.del(`${props.config.endpoint}/${item.id}`)
    items.value = items.value.filter((i) => i.id !== item.id)
    if (form.value?.id === item.id) form.value = null
    notify('Élément supprimé')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    busyId.value = null
    confirmId.value = null
  }
}

async function move(index, dir) {
  const target = index + dir
  if (target < 0 || target >= items.value.length) return
  const reordered = [...items.value]
  ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
  const previous = items.value
  items.value = reordered // affichage immédiat
  try {
    items.value = await api.put(`${props.config.endpoint}/reorder`, { ids: reordered.map((i) => i.id) })
    refreshSite()
  } catch (e) {
    items.value = previous
    notify(e.message, 'error')
  }
}

// Capture d'un projet ou nombre de photos d'un moment : on met la liste à jour sans recharger
function onImageUpdated(updated) {
  items.value = items.value.map((i) => (i.id === updated.id ? updated : i))
  if (form.value?.id === updated.id) form.value.imageId = updated.imageId
}
function onPhotoCount(count) {
  const id = form.value?.id
  items.value = items.value.map((i) => (i.id === id ? { ...i, photoCount: count } : i))
  if (form.value) form.value.photoCount = count
}

const visibleFields = computed(() => props.config.fields.filter((f) => !(f.hideIf && form.value && f.hideIf(form.value))))
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- En-tête -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <div class="font-mono text-[13px]">{{ items.length }} ÉLÉMENT{{ items.length > 1 ? 'S' : '' }}</div>
        <h1 class="m-0 text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em]">{{ config.title }}</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <SectionToggle v-if="config.section" :section="config.section" />
        <button
          type="button"
          class="cta flex min-h-11 cursor-pointer items-center gap-2 border-2 border-ink bg-signal px-4 font-semibold text-on-signal"
          @click="openForm()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Ajouter
        </button>
      </div>
    </div>

    <!-- Formulaire -->
    <form
      v-if="form"
      class="flex flex-col gap-5 border-[1.5px] border-ink bg-[#F4F1EA] p-[clamp(18px,3vw,28px)]"
      @submit.prevent="save"
    >
      <div class="flex items-center justify-between gap-3">
        <h2 class="m-0 text-2xl font-extrabold tracking-tight">
          {{ isNew ? `Ajouter · ${config.itemName}` : `Modifier : ${config.title_(form) || '…'}` }}
        </h2>
        <button type="button" class="min-h-11 cursor-pointer px-2 font-mono text-sm underline" @click="closeForm">Annuler</button>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="(f, i) in visibleFields"
          :key="f.key"
          :class="f.type === 'textarea' || f.type === 'tags' ? 'md:col-span-2' : ''"
        >
          <FieldInput :id="`field-${i}`" v-model="form[f.key]" :field="f" />
        </div>
      </div>

      <p v-if="formError" role="alert" class="m-0 bg-ink px-3.5 py-2.5 font-mono text-sm text-bone">{{ formError }}</p>

      <div class="flex flex-wrap gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="cta flex min-h-12 cursor-pointer items-center border-2 border-ink bg-ink px-6 font-semibold text-bone disabled:cursor-wait disabled:opacity-60"
        >
          {{ saving ? 'Enregistrement…' : isNew ? 'Ajouter' : 'Enregistrer' }}
        </button>
      </div>
    </form>

    <!-- Images : capture d'un projet ou photos d'un moment (hors du formulaire, envoi immédiat) -->
    <div
      v-if="form && config.extra"
      class="-mt-6 border-[1.5px] border-t-0 border-ink bg-[#F4F1EA] px-[clamp(18px,3vw,28px)] pb-[clamp(18px,3vw,28px)]"
    >
      <p v-if="isNew" class="m-0 border-t-[1.5px] border-ink pt-5 text-[15px] text-[#4A4741]">
        {{ config.extra === 'capture' ? 'La capture' : 'Les photos' }} s'ajoute{{ config.extra === 'photos' ? 'nt' : '' }}
        juste après le premier enregistrement.
      </p>
      <ProjectCapture
        v-else-if="config.extra === 'capture'"
        :key="form.id"
        :project-id="form.id"
        :image-id="form.imageId || null"
        @updated="onImageUpdated"
      />
      <MomentPhotos v-else-if="config.extra === 'photos'" :key="form.id" :moment-id="form.id" @count="onPhotoCount" />
    </div>

    <!-- Liste -->
    <p v-if="loading" class="m-0 font-mono text-sm">Chargement…</p>
    <p v-else-if="loadError" role="alert" class="m-0 bg-ink px-3.5 py-2.5 font-mono text-sm text-bone">{{ loadError }}</p>
    <div
      v-else-if="!items.length"
      class="flex flex-col items-start gap-3 border-[1.5px] border-dashed border-ink p-8"
    >
      <p class="m-0 text-lg">Aucun élément pour l'instant. La section n'apparaît pas sur le site tant qu'elle est vide.</p>
      <button type="button" class="min-h-11 cursor-pointer font-semibold underline" @click="openForm()">
        Ajouter le premier élément
      </button>
    </div>

    <ul v-else class="m-0 flex list-none flex-col border-t-[1.5px] border-ink p-0">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="flex flex-wrap items-center gap-x-4 gap-y-3 border-b-[1.5px] border-ink py-3.5"
        :class="form?.id === item.id ? 'bg-[#F4F1EA]' : ''"
      >
        <div class="flex flex-none flex-col">
          <button
            type="button"
            class="flex h-[22px] w-11 cursor-pointer items-center justify-center disabled:cursor-default disabled:opacity-25"
            :disabled="index === 0"
            :aria-label="`Monter ${config.title_(item)}`"
            @click="move(index, -1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
          </button>
          <button
            type="button"
            class="flex h-[22px] w-11 cursor-pointer items-center justify-center disabled:cursor-default disabled:opacity-25"
            :disabled="index === items.length - 1"
            :aria-label="`Descendre ${config.title_(item)}`"
            @click="move(index, 1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>

        <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xl font-extrabold tracking-tight">{{ config.title_(item) }}</span>
            <span
              v-if="config.badge && config.badge(item)"
              class="px-2 py-0.5 font-mono text-[11px] font-semibold"
              :class="config.badge(item).strong ? 'bg-signal text-on-signal' : 'border border-ink'"
            >
              {{ config.badge(item).text }}
            </span>
          </div>
          <div class="truncate text-[15px] text-[#4A4741]">{{ config.subtitle(item) }}</div>
        </div>

        <div v-if="confirmId === item.id" class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-[13px] font-semibold">Supprimer ?</span>
          <button
            type="button"
            :disabled="busyId === item.id"
            class="min-h-11 cursor-pointer bg-ink px-4 font-semibold text-bone disabled:opacity-60"
            @click="remove(item)"
          >
            Oui, supprimer
          </button>
          <button type="button" class="min-h-11 cursor-pointer px-3 underline" @click="confirmId = null">Non</button>
        </div>
        <div v-else class="flex gap-2">
          <button
            type="button"
            class="min-h-11 cursor-pointer border-[1.5px] border-ink px-4 font-semibold transition-colors hover:bg-ink hover:text-bone"
            @click="openForm(item)"
          >
            Modifier
          </button>
          <button
            type="button"
            class="min-h-11 cursor-pointer px-3 font-semibold text-signal-dark underline"
            @click="confirmId = item.id"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
