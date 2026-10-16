<script setup>
// Un champ de formulaire du dashboard, rendu selon son type
defineProps({
  field: { type: Object, required: true },
  id: { type: String, required: true },
})
const model = defineModel()

const inputClass =
  'min-h-12 w-full border-[1.5px] border-ink bg-white px-3.5 text-base outline-none focus:border-signal-dark focus:ring-2 focus:ring-signal'
</script>

<template>
  <label v-if="field.type === 'checkbox'" :for="id" class="flex min-h-11 cursor-pointer items-center gap-3">
    <input :id="id" v-model="model" type="checkbox" class="h-5 w-5 accent-[var(--color-ink)]" />
    <span class="text-base font-semibold">{{ field.label }}</span>
  </label>

  <!-- Plusieurs choix possibles (tableau de valeurs) -->
  <fieldset v-else-if="field.type === 'multi'" :id="id" class="m-0 flex flex-col gap-1.5 border-0 p-0">
    <legend class="mb-1.5 p-0 font-mono text-[13px] font-semibold uppercase">{{ field.label }}</legend>
    <div class="flex flex-wrap gap-x-5 gap-y-1">
      <label v-for="o in field.options" :key="o.value" class="flex min-h-11 cursor-pointer items-center gap-2.5">
        <input v-model="model" type="checkbox" :value="o.value" class="h-5 w-5 accent-[var(--color-ink)]" />
        <span class="text-base font-semibold">{{ o.label }}</span>
      </label>
    </div>
    <span v-if="field.help" class="text-sm text-[#4A4741]">{{ field.help }}</span>
  </fieldset>

  <div v-else class="flex flex-col gap-1.5">
    <label :for="id" class="font-mono text-[13px] font-semibold uppercase">
      {{ field.label }}<span v-if="field.required" class="text-signal-dark"> *</span>
    </label>

    <textarea
      v-if="field.type === 'textarea'"
      :id="id"
      v-model="model"
      rows="4"
      :placeholder="field.placeholder"
      :class="inputClass + ' py-2.5 leading-relaxed'"
    ></textarea>

    <select v-else-if="field.type === 'select'" :id="id" v-model="model" :class="inputClass">
      <option v-for="o in field.options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>

    <input
      v-else
      :id="id"
      v-model="model"
      :type="field.type === 'month' ? 'month' : 'text'"
      :inputmode="field.type === 'url' ? 'url' : undefined"
      :spellcheck="field.type === 'url' ? false : undefined"
      :required="field.required"
      :placeholder="field.placeholder"
      :class="inputClass"
    />

    <span v-if="field.help" class="text-sm text-[#4A4741]">{{ field.help }}</span>
  </div>
</template>
