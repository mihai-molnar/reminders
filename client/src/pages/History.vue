<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRemindersStore } from '../stores/reminders'
import { useAuthStore } from '../stores/auth'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const store = useRemindersStore()
const auth = useAuthStore()

const reminder = ref(null)
const history = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const data = await store.fetchHistory(route.params.id)
    reminder.value = data.reminder
    history.value = data.history
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load history'
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  return format(new Date(dateStr), 'MMM d, yyyy h:mm a')
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/" class="text-blue-600 hover:underline text-sm">&larr; Back</router-link>
      <h1 class="text-2xl font-bold text-gray-900">Completion History</h1>
    </div>

    <p v-if="loading" class="text-gray-500">Loading...</p>

    <p v-else-if="error" class="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{{ error }}</p>

    <template v-else>
      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 class="font-semibold text-gray-900">{{ reminder.title }}</h2>
        <p v-if="reminder.description" class="text-sm text-gray-500 mt-1">{{ reminder.description }}</p>
        <p class="text-sm text-gray-400 mt-1">Every {{ reminder.interval_value }} {{ reminder.interval_unit }}</p>
      </div>

      <div v-if="history.length === 0" class="text-gray-500 text-sm">
        No completions recorded yet. Mark this reminder as done to start tracking history.
      </div>

      <div v-else class="space-y-3">
        <div v-for="entry in history" :key="entry.id"
          class="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-900">Completed {{ formatDate(entry.completed_at) }}</p>
            <p v-if="entry.notes" class="text-sm text-gray-500 mt-1">{{ entry.notes }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
