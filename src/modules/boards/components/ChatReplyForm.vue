<template>
  <div class="chat-reply-form">
    <textarea
      v-model="replyContent"
      class="chat-reply-form__input"
      placeholder="Escribe tu respuesta aquí..."
      rows="3"
    ></textarea>

    <div v-if="props.error" class="chat-reply-form__error">
      {{ props.error }}
    </div>

    <div class="chat-reply-form__actions">
      <button
        class="chat-reply-form__btn chat-reply-form__btn--submit"
        @click="handleSubmit"
        :disabled="!replyContent.trim() || props.isLoading"
      >
        {{ props.isLoading ? 'Enviando...' : 'Enviar Respuesta' }}
      </button>
      <button
        class="chat-reply-form__btn chat-reply-form__btn--cancel"
        @click="handleCancel"
        :disabled="props.isLoading"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatAPI } from '../composables/useChatAPI'

interface Props {
  chatId: string
  isLoading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'reply-created'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createReply } = useChatAPI()
const replyContent = ref('')

const handleSubmit = async () => {
  if (!replyContent.value.trim()) return

  const reply = await createReply({
    chatId: props.chatId,
    htmlContent: `<p>${replyContent.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
  })

  if (reply) {
    replyContent.value = ''
    emit('reply-created')
  }
}

const handleCancel = () => {
  replyContent.value = ''
  emit('cancel')
}
</script>

<style scoped lang="css">
.chat-reply-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-reply-form__input {
  padding: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  resize: vertical;
}

.chat-reply-form__input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.chat-reply-form__error {
  padding: 6px 8px;
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
  border-radius: 3px;
  font-size: 11px;
}

.chat-reply-form__actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.chat-reply-form__btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-reply-form__btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #999;
}

.chat-reply-form__btn--submit {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.chat-reply-form__btn--submit:hover:not(:disabled) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.chat-reply-form__btn--cancel {
  background-color: #f5f5f5;
  color: #333;
}

.chat-reply-form__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
