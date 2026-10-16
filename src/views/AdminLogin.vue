<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../admin/api'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(route.query.expired ? 'Ta session a expiré, reconnecte-toi.' : '')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
    router.replace(redirect ? route.query.redirect : '/admin')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-bone px-4 py-12 text-ink">
    <div class="w-full max-w-[440px]">
      <div class="mb-8 flex flex-col gap-2">
        <div class="font-mono text-sm font-semibold">daniel<span class="text-signal-dark">/</span>admin</div>
        <h1 class="m-0 text-5xl leading-none font-extrabold tracking-[-0.04em]">
          Connexion<span class="text-signal-mark">.</span>
        </h1>
        <p class="m-0 text-lg text-[#4A4741]">Accès réservé à la gestion du portfolio.</p>
      </div>

      <form class="flex flex-col gap-5 border-[1.5px] border-ink bg-[#F4F1EA] p-7" @submit.prevent="submit">
        <label class="flex flex-col gap-1.5">
          <span class="font-mono text-[13px] font-semibold">EMAIL</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            required
            class="min-h-12 border-[1.5px] border-ink bg-white px-3.5 text-lg outline-none focus:border-signal-dark focus:ring-2 focus:ring-signal"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="font-mono text-[13px] font-semibold">MOT DE PASSE</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="min-h-12 border-[1.5px] border-ink bg-white px-3.5 text-lg outline-none focus:border-signal-dark focus:ring-2 focus:ring-signal"
          />
        </label>

        <p v-if="error" role="alert" class="m-0 border-l-0 bg-ink px-3.5 py-2.5 font-mono text-sm text-bone">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="cta flex min-h-[52px] cursor-pointer items-center justify-center border-2 border-ink bg-signal text-lg font-semibold text-on-signal disabled:cursor-wait disabled:opacity-60"
        >
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <RouterLink to="/" class="mt-6 inline-flex min-h-11 items-center font-mono text-sm">← Retour au site</RouterLink>
    </div>
  </main>
</template>
