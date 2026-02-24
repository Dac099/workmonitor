import type { Task } from '../types/chats'

/**
 * Extrae tareas del HTML generado por TipTap
 * Parsea elementos <li data-type="taskItem"> y genera un array de Task
 */
export function extractTasksFromHTML(html: string): Task[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const tasks: Task[] = []
  const taskItems = doc.querySelectorAll('li[data-type="taskItem"]')

  taskItems.forEach((taskItem) => {
    const checkbox = taskItem.querySelector('input[type="checkbox"]')
    const textContent = taskItem.querySelector('div p')?.textContent?.trim() || ''

    if (textContent) {
      tasks.push({
        id: crypto.randomUUID(),
        message: textContent,
        completed:
          checkbox?.hasAttribute('checked') || taskItem.getAttribute('data-checked') === 'true',
      })
    }
  })

  return tasks
}

/**
 * Convierte array de Task a JSON string para enviar al backend
 */
export function tasksToJSON(tasks: Task[]): string {
  return JSON.stringify(tasks)
}

/**
 * Parsea JSON string del backend a array de Task
 */
export function parseTasksFromJSON(jsonString: string | null): Task[] {
  if (!jsonString) return []

  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
