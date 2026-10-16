<script setup>
// Envoi / remplacement de la photo de profil affichée dans le hero
import { computed, onMounted, ref } from 'vue'
import { api } from './api'
import { notify, refreshSite } from './store'
import { apiUrl } from '../stores/content'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIDE = 800 // la photo est réduite avant l'envoi : inutile de charger 5 Mo sur le site

const info = ref(null) // { available, size, updatedAt, originalName }
const uploading = ref(false)
const fileInput = ref(null)
const confirmDelete = ref(false)

const preview = computed(() =>
  info.value?.available ? apiUrl(`/api/photo?v=${encodeURIComponent(info.value.updatedAt)}`) : '',
)

async function loadInfo() {
  const data = await api.get('/api/content')
  info.value = data.photo || { available: false }
}
onMounted(() => loadInfo().catch((e) => notify(e.message, 'error')))

// Réduit l'image à MAX_SIDE px et la convertit en JPEG (respecte l'orientation du téléphone)
async function shrink(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // un PNG transparent devient blanc plutôt que noir
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
  if (!blob) throw new Error("Impossible de préparer l'image")
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}

async function upload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!TYPES.includes(file.type)) {
    notify('Choisis une image JPEG, PNG ou WebP', 'error')
    event.target.value = ''
    return
  }
  uploading.value = true
  try {
    let prepared
    try {
      prepared = await shrink(file)
    } catch {
      throw new Error("Cette image n'a pas pu être lue")
    }
    info.value = await api.upload('/api/photo', prepared)
    notify('Nouvelle photo en ligne')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

async function removePhoto() {
  try {
    await api.del('/api/photo')
    info.value = { available: false }
    notify('Photo retirée du site')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirmDelete.value = false
  }
}

const formatSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(b / 1024)} Ko`)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="flex flex-col gap-3">
    <section class="flex flex-wrap items-center gap-6 border-[1.5px] border-ink p-5">
      <img
        v-if="preview"
        :src="preview"
        alt="Photo de profil actuelle"
        width="96"
        height="96"
        class="size-24 flex-none border-[1.5px] border-ink object-cover"
      />
      <div v-else class="relative size-24 flex-none bg-ink" aria-hidden="true">
        <div class="absolute bottom-2.5 left-2.5 bg-signal px-1.5 py-0.5 font-mono text-[11px] font-semibold text-on-signal">PHOTO</div>
      </div>
      <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
        <div class="font-mono text-[13px] font-semibold">PHOTO DE PROFIL</div>
        <template v-if="info?.available">
          <div class="text-xl font-extrabold">{{ info.originalName || 'Photo en ligne' }}</div>
          <div class="font-mono text-[13px] text-[#4A4741]">
            {{ formatSize(info.size) }} · envoyée le {{ formatDate(info.updatedAt) }}
          </div>
        </template>
        <template v-else-if="info">
          <div class="text-xl font-extrabold">Aucune photo</div>
          <div class="text-[#4A4741]">Le site s'affiche sans photo dans la section d'accueil.</div>
        </template>
        <div v-else class="font-mono text-sm">Chargement…</div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="upload" />
        <button
          type="button"
          :disabled="uploading"
          class="cta flex min-h-12 cursor-pointer items-center gap-2 border-2 border-ink bg-signal px-5 font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
          @click="fileInput.click()"
        >
          {{ uploading ? 'Envoi…' : info?.available ? 'Remplacer la photo' : 'Envoyer une photo' }}
        </button>
        <template v-if="info?.available">
          <span v-if="confirmDelete" class="flex items-center gap-2">
            <button type="button" class="min-h-11 cursor-pointer bg-ink px-4 font-semibold text-bone" @click="removePhoto">Oui, retirer</button>
            <button type="button" class="min-h-11 cursor-pointer px-2 underline" @click="confirmDelete = false">Non</button>
          </span>
          <button v-else type="button" class="min-h-11 cursor-pointer px-2 font-semibold text-signal-dark underline" @click="confirmDelete = true">
            Retirer
          </button>
        </template>
      </div>
    </section>
    <p class="m-0 text-sm text-[#4A4741]">
      JPEG, PNG ou WebP. L'image est réduite automatiquement et affichée en carré : cadre ton visage au centre.
    </p>
  </div>
</template>
