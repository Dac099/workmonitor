export default function getDateString(date: Date, showTime: boolean = false): string {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(showTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }
      : {}),
  })
}

export interface CheckboxItem {
  id: string
  message: string
  completed: boolean
}

function uuidV4(): string {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }

  if (typeof globalThis.crypto === 'undefined') {
    return '00000000-0000-4000-8000-000000000000'
  }

  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)

  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80

  const hex: string[] = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'))
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
}

export function getCheckboxItemsJson(htmlContent: string): CheckboxItem[] {
  try {
    if (!htmlContent.trim() || typeof DOMParser === 'undefined') {
      return []
    }

    const parser = new DOMParser()
    const documentContent = parser.parseFromString(htmlContent, 'text/html')

    const taskItems = Array.from(documentContent.querySelectorAll("li[data-type='taskItem']"))

    const checkboxItems: CheckboxItem[] = taskItems.map((taskItem) => {
      const checkboxElement = taskItem.querySelector<HTMLInputElement>("input[type='checkbox']")
      const checkedAttribute = taskItem.getAttribute('data-checked')
      const completed = checkboxElement?.checked ?? checkedAttribute === 'true'

      const contentContainer = taskItem.querySelector(':scope > div') ?? taskItem
      const contentClone = contentContainer.cloneNode(true) as HTMLElement
      const nestedLists = contentClone.querySelectorAll("ul[data-type='taskList'], ol, ul")
      nestedLists.forEach((nestedList) => nestedList.remove())

      const message = contentClone.textContent?.replace(/\s+/g, ' ').trim() ?? ''

      return {
        id: uuidV4(),
        message,
        completed,
      }
    })

    return checkboxItems
  } catch {
    return []
  }
}
