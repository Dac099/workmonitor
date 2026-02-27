import { ref } from 'vue'

export function useExport() {
  const showExportSidebar = ref(false)

  const openExportSidebar = () => {
    showExportSidebar.value = true
  }

  const closeExportSidebar = () => {
    showExportSidebar.value = false
  }

  return {
    showExportSidebar,
    openExportSidebar,
    closeExportSidebar,
  }
}
