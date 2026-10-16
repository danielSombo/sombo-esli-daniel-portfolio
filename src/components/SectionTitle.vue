<script setup>
defineProps({
  code: { type: String, required: true },
  title: { type: String, default: '' },
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <div
    v-reveal
    class="flex flex-wrap items-baseline gap-x-7 gap-y-3 border-t-2 pt-5"
    :class="dark ? 'border-bone' : 'border-ink'"
  >
    <div class="font-mono text-[15px] font-semibold" :class="dark ? 'text-signal-light' : 'text-signal-dark'">
      {{ code }}
    </div>
    <h2 v-if="title" class="m-0 text-[clamp(40px,6vw,88px)] leading-[0.95] font-extrabold tracking-[-0.04em]">
      {{ title }}
    </h2>
  </div>
</template>
