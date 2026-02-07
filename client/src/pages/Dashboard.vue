<script setup>
import { ref, onMounted } from 'vue'
import { useRemindersStore } from '../stores/reminders'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import ReminderList from '../components/ReminderList.vue'
import ReminderForm from '../components/ReminderForm.vue'
import api from '../lib/api'

const store = useRemindersStore()
const auth = useAuthStore()
const router = useRouter()

const showForm = ref(false)
const editing = ref(null)
const error = ref('')
const triggerMsg = ref('')

async function triggerNotifications() {
  triggerMsg.value = 'Sending...'
  try {
    await api.post('/notifications/trigger')
    triggerMsg.value = 'Done — check Mailtrap'
  } catch {
    triggerMsg.value = 'Failed'
  }
  setTimeout(() => { triggerMsg.value = '' }, 3000)
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  store.fetchReminders()
})

async function handleCreate(data) {
  error.value = ''
  try {
    await store.createReminder(data)
    showForm.value = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create reminder'
  }
}

async function handleUpdate(data) {
  error.value = ''
  try {
    await store.updateReminder(editing.value.id, data)
    editing.value = null
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to update reminder'
  }
}

async function handleComplete(id) {
  await store.completeReminder(id)
}

async function handleDelete(id) {
  if (confirm('Delete this reminder?')) {
    await store.deleteReminder(id)
  }
}

function startEdit(reminder) {
  editing.value = reminder
  showForm.value = false
}

function cancelEdit() {
  editing.value = null
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div class="flex items-center gap-2">
        <button @click="triggerNotifications"
          class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
          Send notifications
        </button>
        <span v-if="triggerMsg" class="text-xs text-gray-500">{{ triggerMsg }}</span>
        <button v-if="!showForm && !editing" @click="showForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          + New Reminder
        </button>
      </div>
    </div>

    <p v-if="error" class="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{{ error }}</p>

    <div v-if="showForm" class="mb-6">
      <ReminderForm @submit="handleCreate" @cancel="showForm = false" />
    </div>

    <div v-if="editing" class="mb-6">
      <ReminderForm :editing="editing" @submit="handleUpdate" @cancel="cancelEdit" />
    </div>

    <p v-if="store.loading" class="text-gray-500">Loading...</p>

    <template v-else>
      <div class="space-y-6">
        <ReminderList
          title="Overdue"
          :reminders="store.overdue"
          @complete="handleComplete"
          @delete="handleDelete"
          @edit="startEdit"
        />
        <ReminderList
          title="Upcoming"
          :reminders="store.upcoming"
          @complete="handleComplete"
          @delete="handleDelete"
          @edit="startEdit"
        />
      </div>

      <p v-if="!store.loading && store.reminders.length === 0" class="text-gray-500 mt-4">
        No reminders yet. Create your first one!
      </p>
    </template>
  </div>
</template>
