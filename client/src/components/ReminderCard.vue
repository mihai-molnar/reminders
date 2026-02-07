<script setup>
import { computed } from 'vue'
import { formatDistanceToNow, isPast, format } from 'date-fns'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const props = defineProps({
  reminder: { type: Object, required: true },
})

const emit = defineEmits(['complete', 'delete', 'edit'])

const isPaid = computed(() => auth.user?.plan === 'paid')

const isOverdue = computed(() => isPast(new Date(props.reminder.next_due)))

const dueText = computed(() => {
  const date = new Date(props.reminder.next_due)
  if (isOverdue.value) {
    return `Overdue by ${formatDistanceToNow(date)}`
  }
  return `Due ${formatDistanceToNow(date, { addSuffix: true })}`
})

const dueDate = computed(() => format(new Date(props.reminder.next_due), 'MMM d, yyyy'))

const intervalText = computed(() => {
  const v = props.reminder.interval_value
  const u = props.reminder.interval_unit
  return `Every ${v} ${v === 1 ? u.slice(0, -1) : u}`
})
</script>

<template>
  <div class="bg-white rounded-lg border p-4" :class="isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">{{ reminder.title }}</h3>
        <p v-if="reminder.description" class="text-sm text-gray-500 mt-1">{{ reminder.description }}</p>
        <div class="flex items-center gap-3 mt-2 text-sm">
          <span :class="isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'">{{ dueText }}</span>
          <span class="text-gray-400">{{ dueDate }}</span>
          <span class="text-gray-400">{{ intervalText }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-4">
        <button @click="emit('complete', reminder.id)"
          class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition">
          Done
        </button>
        <router-link v-if="isPaid" :to="`/reminders/${reminder.id}/history`"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
          History
        </router-link>
        <button @click="emit('edit', reminder)"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
          Edit
        </button>
        <button @click="emit('delete', reminder.id)"
          class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
