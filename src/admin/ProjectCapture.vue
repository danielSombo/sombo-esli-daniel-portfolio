<script setup>
// Capture d'un projet : envoi, remplacement, retrait (affichée dans le panneau du projet sur le site)
import { computed, ref } from 'vue'
import { api } from './api'
import { IMAGE_TYPES, shrinkImage } from './images'
import { notify, refreshSite } from './store'
import { imageHref } from '../stores/content'

const props = defineProps({
  projectId: { type: String, required: true },
  imageId: { type: String, default: null },
})
const emit = defineEmits(['updated']) // renvoie le projet mis à jour

const uploading = ref(false)
const confirmDelete = ref(false)
const fileInput = ref(null)
const preview = computed(() => imageHref(props.imageId))

async function upload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!IMAGE_TYPES.includes(file.type)) return notify('Choisis une image JPEG, PNG ou WebP', 'error')
  uploading.value = true
  try {
    let prepared
    try {
      prepared = await shrinkImage(file, 1600)
    } catch {
      throw new Error("Cette image n'a pas pu être lue")
    }
    emit('updated', await api.upload(`/api/projects/${props.projectId}/image`, prepared))
    notify('Capture en ligne')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    uploading.value = false
  }
}

async function remove() {
  try {
    emit('updated', await api.del(`/api/projects/${props.projectId}/image`))
    notify('Capture retirée')
    refreshSite()
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirmDelete.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-3 border-t-[1.5px] border-ink pt-5">
    <div class="font-mono text-[13px] font-semibold">CAPTURE DE L'APPLICATION</div>
    <div class="flex flex-wrap items-center gap-5">
      <img
        v-if="preview"
        :src="preview"
        alt="Capture actuelle du projet"
        class="aspect-[16/9] w-60 flex-none border-[1.5px] border-ink object-cover object-top"
      />
      <div v-else class="relative aspect-[16/9] w-60 flex-none bg-ink" aria-hidden="true">
        <div class="absolute bottom-2.5 left-2.5 bg-signal px-1.5 py-0.5 font-mono text-[11px] font-semibold text-on-signal">
          AUCUNE CAPTURE
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="upload" />
        <button
          type="button"
          :disabled="uploading"
          class="cta flex min-h-12 cursor-pointer items-center gap-2 border-2 border-ink bg-signal px-5 font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
          @click="fileInput.click()"
        >
          {{ uploading ? 'Envoi…' : imageId ? 'Remplacer la capture' : 'Envoyer une capture' }}
        </button>
        <template v-if="imageId">
          <span v-if="confirmDelete" class="flex items-center gap-2">
            <button type="button" class="min-h-11 cursor-pointer bg-ink px-4 font-semibold text-bone" @click="remove">Oui, retirer</button>
            <button type="button" class="min-h-11 cursor-pointer px-2 underline" @click="confirmDelete = false">Non</button>
          </span>
          <button v-else type="button" class="min-h-11 cursor-pointer px-2 font-semibold text-signal-dark underline" @click="confirmDelete = true">
            Retirer
          </button>
        </template>
      </div>
    </div>
    <p class="m-0 text-sm text-[#4A4741]">
      JPEG, PNG ou WebP. Une capture d'écran de l'application, de préférence en largeur (format 16/9) et sans le filigrane
      « Activer Windows ».
    </p>
  </section>
</template>
