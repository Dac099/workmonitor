<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { watch, nextTick, onBeforeUnmount } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'

type Props = {
  content: string
  isEditMode: boolean
}

type Emits = {
  saveContent: [html: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editor = useEditor({
  content: props.content,
  editable: props.isEditMode,
  injectCSS: true,
  extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
  autofocus: true,
})

watch(
  () => props.isEditMode,
  async (isEditMode) => {
    editor.value?.setEditable(isEditMode)

    if (!isEditMode) {
      return
    }

    await nextTick()
    editor.value?.chain().focus().run()
  },
)

const saveEditorContent = () => {
  const htmlContent = editor.value?.getHTML() ?? ''
  emit('saveContent', htmlContent)
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <section class="chat-editor">
    <section class="chat-editor--controls" v-if="isEditMode">
      <button
        type="button"
        :class="['chat-editor--control', { active: editor?.isActive('bold') }]"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <i class="nf nf-oct-bold"></i>
      </button>
      <button
        type="button"
        :class="['chat-editor--control', { active: editor?.isActive('italic') }]"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <i class="nf nf-oct-italic"></i>
      </button>
      <button
        type="button"
        :class="['chat-editor--control', { active: editor?.isActive('bulletList') }]"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <i class="nf nf-md-format_list_bulleted"></i>
      </button>
      <button
        type="button"
        :class="['chat-editor--control', { active: editor?.isActive('orderedList') }]"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <i class="nf nf-oct-list_ordered"></i>
      </button>
      <button
        type="button"
        :class="['chat-editor--control', { active: editor?.isActive('taskList') }]"
        @click="editor?.chain().focus().toggleTaskList().run()"
      >
        <i class="nf nf-md-format_list_checks"></i>
      </button>
    </section>

    <EditorContent :editor="editor" />

    <button v-if="isEditMode" class="action-btn" type="button" @click="saveEditorContent">
      Guardar
    </button>
  </section>
</template>

<style scoped>
.chat-editor {
  background-color: var(--main-color);
  padding: 5px 10px;
  border-radius: 5px;
}

.chat-editor--controls {
  background-color: var(--main-color);
  border-radius: 5px;
  padding: 15px 0;
  margin-bottom: 5px;
  border-bottom: 2px dashed var(--shadow-color);
}

.chat-editor--control {
  background: transparent;
  border: none;
  color: var(--dark-color);
  cursor: pointer;
  font-size: 1rem;

  i {
    padding: 10px;
    border-radius: 5px;
  }
}

.chat-editor--control:hover i {
  background-color: rgba(0, 0, 0, 0.1);
}

.chat-editor--control:active i {
  background-color: var(--contrast-color);
  color: var(--main-color);
}

.chat-editor--control.active i {
  background-color: var(--contrast-color);
  color: var(--main-color);
}

.action-btn {
  background-color: var(--dark-color);
  color: var(--main-color);
  border: 1px solid var(--dark-color);
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: block;
  margin: 10px 0 0 auto;
}

.action-btn:hover {
  border-color: var(--dark-color);
  color: var(--dark-color);
  background-color: var(--main-color);
}

:global(.tiptap ul),
:global(.tiptap ol) {
  margin: 0.3rem 0;
  padding-inline-start: 1.5rem;
}

:global(.tiptap li p) {
  margin: 0;
}

:global(.tiptap ol) {
  list-style: none;
  padding-inline-start: 0;
  counter-reset: ordered-list-item;
}

:global(.tiptap ol > li) {
  counter-increment: ordered-list-item;
  display: flex;
  align-items: flex-start;
}

:global(.tiptap ol > li::before) {
  content: counter(ordered-list-item) '.';
  display: inline-block;
  width: 2rem;
  margin-right: 0.25rem;
  text-align: left;
  font-variant-numeric: tabular-nums;
}

:global(.tiptap ul[data-type='taskList']) {
  list-style: none;
  padding-inline-start: 0;
}

:global(.tiptap ul[data-type='taskList'] li) {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
