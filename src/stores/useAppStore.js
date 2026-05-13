import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: false,
    appName: 'VolcanoesGT',
  }),
  actions: {
    setLoading(val) {
      this.isLoading = val
    },
  },
})
