<template>
  <div class="flex items-center flex-wrap gap-1 p-2 rounded-md border bg-background">
    <Badge
        v-for="tag in modelValue"
        :key="tag"
        variant="secondary"
        class="flex items-center"
    >
      {{ tag }}
      <button
          @click.prevent="removeTag(tag)"
          class="ml-1 hover:text-destructive focus:outline-none"
      >
        <XIcon class="h-3 w-3" />
      </button>
    </Badge>

    <input
        ref="inputRef"
        type="text"
        v-model="inputValue"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[80px] focus:outline-none bg-transparent"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        @keydown.delete="handleDelete"
        @keydown.tab="addTag"
        @keydown.comma.prevent="addTag"
        @blur="addTag"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { XIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Add tag...'
  }
})

const emit = defineEmits(['update:modelValue'])
const inputValue = ref('')
const inputRef = ref(null)

function addTag() {
  const value = inputValue.value.trim()
  if (value && !props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
  }
  inputValue.value = ''
}

function removeTag(tag) {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}

function handleBackspace(e) {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newTags = [...props.modelValue]
    newTags.pop()
    emit('update:modelValue', newTags)
  }
}

function handleDelete(e) {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newTags = [...props.modelValue]
    newTags.pop()
    emit('update:modelValue', newTags)
  }
}
</script>