<script setup>
import SectionTitle from './SectionTitle.vue'
import CvDownload from './CvDownload.vue'
import { computed, reactive, ref } from 'vue'
import { apiUrl, content, safeUrl , stageOf } from '../stores/content'

const links = computed(() => content.settings.links)
const profile = computed(() => content.settings.profile)

const stage = stageOf('contact')

// ─── Formulaire de contact : le message arrive dans le dashboard (onglet Messages) ───
const blank = () => ({ name: '', email: '', subject: '', message: '', website: '' })
const form = reactive(blank())
const sending = ref(false)
const sent = ref(false)
const error = ref('')

function check() {
  if (!form.name.trim()) return 'Indiquez votre nom'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Indiquez une adresse e-mail valide'
  if (form.message.trim().length < 10) return 'Le message est trop court (10 caractères minimum)'
  return ''
}

async function send() {
  error.value = check()
  if (error.value) return
  sending.value = true
  try {
    const res = await fetch(apiUrl('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Envoi impossible')
    Object.assign(form, blank())
    sent.value = true
  } catch (e) {
    error.value =
      e instanceof TypeError ? "Le message n'a pas pu partir. Écrivez-moi directement par e-mail." : e.message
  } finally {
    sending.value = false
  }
}

const inputClass =
  'min-h-12 w-full border-[1.5px] border-bone/60 bg-transparent px-3.5 text-lg text-bone outline-none placeholder:text-bone/40 focus:border-signal focus:ring-2 focus:ring-signal'
</script>

<template>
  <section :id="stage.id" class="scroll-mt-20 bg-ink text-bone">
    <div class="mx-auto flex max-w-[1320px] flex-col gap-14 px-4 pt-28 pb-12 sm:px-8 lg:px-12">
      <SectionTitle :code="stage.code" dark />

      <div class="flex flex-wrap items-center justify-between gap-10">
        <h2 v-reveal class="m-0 text-[clamp(56px,10vw,168px)] leading-[0.86] font-extrabold tracking-[-0.05em]">
          Écrivons<br />la suite<span class="text-signal">.</span>
        </h2>
        <div
          aria-hidden="true"
          class="spin flex h-[170px] w-[170px] items-center justify-center rounded-full border-[1.5px] border-dashed border-bone"
        >
          <div class="h-[22px] w-[22px] bg-signal"></div>
        </div>
      </div>

      <CvDownload />

      <div class="flex flex-wrap gap-3.5">
        <a
          :href="links.email"
          class="cta cta--light flex min-h-14 items-center bg-signal px-6.5 text-xl font-semibold text-on-signal no-underline"
        >
          {{ links.emailLabel }}
        </a>
        <a
          :href="safeUrl(links.github)"
          target="_blank"
          rel="noopener"
          class="flex min-h-14 items-center border-[1.5px] border-bone px-6.5 text-xl font-semibold text-bone no-underline transition-colors hover:bg-bone hover:text-ink"
        >
          GitHub
        </a>
        <a
          :href="safeUrl(links.linkedin)"
          target="_blank"
          rel="noopener"
          class="flex min-h-14 items-center border-[1.5px] border-bone px-6.5 text-xl font-semibold text-bone no-underline transition-colors hover:bg-bone hover:text-ink"
        >
          LinkedIn
        </a>
      </div>

      <!-- Formulaire de contact -->
      <div v-reveal class="border-[1.5px] border-bone/40">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-bone/40 px-5 py-4 font-mono text-sm">
          <span>$ pipeline send --message<span class="blink ml-1.5 inline-block h-[15px] w-2 bg-signal align-[-2px]" aria-hidden="true"></span></span>
          <span class="text-muted">RÉPONSE PAR E-MAIL</span>
        </div>

        <div v-if="sent" role="status" class="flex flex-col items-start gap-4 p-[clamp(20px,3vw,32px)]">
          <p class="m-0 text-[clamp(28px,3.4vw,44px)] leading-none font-extrabold tracking-tight">
            Message reçu<span class="text-signal">.</span>
          </p>
          <p class="m-0 text-lg">Merci, je vous réponds par e-mail dès que possible.</p>
          <button type="button" class="min-h-11 cursor-pointer font-mono text-sm font-semibold underline" @click="sent = false">
            Écrire un autre message
          </button>
        </div>

        <form v-else class="grid gap-5 p-[clamp(20px,3vw,32px)] md:grid-cols-2" novalidate @submit.prevent="send">
          <div class="flex flex-col gap-1.5">
            <label for="c-name" class="font-mono text-[13px] font-semibold">NOM *</label>
            <input id="c-name" v-model="form.name" type="text" autocomplete="name" maxlength="100" required :class="inputClass" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="c-email" class="font-mono text-[13px] font-semibold">E-MAIL *</label>
            <input id="c-email" v-model="form.email" type="email" autocomplete="email" maxlength="200" required :class="inputClass" />
          </div>
          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="c-subject" class="font-mono text-[13px] font-semibold">OBJET</label>
            <input
              id="c-subject"
              v-model="form.subject"
              type="text"
              maxlength="150"
              placeholder="Stage, projet, question…"
              :class="inputClass"
            />
          </div>
          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="c-message" class="font-mono text-[13px] font-semibold">MESSAGE *</label>
            <textarea
              id="c-message"
              v-model="form.message"
              rows="5"
              maxlength="5000"
              required
              :class="inputClass + ' py-3 leading-relaxed'"
            ></textarea>
          </div>
          <!-- Champ piège pour les robots : invisible et ignoré par les humains -->
          <div class="hidden" aria-hidden="true">
            <label for="c-website">Site web</label>
            <input id="c-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
          </div>

          <p v-if="error" role="alert" class="m-0 bg-bone px-3.5 py-2.5 font-mono text-sm text-ink md:col-span-2">{{ error }}</p>

          <div class="md:col-span-2">
            <button
              type="submit"
              :disabled="sending"
              class="cta cta--light flex min-h-14 cursor-pointer items-center gap-2.5 bg-signal px-6.5 text-xl font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
            >
              {{ sending ? 'Envoi…' : 'Envoyer le message' }}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </button>
          </div>
        </form>
      </div>

      <footer
        class="flex flex-wrap justify-between gap-3 border-t border-bone/20 pt-5 font-mono text-[13px] text-[#A8A399]"
      >
        <span>Fait à {{ profile.city }}</span>
        <span>{{ profile.handle }}/portfolio · {{ profile.year }}</span>
      </footer>
    </div>
  </section>
</template>
