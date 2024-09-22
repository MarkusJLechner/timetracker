<template>
  <div
    class="h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5 flex flex-col items-center justify-center"
  >
    <!-- Main Container -->
    <div
      :class="[
        'relative rounded-2xl shadow-xl p-[2px] max-w-md w-full overflow-hidden flex flex-col items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg min-h-[230px]',
        isRunning ? 'border-animation' : ''
      ]"
    >
      <div
        class="relative rounded-2xl shadow-xl p-6 max-w-md h-full w-full overflow-hidden flex flex-col items-center bg-gradient-to-tl from-[#C44ECB] to-[#895DF4]"
      >
        <!-- Timer Display -->
        <div class="text-center text-white text-4xl font-bold mb-6">
          {{ currentTimer }}
          <span v-if="isRunning" class="text-sm block mt-2"
            >Current:
            <span class="text-yellow-300">{{
              timerEvents[timerEvents.length - 1].details
            }}</span></span
          >
        </div>
        <!-- Task Input -->
        <div class="mb-4 w-full">
          <InputAutocomplete
            v-model="taskInput"
            placeholder="Enter your task #tag @project"
            @keydown.enter="startTimer"
          />
        </div>

        <!-- Tag List -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="(comment, tag) in commentMap"
            :key="tag"
            @click="selectOption(tag)"
            class="relative bg-gray-200 bg-opacity-10 text-gray-200 text-xs font-semibold px-2 py-1 rounded cursor-pointer hover:bg-gray-500 border border-transparent hover:border-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Control Buttons -->
        <div class="flex items-center justify-center space-x-4">
          <button
            @click="startTimer"
            :disabled="!taskInput"
            class="rounded-full bg-green-500 p-4 shadow-lg text-white hover:bg-green-600 focus:outline-none transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Play Icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 3v18l15-9L5 3z" />
            </svg>
          </button>
          <button
            @click="stopTimer"
            :disabled="!isRunning"
            class="rounded-full bg-red-500 p-4 shadow-lg text-white hover:bg-red-600 focus:outline-none transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Stop Icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Events and Summary Section -->
    <div class="flex flex-wrap justify-center w-full max-w-4xl mt-4 gap-4">
      <!-- Events List -->
      <div
        class="bg-gradient-to-tl from-[#C44ECB] to-[#895DF4] bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-4 w-full max-w-sm"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="text-white text-xl font-semibold">Events</div>
          <button @click="clearEvents" class="text-white underline focus:outline-none text-sm">
            Clear
          </button>
        </div>
        <ul class="text-white overflow-y-auto max-h-40 space-y-2">
          <li
            v-for="(event, index) in reversedTimerEvents"
            :key="index"
            class="p-3 rounded-lg bg-white bg-opacity-20 text-sm"
          >
            <div class="flex justify-between items-center">
              <div class="font-semibold">Task:</div>
              <div class="text-yellow-300 truncate">{{ event.details }}</div>
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="font-semibold">Start:</div>
              <div>{{ new Date(event.startTime).toLocaleTimeString('de-AT') }}</div>
            </div>
            <div v-if="event.endTime" class="flex justify-between items-center mt-1">
              <div class="font-semibold">End:</div>
              <div>{{ new Date(event.endTime).toLocaleTimeString('de-AT') }}</div>
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="font-semibold">Duration:</div>
              <div class="text-yellow-300">
                {{ formatDuration(event.startTime, event.endTime) }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <!-- Summary Section -->
      <div
        class="bg-gradient-to-tl from-[#C44ECB] to-[#895DF4] backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-4 w-full max-w-sm"
      >
        <div class="text-white text-xl font-semibold mb-2">Summary</div>
        <ul class="text-white space-y-1 text-sm overflow-y-auto max-h-40">
          <li v-for="(duration, tag) in tagDurations" :key="tag" class="flex justify-between">
            <div>{{ tag }}:</div>
            <div class="text-yellow-300">{{ formatDuration(0, duration) }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { nextTick, onMounted, ref, watch, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import InputAutocomplete from '@/components/InputAutocomplete.vue'

const taskInput = ref('')
const currentTimer = ref('00:00:00')
const isRunning = ref(false)
let intervalId: number | null = null

const timerEvents = useLocalStorage<{ startTime: number; details: string }[]>('timerEvents', [])

const tagDurations = ref<{ [key: string]: number }>({})

const commentMap: Record<string, string> = {
  '#o': 'Organisatorisches',
  '#m': 'Meeting',
  '#d': 'Daily',
  '#w': 'Weekly',
  '#div': 'Diverses',
  '#Tb': 'Team blue',
  '#f': 'feature',
  '#t': 'testen',
  '#pr': 'pull request',
  '#r': 'Refactoring',
  '#re': 'Release',
  '#b': 'bugfix',
  '#e2e': 'e2e',
  '#ts': 'technischer Support'
}

function selectOption(tag: string) {
  taskInput.value += tag

  focusInput()
}

const reversedTimerEvents = computed(() => timerEvents.value.slice().reverse())
watch(timerEvents, calculateTagDurations, { deep: true })

function calculateTagDurations() {
  const durations: { [key: string]: number } = {}

  timerEvents.value.forEach((event) => {
    if (event.details.includes('#')) {
      const tags = event.details.match(/#\w+/g) || []
      const duration = event.endTime ? event.endTime - event.startTime : 0

      tags.forEach((tag) => {
        if (!durations[tag]) {
          durations[tag] = 0
        }
        durations[tag] += duration
      })
    }
  })

  tagDurations.value = durations
}

function startTimer() {
  if (!taskInput.value) {
    return
  }

  if (isRunning.value) {
    clearInterval(intervalId!)
    currentTimer.value = '00:00:00'
  }

  if (timerEvents.value.length > 0 && !timerEvents.value[timerEvents.value.length - 1].endTime) {
    timerEvents.value[timerEvents.value.length - 1].endTime = Date.now()
  }

  isRunning.value = true
  const startTime = Date.now()
  timerEvents.value.push({ startTime, details: taskInput.value })

  intervalId = setInterval(() => {
    const currentTime = Date.now()
    const elapsedTime = Math.floor(
      (currentTime - timerEvents.value[timerEvents.value.length - 1].startTime) / 1000
    )
    const hrs = String(Math.floor(elapsedTime / 3600)).padStart(2, '0')
    const mins = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0')
    const secs = String(elapsedTime % 60).padStart(2, '0')
    currentTimer.value = `${hrs}:${mins}:${secs}`
  }, 1000)

  taskInput.value = ''
  focusInput()
}

function resumeLastTimer() {
  if (timerEvents.value.length === 0 || timerEvents.value[timerEvents.value.length - 1].endTime) {
    return
  }

  isRunning.value = true
  const lastEvent = timerEvents.value[timerEvents.value.length - 1]
  const startTime = lastEvent.startTime

  function setTime() {
    const currentTime = Date.now()
    const elapsedTime = Math.floor((currentTime - startTime) / 1000)
    const hrs = String(Math.floor(elapsedTime / 3600)).padStart(2, '0')
    const mins = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0')
    const secs = String(elapsedTime % 60).padStart(2, '0')
    currentTimer.value = `${hrs}:${mins}:${secs}`
  }

  setTime()

  intervalId = setInterval(() => {
    setTime()
  }, 1000)
}

function stopTimer() {
  if (isRunning.value) {
    clearInterval(intervalId!)
    isRunning.value = false
  }

  currentTimer.value = '00:00:00'

  if (timerEvents.value.length > 0) {
    timerEvents.value[timerEvents.value.length - 1].endTime = Date.now()
  }

  focusInput()
}

function clearEvents() {
  stopTimer()
  timerEvents.value = []
}

function formatDuration(startTime: number, endTime: number): string {
  endTime ??= Date.now()
  const duration = Math.floor((endTime - startTime) / 1000)
  const hrs = String(Math.floor(duration / 3600)).padStart(2, '0')
  const mins = String(Math.floor((duration % 3600) / 60)).padStart(2, '0')
  const secs = String(duration % 60).padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

onMounted(() => {
  focusInput()
  calculateTagDurations()
  resumeLastTimer()
})

function focusInput() {
  nextTick(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
}
</script>

<style scoped>
.border-animation::before {
  content: '';
  position: absolute;
  inset: -160px;
  background: conic-gradient(transparent 270deg, #ffff00, transparent);
  animation: rotate 4s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  from {
    transform: rotate(0turn);
  }
  to {
    transform: rotate(1turn);
  }
}

.neumorphism {
  box-shadow:
    20px 20px 50px rgba(0, 0, 0, 0.8),
    -20px -20px 50px rgba(255, 255, 255, 0.05);
}

.neumorphism-input {
  box-shadow:
    inset 5px 5px 10px rgba(0, 0, 0, 0.6),
    inset -5px -5px 10px rgba(255, 255, 255, 0.1);
}

.neumorphism-button {
  box-shadow:
    0 10px 15px rgba(0, 0, 0, 0.5),
    0 -10px 15px rgba(255, 255, 255, 0.05);
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 10px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
