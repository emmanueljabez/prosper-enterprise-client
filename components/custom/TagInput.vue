<template>
  <div class="w-full space-y-2">
    <div class="flex flex-wrap gap-2">
      <div
          v-for="(tag, index) in modelValue"
          :key="index"
          class="flex items-center bg-muted text-muted-foreground rounded-md px-2 py-1 text-sm"
      >
        {{ tag }}
        <button
            type="button"
            @click="removeTag(index)"
            class="ml-1.5 h-3.5 w-3.5 rounded-full text-muted-foreground/70 hover:bg-muted-foreground/20 inline-flex items-center justify-center"
        >
          <span class="sr-only">Remove</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
    <div class="relative">
      <Input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          :placeholder="placeholder"
          @keydown.enter.prevent="addTag"
          @keydown.comma.prevent="addTag"
          @keydown.delete="handleDelete"
          @focus="isFocused = true"
          @blur="handleBlur"
      />
      <div
          v-if="isFocused && filteredSuggestions.length > 0"
          class="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-md"
      >
        <div
            v-for="(suggestion, index) in filteredSuggestions"
            :key="index"
            @mousedown.prevent="selectSuggestion(suggestion)"
            class="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Input } from '@/components/ui/input';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Type and press Enter...'
  },
  suggestions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const inputRef = ref(null);
const inputValue = ref('');
const isFocused = ref(false);

const filteredSuggestions = computed(() => {
  if (!inputValue.value) return [];
  return props.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.value.toLowerCase()) &&
      !props.modelValue.includes(suggestion)
  ).slice(0, 5); // Show max 5 suggestions
});

function addTag() {
  const value = inputValue.value.trim();
  if (value && !props.modelValue.includes(value)) {
    const newTags = [...props.modelValue, value];
    emit('update:modelValue', newTags);
  }
  inputValue.value = '';
}

function removeTag(index) {
  const newTags = [...props.modelValue];
  newTags.splice(index, 1);
  emit('update:modelValue', newTags);
}

function handleDelete() {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newTags = [...props.modelValue];
    newTags.pop();
    emit('update:modelValue', newTags);
  }
}

function selectSuggestion(suggestion) {
  if (!props.modelValue.includes(suggestion)) {
    const newTags = [...props.modelValue, suggestion];
    emit('update:modelValue', newTags);
  }
  inputValue.value = '';
}

function handleBlur() {
  // Delay to allow clicking suggestions
  setTimeout(() => {
    isFocused.value = false;
    if (inputValue.value.trim()) {
      addTag();
    }
  }, 200);
}
</script>