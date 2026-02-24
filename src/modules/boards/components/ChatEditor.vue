<template>
  <div class="chat-editor">
    <div class="chat-editor__toolbar">
      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('bold') }"
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('italic') }"
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleStrike().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('strike') }"
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div class="chat-editor__toolbar-separator"></div>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('heading', { level: 1 }) }"
        title="Heading 1"
      >
        H1
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('heading', { level: 2 }) }"
        title="Heading 2"
      >
        H2
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('bulletList') }"
        title="Bullet List"
      >
        •
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('orderedList') }"
        title="Ordered List"
      >
        1.
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().toggleTaskList().run()"
        :class="{ 'chat-editor__toolbar-btn--active': editor?.isActive('taskList') }"
        title="Task List (Checklist)"
      >
        ☑
      </button>

      <div class="chat-editor__toolbar-separator"></div>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().undo().run()"
        title="Undo"
      >
        ↶
      </button>

      <button
        class="chat-editor__toolbar-btn"
        @click="editor?.chain().focus().redo().run()"
        title="Redo"
      >
        ↷
      </button>
    </div>

    <EditorContent :editor="editor" class="chat-editor__content" />

    <div class="chat-editor__actions">
      <button
        class="chat-editor__btn chat-editor__btn--save"
        @click="handleSave"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Guardando...' : 'Guardar' }}
      </button>
      <button
        class="chat-editor__btn chat-editor__btn--cancel"
        @click="handleCancel"
        :disabled="isLoading"
      >
        Cancelar
      </button>
    </div>

    <div v-if="error" class="chat-editor__error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

interface Props {
  initialContent?: string
  isEditing?: boolean
  isLoading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'save', htmlContent: string): void
  (e: 'cancel'): void
}

withDefaults(defineProps<Props>(), {
  initialContent: '',
  isEditing: false,
  isLoading: false,
  error: null,
})

const emit = defineEmits<Emits>()

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      paragraph: {
        HTMLAttributes: {
          class: 'chat-editor__paragraph',
        },
      },
      heading: {
        HTMLAttributes: {
          class: 'chat-editor__heading',
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: 'chat-editor__list',
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: 'chat-editor__list',
        },
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: 'chat-editor__task-list',
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: 'chat-editor__task-item',
      },
      nested: true,
    }),
  ],
  content: undefined,
})

onMounted(() => {
  if (editor.value && editor.value.isEmpty) {
    editor.value.commands.setContent('')
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const handleSave = () => {
  if (editor.value) {
    const htmlContent = editor.value.getHTML()
    emit('save', htmlContent)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="css">
.chat-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.chat-editor__toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  flex-wrap: wrap;
}

.chat-editor__toolbar-btn {
  padding: 6px 10px;
  background-color: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.chat-editor__toolbar-btn:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.chat-editor__toolbar-btn--active {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.chat-editor__toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-editor__toolbar-separator {
  width: 1px;
  background-color: #d0d0d0;
  margin: 0 4px;
}

.chat-editor__content {
  min-height: 120px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
  max-height: 300px;
}

/* TipTap Editor Styles */
:deep(.ProseMirror) {
  outline: none;
}

:deep(.ProseMirror p) {
  margin: 8px 0;
}

:deep(.ProseMirror h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 12px 0 8px 0;
}

:deep(.ProseMirror h2) {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0 8px 0;
}

:deep(.ProseMirror h3) {
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  margin: 8px 0;
  padding-left: 20px;
}

:deep(.ProseMirror li) {
  margin: 4px 0;
}

:deep(.ProseMirror strong) {
  font-weight: bold;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

/* Task List Styles */
:deep(.ProseMirror ul[data-type='taskList']) {
  list-style: none;
  padding-left: 0;
  margin: 8px 0;
}

:deep(.ProseMirror ul[data-type='taskList'] li) {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 6px 0;
  list-style: none;
}

:deep(.ProseMirror ul[data-type='taskList'] li > label) {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  flex-shrink: 0;
  padding-top: 2px;
}

:deep(.ProseMirror ul[data-type='taskList'] li > label > input[type='checkbox']) {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  accent-color: #2563eb;
}

:deep(.ProseMirror ul[data-type='taskList'] li > label > span) {
  display: none;
}

:deep(.ProseMirror ul[data-type='taskList'] li > div) {
  flex: 1;
  padding-top: 0;
}

:deep(.ProseMirror ul[data-type='taskList'] li > div p) {
  margin: 0;
  display: inline;
}

:deep(.ProseMirror ul[data-type='taskList'] li[data-checked='true'] > div) {
  text-decoration: line-through;
  opacity: 0.6;
}

:deep(
  .ProseMirror ul[data-type='taskList'] li[data-checked='true'] > label > input[type='checkbox']
) {
  accent-color: #10b981;
}

.chat-editor__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.chat-editor__btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #d0d0d0;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-editor__btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #999;
}

.chat-editor__btn--save {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.chat-editor__btn--save:hover:not(:disabled) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.chat-editor__btn--cancel {
  background-color: #f5f5f5;
  color: #333;
}

.chat-editor__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-editor__error {
  padding: 8px 12px;
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
  border-radius: 4px;
  font-size: 12px;
}
</style>
