import { ref, readonly } from 'vue'
import { defineStore } from 'pinia'

export const useColorsStore = defineStore('colors', () => {
  const availableColors = ref<string[]>([
    '#266DD3',
    '#0E1C36',
    '#04724D',
    '#FF8C42',
    '#D7263D',
    '#003459',
    '#2B061E',
    '#EF2917',
    '#F786AA',
    '#20063B',
    '#2A3C24',
    '#CAD593',
    '#FFF8E8',
    '#BCCDDC',
  ])

  return {
    availableColors: readonly(availableColors),
  }
})
