<template>
  <div style="position: relative">
    <input
      ref="inputField"
      v-model="taskInput"
      type="text"
      placeholder="Enter your task"
      class="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
      @keydown.enter="onEnterKey"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.esc="hidePopover"
      @blur="waitHidePopover"
      @input="onInput"
    />

    <button
      v-if="taskInput"
      @click="clearInput"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-500 bg-opacity-15 hover:bg-gray-400 text-white px-2 py-1 rounded-full"
    >
      ✕
    </button>

    <teleport to="body">
      <ul
        v-if="filteredOptions.length"
        ref="autocompleteList"
        class="autocomplete-list absolute bg-white border rounded-lg shadow-lg text-sm"
        :style="autocompleteStyle"
      >
        <li
          v-for="(option, index) in filteredOptions"
          :key="option"
          :class="{ selected: index === selectedOptionIndex }"
          @click="selectOption(index)"
          class="px-3 py-2 cursor-pointer flex"
        >
          <span>{{ option }}</span>
          <span class="text-gray-400 text-xs ml-2 mt-[3px]">
            {{ getCommentForOption(option) }}
          </span>
        </li>
      </ul>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'

const taskInput = defineModel({ required: true })
const autocompleteOptions = [
  'o', // Organisatorisches
  'm', // Meeting
  'd', // Daily
  'w', // Weekly
  'div', // Diverses
  'tb', // Team blue
  'f', // feature (Dev-Team)
  't', // testen (Dev-Team)
  'pr', // pull request (Dev-Team)
  'r', // Refactoring (Dev-Team)
  're', // Release (Dev-Team)
  'b', // bugfix (Dev-Team)
  'e2e', // e2e (Dev-Team)
  'ts' // technischer Support (Dev-Team)
]

const clearInput = () => {
  taskInput.value = ''
  hidePopover()
  focusInput()
}

function focusInput() {
  nextTick(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
}

const filteredOptions = ref<string[]>([])
const selectedOptionIndex = ref(-1)
const cursorPosition = ref(0)
const inputField = ref<HTMLInputElement | null>(null)
const inputHeight = ref(0)
const inputCoords = ref({ top: 0, left: 0, width: 0 })

const getCommentForOption = (option: string) => {
  const commentMap: Record<string, string> = {
    o: 'Organisatorisches',
    m: 'Meeting',
    d: 'Daily',
    w: 'Weekly',
    div: 'Diverses',
    tb: 'Team blue',
    f: 'feature',
    t: 'testen',
    pr: 'pull request',
    r: 'Refactoring',
    re: 'Release',
    b: 'bugfix',
    e2e: 'e2e',
    ts: 'technischer Support'
  }
  return commentMap[option] || ''
}

const onInput = (event: Event) => {
  const inputElem = event.target as HTMLInputElement
  const inputValue = inputElem.value
  const cursorPos = inputElem.selectionStart || 0

  cursorPosition.value = cursorPos

  // Match the first word in the input
  const textBeforeCursor = inputValue.slice(0, cursorPos)
  const match = textBeforeCursor.toLowerCase().match(/^\s*(\S*)$/)
  if (match) {
    const inputText = match[1]
    filteredOptions.value = autocompleteOptions.filter((option) =>
      option.toLowerCase().startsWith(inputText.toLowerCase())
    )

    if (filteredOptions.value.length > 0) {
      selectedOptionIndex.value = 0
      nextTick(() => {
        if (inputField.value) {
          const rect = inputField.value.getBoundingClientRect()
          inputCoords.value = {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
          }
          inputField.value.focus()
        }
      })
    } else {
      hidePopover()
    }
  } else {
    hidePopover()
  }
}

const onArrowDown = () => {
  if (filteredOptions.value.length > 0) {
    if (selectedOptionIndex.value < filteredOptions.value.length - 1) {
      selectedOptionIndex.value++
    } else {
      selectedOptionIndex.value = 0
    }
  }
}
const onArrowUp = () => {
  if (filteredOptions.value.length > 0) {
    if (selectedOptionIndex.value > 0) {
      selectedOptionIndex.value--
    } else {
      selectedOptionIndex.value = filteredOptions.value.length - 1
    }
  }
}

const onEnterKey = (event: KeyboardEvent) => {
  if (filteredOptions.value.length > 0 && selectedOptionIndex.value >= 0) {
    event.stopPropagation()
    event.preventDefault()
    insertOption()
  }
}

const insertOption = () => {
  const option = filteredOptions.value[selectedOptionIndex.value]
  const inputValue = taskInput.value
  const cursorPos = cursorPosition.value

  const textBeforeCursor = inputValue.slice(0, cursorPos)
  const match = textBeforeCursor.match(/^\s*(\S*)$/)
  if (match) {
    const wordStartIndex = cursorPos - match[1].length
    const newValue =
      inputValue.slice(0, wordStartIndex) + option + ': ' + inputValue.slice(cursorPos)
    taskInput.value = newValue
    nextTick(() => {
      if (inputField.value) {
        const newCursorPos = wordStartIndex + option.length + 2 // +2 for ': '
        inputField.value.setSelectionRange(newCursorPos, newCursorPos)
        inputField.value.focus()
        cursorPosition.value = newCursorPos
      }
    })
    hidePopover()
  }
}

const selectOption = (index: number) => {
  selectedOptionIndex.value = index
  insertOption()
}

const waitHidePopover = () => {
  setTimeout(() => {
    hidePopover()
  }, 150)
}

const hidePopover = () => {
  filteredOptions.value = []
  selectedOptionIndex.value = -1
}

onMounted(() => {
  if (inputField.value) {
    inputHeight.value = inputField.value.offsetHeight
  }
})

const autocompleteStyle = computed(() => ({
  position: 'absolute',
  top: `${inputCoords.value.top}px`,
  left: `${inputCoords.value.left}px`,
  width: `${inputCoords.value.width}px`,
  zIndex: 9999
}))
</script>

<style>
.autocomplete-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.autocomplete-list li.selected {
  background-color: #e2e8f0; /* Tailwind gray-200 */
}

.autocomplete-list li {
  display: flex;
}

.autocomplete-list li span.text-gray-400 {
  color: #a0aec0; /* Tailwind gray-400 */
}
</style>
