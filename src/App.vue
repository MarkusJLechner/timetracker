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
            <span class="text-yellow-300 cursor-pointer" @click="openEditDialog(0)">{{
              timerEvents[timerEvents.length - 1]?.details
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
            v-for="(comment, tag) in taskList"
            :key="tag"
            @click="selectOption(tag)"
            :title="comment"
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
          <div class="flex space-x-2">
            <button @click="openAddDialog" class="text-white underline focus:outline-none text-sm">
              Add
            </button>
            <button @click="clearEvents" class="text-white underline focus:outline-none text-sm">
              Clear
            </button>
          </div>
        </div>
        <ul class="text-white overflow-y-auto max-h-[150px] space-y-2">
          <li
            v-for="(event, index) in reversedTimerEvents"
            :key="index"
            class="p-3 rounded-lg bg-white bg-opacity-20 text-sm relative group"
          >
            <div class="flex justify-between items-center">
              <div class="font-semibold">Task:</div>
              <div class="text-yellow-300 truncate cursor-pointer" @click="openEditDialog(index)">
                {{ event.details }}
              </div>
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="font-semibold">Start:</div>
              <div class="cursor-pointer" @click="openEditDialog(index)">
                {{ new Date(event.startTime).toLocaleTimeString('de-AT') }}
              </div>
            </div>
            <div v-if="event.endTime" class="flex justify-between items-center mt-1">
              <div class="font-semibold">End:</div>
              <div class="cursor-pointer" @click="openEditDialog(index)">
                {{ new Date(event.endTime).toLocaleTimeString('de-AT') }}
              </div>
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="font-semibold">Duration:</div>
              <div class="text-yellow-300">
                {{ formatDuration(event.startTime, event.endTime) }}
              </div>
            </div>
            <button
              @click="deleteEvent(index)"
              class="absolute text-[11px] top-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              delete
            </button>
          </li>
        </ul>
      </div>
      <!-- Summary Section -->
      <div
        class="bg-gradient-to-tl from-[#C44ECB] to-[#895DF4] backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-4 w-full max-w-sm"
      >
        <div class="text-white text-xl font-semibold mb-2 justify-between flex">
          Summary<span class="text-yellow-300">{{ totalDuration }}</span>
        </div>
        <ul class="text-white space-y-1 text-sm overflow-y-auto max-h-[450px]">
          <li v-for="(data, tag) in tagDurations" :key="tag" class="flex justify-between">
            <div>
              {{ tag }}:
              <span class="text-orange-300 text-xs">{{ data.description.join('; ') }}</span>
            </div>
            <div class="text-yellow-300">{{ formatDuration(0, data.duration) }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Edit/Add Event Modal -->
  <div
    v-if="isEditingEvent"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px]"
    @click.self="cancelEdit"
  >
    <div
      class="bg-gradient-to-tl from-[#C44ECB] to-[#895DF4] p-6 rounded-lg w-80 text-white relative edit-dialog"
      @keydown.esc="cancelEdit"
      @keydown.enter="saveEditedEvent"
      tabindex="0"
    >
      <h2 class="text-xl font-semibold mb-4">
        {{ editingEventIndex !== null ? 'Edit' : 'Add' }} Event
      </h2>
      <div class="mb-4">
        <label class="block text-sm font-medium">Task Details</label>
        <input
          v-model="editingEvent.details"
          id="inputEditDetails"
          autofocus
          class="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white p-2"
        />
      </div>
      <!-- Start Date and Time -->
      <div class="mb-4 flex space-x-2">
        <div class="w-1/2">
          <label class="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            v-model="formattedStartDate"
            class="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white p-2"
          />
        </div>
        <div class="w-1/2">
          <label class="block text-sm font-medium">Start Time</label>
          <input
            type="time"
            v-model="formattedStartTime"
            class="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white p-2"
          />
        </div>
      </div>
      <!-- End Date and Time -->
      <div class="mb-4 flex space-x-2">
        <div class="w-1/2">
          <label class="block text-sm font-medium">End Date</label>
          <input
            type="date"
            v-model="formattedEndDate"
            class="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white p-2"
          />
        </div>
        <div class="w-1/2">
          <label class="block text-sm font-medium">End Time</label>
          <input
            type="time"
            v-model="formattedEndTime"
            class="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white p-2"
          />
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <button @click="cancelEdit" class="mr-2 px-4 py-2 bg-gray-500 rounded hover:bg-gray-600">
          Cancel
        </button>
        <button @click="saveEditedEvent" class="px-4 py-2 bg-green-500 rounded hover:bg-green-600">
          Save
        </button>
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

const timerEvents = useLocalStorage<{ startTime: number; endTime?: number; details: string }[]>(
  'timerEvents',
  []
)
const notifyHours = ref(-1)

watch(currentTimer, (newVal) => {
  const lastEvent = timerEvents.value[timerEvents.value.length - 1]
  const titlePrefix = lastEvent ? lastEvent.details.split(':')[0] : ''
  document.title = `${titlePrefix} - ${newVal}`

  calculateTagDurations()
})

const getTimeInMinutes = (time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return { hours, minutes, seconds }
}

watch(isRunning, (newVal) => {
  if (!newVal) {
    document.title = 'Time Tracker'
  }
})

const deleteEvent = (index: number) => {
  if (confirm('Are you sure you want to delete this event?')) {
    const originalIndex = timerEvents.value.length - 1 - index
    timerEvents.value = [
      ...timerEvents.value.slice(0, originalIndex),
      ...timerEvents.value.slice(originalIndex + 1)
    ]

    if (timerEvents.value.length === 0) {
      stopTimer()
    }
  }
}

const taskList: Record<string, string> = {
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

function selectOption(tag: string) {
  taskInput.value = tag.toLowerCase() + ': '

  focusInput(false)
}

const reversedTimerEvents = computed(() => timerEvents.value.slice().reverse())
watch(timerEvents, calculateTagDurations, { deep: true })

const tagDurations = ref<{ [key: string]: { duration: number; description: string[] } }>({})

const totalDuration = computed(() => {
  const totalSeconds = Object.values(tagDurations.value).reduce(
    (sum, { duration }) => sum + duration,
    0
  )
  return formatDuration(0, totalSeconds)
})

watch(totalDuration, (newVal) => {
  const { hours, minutes } = getTimeInMinutes(newVal)
  if (minutes === 50 && notifyHours.value !== hours) {
    notifyBreakTime()
    notifyHours.value = hours
  }
})

function calculateTagDurations() {
  const durations: Record<string, { duration: number; description: Set<string> }> = {}

  for (const event of timerEvents.value || []) {
    const tagMatch = event.details.match(/^(.*?):\s*(.*)$/)
    if (tagMatch) {
      const tag = tagMatch[1].trim()
      const description = tagMatch[2].trim()
      const duration = event.endTime
        ? event.endTime - event.startTime
        : new Date().getTime() - event.startTime

      if (!durations[tag]) {
        durations[tag] = { duration: 0, description: new Set() }
      }

      durations[tag].duration += duration
      durations[tag].description.add(description)
    }
  }

  tagDurations.value = Object.fromEntries(
    Object.entries(durations).map(([tag, { duration, description }]) => [
      tag,
      { duration, description: Array.from(description) }
    ])
  )
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

  startIntervalForCurrentTimer()

  taskInput.value = ''
  focusInput()

  notifyHours.value = -1
}

function resumeLastTimer() {
  if (timerEvents.value.length === 0 || timerEvents.value[timerEvents.value.length - 1].endTime) {
    return
  }

  isRunning.value = true
  startIntervalForCurrentTimer()
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
  if (confirm('Are you sure you want to clear all events?')) {
    stopTimer()
    timerEvents.value = []
  }
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

  requestNotificationPermission()
})

const requestNotificationPermission = () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission()
  }
}

const notifyBreakTime = () => {
  if (Notification.permission === 'granted') {
    new Notification('Time to take a break!', {
      body: 'You have been working for 50 minutes. Take a break.',
      icon: '/chill.webp'
    })
  }
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

function focusInput(blurOnMobile = true) {
  if (isMobile() && blurOnMobile) {
    setTimeout(() => {
      const input = document.querySelector('input')
      input?.blur()
    }, 2)
  }
  nextTick(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
}

const isEditingEvent = ref(false)
watch(isEditingEvent, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const input = document.getElementById('inputEditDetails')
      input?.select()
    })
  }
})
const editingEventIndex = ref<number | null>(null)
const editingEvent = ref<{ startTime: number | null; endTime: number | null; details: string }>({
  startTime: null,
  endTime: null,
  details: ''
})

function openEditDialog(index: number) {
  editingEventIndex.value = index
  const originalIndex = timerEvents.value.length - 1 - index
  editingEvent.value = { ...timerEvents.value[originalIndex] }
  isEditingEvent.value = true

  // Focus on the dialog to capture key events
  nextTick(() => {
    const dialog = document.querySelector('.edit-dialog')
    dialog?.focus()
  })
}

function openAddDialog() {
  const currentTime = Date.now()
  editingEventIndex.value = null
  editingEvent.value = { startTime: currentTime, endTime: currentTime, details: '' }
  isEditingEvent.value = true

  // Focus on the dialog to capture key events
  nextTick(() => {
    const dialog = document.querySelector('.edit-dialog')
    dialog?.focus()
  })
}

function saveEditedEvent() {
  const isEditingLastEvent =
    editingEventIndex.value !== null &&
    timerEvents.value.length > 0 &&
    timerEvents.value.length - 1 - editingEventIndex.value === timerEvents.value.length - 1 &&
    !timerEvents.value[timerEvents.value.length - 1].endTime

  if (
    editingEvent.value.startTime &&
    editingEvent.value.details &&
    (editingEvent.value.endTime || isEditingLastEvent)
  ) {
    if (editingEventIndex.value !== null) {
      // Editing existing event
      const originalIndex = timerEvents.value.length - 1 - editingEventIndex.value
      timerEvents.value[originalIndex] = { ...editingEvent.value }

      // If the edited event is the last event and timer is running, reset the interval
      if (originalIndex === timerEvents.value.length - 1 && isRunning.value) {
        startIntervalForCurrentTimer()
      }
    } else {
      // Adding new event
      const newEvent = { ...editingEvent.value }
      // Ensure endTime is provided when adding a new event
      if (!newEvent.endTime) {
        alert('Please provide an End Time for the new event.')
        return
      }
      timerEvents.value.push(newEvent)
      // Sort events by startTime
      timerEvents.value.sort((a, b) => a.startTime - b.startTime)
    }

    isEditingEvent.value = false
  } else {
    alert('Please fill in all required fields.')
  }
}

function cancelEdit() {
  isEditingEvent.value = false
}

const formattedStartDate = computed({
  get() {
    if (!editingEvent.value.startTime) return ''
    const date = new Date(editingEvent.value.startTime)
    return date.toISOString().slice(0, 10)
  },
  set(value: string) {
    updateEditingEventStart(value, formattedStartTime.value)
  }
})

const formattedStartTime = computed({
  get() {
    if (!editingEvent.value.startTime) return ''
    const date = new Date(editingEvent.value.startTime)
    return date.toTimeString().slice(0, 5)
  },
  set(value: string) {
    updateEditingEventStart(formattedStartDate.value, value)
  }
})

const formattedEndDate = computed({
  get() {
    if (!editingEvent.value.endTime) return ''
    const date = new Date(editingEvent.value.endTime)
    return date.toISOString().slice(0, 10)
  },
  set(value: string) {
    updateEditingEventEnd(value, formattedEndTime.value)
  }
})

const formattedEndTime = computed({
  get() {
    if (!editingEvent.value.endTime) return ''
    const date = new Date(editingEvent.value.endTime)
    return date.toTimeString().slice(0, 5)
  },
  set(value: string) {
    updateEditingEventEnd(formattedEndDate.value, value)
  }
})

function updateEditingEventStart(dateString: string, timeString: string) {
  if (dateString && timeString) {
    editingEvent.value.startTime = new Date(`${dateString}T${timeString}`).getTime()
  } else {
    editingEvent.value.startTime = null
  }
}

function updateEditingEventEnd(dateString: string, timeString: string) {
  if (dateString && timeString) {
    editingEvent.value.endTime = new Date(`${dateString}T${timeString}`).getTime()
  } else {
    editingEvent.value.endTime = null
  }
}

function startIntervalForCurrentTimer() {
  clearInterval(intervalId!)
  intervalId = setInterval(() => {
    try {
      const currentTime = Date.now()
      const lastEvent = timerEvents.value[timerEvents.value.length - 1]
      if (!lastEvent || !lastEvent.startTime) {
        currentTimer.value = '00:00:00'
        return
      }
      const elapsedTime = Math.floor((currentTime - lastEvent.startTime) / 1000)
      if (isNaN(elapsedTime) || elapsedTime < 0) {
        currentTimer.value = '00:00:00'
        return
      }
      const hrs = String(Math.floor(elapsedTime / 3600)).padStart(2, '0')
      const mins = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0')
      const secs = String(elapsedTime % 60).padStart(2, '0')
      currentTimer.value = `${hrs}:${mins}:${secs}`
    } catch (e) {
      console.error('Error updating currentTimer:', e)
      currentTimer.value = '00:00:00'
    }
  }, 1000)
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
