<script setup>
// Photos d'un moment : envoi de plusieurs photos, légendes, ordre, suppression
import { onMounted, ref } from 'vue'
import { api } from './api'
import { IMAGE_TYPES, shrinkImage } from './images'
import { notify, refreshSite } from './store'
import { imageHref } from '../stores/content'

const props = defineProps({ momentId: { type: String, required: true } })
const emit = defineEmits(['count']) // nombre de photos, pour la liste des moments

const MAX_PER_SEND = 12

const photos = ref([])
const loading = ref(true)
const uploading = ref('') // texte de progression
const fileInput = ref(null)
const confirmId = ref(null)
const base = () => `/api/moments/${props.momentId}/photos`

onMounted(async () => {
  try {
    photos.value = await api.get(base())
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    loading.value = false
  }
})

async function upload(event) {
  const files = [...(event.target.files || [])]
  event.target.value = ''
  if (!files.length) return
  if (files.length > MAX_PER_SEND) return notify(`${MAX_PER_SEND} photos maximum par envoi`, 'error')
  if (files.some((f) => !IMAGE_TYPES.includes(f.type))) return notify('Choisis des images JPEG, PNG ou WebP', 'error')

  try {
    const prepared = []
    for (const [i, f] of files.entries()) {
      uploading.value = `Préparation ${i + 1} / ${files.length}…`
      try {
        prepared.push(await shrinkImage(f, 1600))
      } catch {
        throw new Error(`« ${f.name} » n'a pas pu être lue`)
      }
    }
    uploading.value = 'Envoi…'
    const res = await api.uploadMany(base(), prepared)
    photos.value = res.photos
    emit('count', res.photoCount)
    notify(files.length > 1 ? `${files.length} photos ajoutées` : 'Photo ajoutée')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    uploading.value = ''
  }
}

async function saveCaption(photo) {
  try {
    await api.put(`${base()}/${photo.id}`, { caption: photo.caption })
    notify('Légende enregistrée')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  }
}

async function move(index, dir) {
  const target = index + dir
  if (target < 0 || target >= photos.value.length) return
  const reordered = [...photos.value]
  ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
  const previous = photos.value
  photos.value = reordered
  try {
    photos.value = await api.put(`${base()}/reorder`, { ids: reordered.map((p) => p.id) })
    refreshSite()
  } catch (e) {
    photos.value = previous
    notify(e.message, 'error')
  }
}

async function remove(photo) {
  try {
    const res = await api.del(`${base()}/${photo.id}`)
    photos.value = photos.value.filter((p) => p.id !== photo.id)
    emit('count', res.photoCount)
    notify('Photo supprimée')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirmId.value = null
  }
}
</script>

<template>
  <section class="flex flex-col gap-4 border-t-[1.5px] border-ink pt-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-col gap-0.5">
        <div class="font-mono text-[13px] font-semibold">PHOTOS DU MOMENT</div>
        <div class="text-[15px] text-[#4A4741]">
          {{ photos.length ? 'La première photo sert de couverture sur le site.' : "Pas encore de photo : le site affiche une photo d'exemple." }}
        </div>
      </div>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="sr-only" @change="upload" />
      <button
        type="button"
        :disabled="!!uploading"
        class="cta flex min-h-12 cursor-pointer items-center gap-2 border-2 border-ink bg-signal px-5 font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
        @click="fileInput.click()"
      >
        {{ uploading || 'Ajouter des photos' }}
      </button>
    </div>

    <p v-if="loading" class="m-0 font-mono text-sm">Chargement…</p>
    <ul v-else-if="photos.length" class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-0">
      <li v-for="(p, i) in photos" :key="p.id" class="flex flex-col border-[1.5px] border-ink bg-white">
        <div class="relative">
          <img :src="imageHref(p.id)" :alt="p.caption || `Photo ${i + 1}`" class="block aspect-[4/3] w-full object-cover" />
          <span v-if="i === 0" class="absolute top-2 left-2 bg-signal px-1.5 py-0.5 font-mono text-[11px] font-semibold text-on-signal">
            COUVERTURE
          </span>
        </div>
        <div class="flex flex-col gap-2 p-3">
          <label :for="`caption-${p.id}`" class="font-mono text-[11px] font-semibold">LÉGENDE</label>
          <input
            :id="`caption-${p.id}`"
            v-model="p.caption"
            type="text"
            maxlength="200"
            placeholder="Ce qu'on voit sur la photo"
            class="min-h-11 w-full border-[1.5px] border-ink bg-white px-2.5 text-[15px] outline-none focus:border-signal-dark focus:ring-2 focus:ring-signal"
            @change="saveCaption(p)"
          />
          <div class="flex items-center justify-between gap-2">
            <div class="flex">
              <button
                type="button"
                class="flex h-11 w-11 cursor-pointer items-center justify-center disabled:cursor-default disabled:opacity-25"
                :disabled="i === 0"
                :aria-label="`Avancer la photo ${i + 1}`"
                @click="move(i, -1)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
              </button>
              <button
                type="button"
                class="flex h-11 w-11 cursor-pointer items-center justify-center disabled:cursor-default disabled:opacity-25"
                :disabled="i === photos.length - 1"
                :aria-label="`Reculer la photo ${i + 1}`"
                @click="move(i, 1)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
              </button>
            </div>
            <span v-if="confirmId === p.id" class="flex items-center gap-1">
              <button type="button" class="min-h-11 cursor-pointer bg-ink px-3 text-sm font-semibold text-bone" @click="remove(p)">Supprimer</button>
              <button type="button" class="min-h-11 cursor-pointer px-2 text-sm underline" @click="confirmId = null">Non</button>
            </span>
            <button v-else type="button" class="min-h-11 cursor-pointer px-2 text-sm font-semibold text-signal-dark underline" @click="confirmId = p.id">
              Supprimer
            </button>
          </div>
        </div>
      </li>
    </ul>
    <p class="m-0 text-sm text-[#4A4741]">
      JPEG, PNG ou WebP, {{ MAX_PER_SEND }} photos maximum par envoi. Vérifie que tes collègues sont d'accord pour apparaître et
      qu'aucun document ni nom de client n'est visible.
    </p>
  </section>
</template>
