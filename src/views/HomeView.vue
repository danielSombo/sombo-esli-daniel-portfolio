<script setup>
import SiteHeader from '../components/SiteHeader.vue'
import HeroSection from '../components/HeroSection.vue'
import ParcoursSection from '../components/ParcoursSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import MomentsSection from '../components/MomentsSection.vue'
import ProjetsSection from '../components/ProjetsSection.vue'
import CertificationsSection from '../components/CertificationsSection.vue'
import StackSection from '../components/StackSection.vue'
import ContactSection from '../components/ContactSection.vue'
import { isShown } from '../stores/content'
</script>

<template>
  <div class="overflow-x-clip">
    <a
      href="#contact"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-signal focus:px-4 focus:py-2 focus:text-on-signal"
    >
      Aller au contact
    </a>
    <SiteHeader />
    <main>
      <HeroSection />
      <ParcoursSection v-if="isShown('parcours')" />
      <ExperienceSection v-if="isShown('experience')" />
      <MomentsSection v-if="isShown('moments')" />
      <ProjetsSection v-if="isShown('projets')" />
      <CertificationsSection v-if="isShown('certifs')" />
      <StackSection v-if="isShown('stack')" />
      <ContactSection />
    </main>
  </div>
</template>
