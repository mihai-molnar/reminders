<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isPaid = computed(() => auth.user?.plan === 'paid')

const props = defineProps({
  editing: { type: Object, default: null },
})

const emit = defineEmits(['submit', 'cancel'])

const title = ref('')
const description = ref('')
const interval_value = ref(1)
const interval_unit = ref('months')
const today = new Date().toISOString().slice(0, 10)
const next_due = ref(today)
const webhook_url = ref('')
const error = ref('')

watch(() => props.editing, (val) => {
  if (val) {
    title.value = val.title
    description.value = val.description || ''
    interval_value.value = val.interval_value
    interval_unit.value = val.interval_unit
    next_due.value = val.next_due ? val.next_due.slice(0, 10) : ''
    webhook_url.value = val.webhook_url || ''
  } else {
    reset()
  }
}, { immediate: true })

function reset() {
  title.value = ''
  description.value = ''
  interval_value.value = 1
  interval_unit.value = 'months'
  next_due.value = today
  webhook_url.value = ''
  error.value = ''
}

function handleSubmit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }
  if (interval_value.value < 1) {
    error.value = 'Interval must be at least 1'
    return
  }

  const data = {
    title: title.value.trim(),
    description: description.value.trim() || null,
    interval_value: Number(interval_value.value),
    interval_unit: interval_unit.value,
  }
  if (next_due.value) {
    data.next_due = new Date(next_due.value).toISOString()
  }
  if (isPaid.value) {
    data.webhook_url = webhook_url.value.trim() || null
  }

  emit('submit', data)
  if (!props.editing) reset()
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
    <h2 class="font-semibold text-gray-900">{{ editing ? 'Edit Reminder' : 'New Reminder' }}</h2>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input v-model="title" type="text" required placeholder="e.g. Change water filter"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
      <input v-model="description" type="text" placeholder="Any extra details"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Every</label>
        <input v-model.number="interval_value" type="number" min="1"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <select v-model="interval_unit"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">First due date</label>
        <input v-model="next_due" type="date"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <div v-if="isPaid">
      <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL (optional)</label>
      <input v-model="webhook_url" type="url" placeholder="https://example.com/webhook"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <p class="text-xs text-gray-400 mt-1">Receive a POST request when this reminder is due</p>
    </div>

    <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

    <div class="flex gap-2">
      <button type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        {{ editing ? 'Update' : 'Create' }}
      </button>
      <button v-if="editing" type="button" @click="emit('cancel')"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
        Cancel
      </button>
    </div>
  </form>
</template>
