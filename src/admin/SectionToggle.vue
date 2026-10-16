<script setup>
// Interrupteur « Afficher cette section sur le site »
import { computed, ref } from 'vue'
import { notify, saveSettings, settingsState } from './store'

const props = defineProps({ section: { type: String, required: true } })

const saving = ref(false)
const enabled = computed(() => settingsState.data?.sections?.[props.section] !== false)

async function toggle() {
  saving.value = true
  try {
    await saveSettings({ sections: { [props.section]: !enabled.value } })
    notify(enabled.value ? 'Section affichée sur le site' : 'Section masquée du site')
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="enabled"
    :disabled="saving || !settingsState.data"
    class="flex min-h-11 cursor-pointer items-center gap-3 border-[1.5px] border-ink px-3.5 font-mono text-[13px] font-semibold disabled:cursor-wait disabled:opacity-60"
    :class="enabled ? 'bg-ink text-bone' : 'bg-transparent'"
    @click="toggle"
  >
    <span
      class="relative h-5 w-9 rounded-full border-[1.5px] transition-colors"
      :class="enabled ? 'border-bone bg-signal' : 'border-ink bg-transparent'"
      aria-hidden="true"
    >
      <span
        class="absolute top-[1.5px] h-3.5 w-3.5 rounded-full transition-all"
        :class="enabled ? 'left-[17px] bg-bone' : 'left-[2px] bg-ink'"
      ></span>
    </span>
    {{ enabled ? 'VISIBLE SUR LE SITE' : 'MASQUÉE DU SITE' }}
  </button>
</template>
