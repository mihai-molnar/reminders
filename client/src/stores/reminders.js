import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../lib/api'

export const useRemindersStore = defineStore('reminders', () => {
  const reminders = ref([])
  const loading = ref(false)

  const overdue = computed(() =>
    reminders.value.filter((r) => r.is_active && new Date(r.next_due) <= new Date())
  )

  const upcoming = computed(() =>
    reminders.value.filter((r) => r.is_active && new Date(r.next_due) > new Date())
  )

  async function fetchReminders() {
    loading.value = true
    try {
      const res = await api.get('/reminders')
      reminders.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createReminder(data) {
    const res = await api.post('/reminders', data)
    reminders.value.push(res.data)
    return res.data
  }

  async function updateReminder(id, data) {
    const res = await api.put(`/reminders/${id}`, data)
    const idx = reminders.value.findIndex((r) => r.id === id)
    if (idx !== -1) reminders.value[idx] = res.data
    return res.data
  }

  async function deleteReminder(id) {
    await api.delete(`/reminders/${id}`)
    reminders.value = reminders.value.filter((r) => r.id !== id)
  }

  async function completeReminder(id, notes) {
    const res = await api.post(`/reminders/${id}/complete`, { notes: notes || null })
    const idx = reminders.value.findIndex((r) => r.id === id)
    if (idx !== -1) reminders.value[idx] = res.data
  }

  async function fetchHistory(id) {
    const res = await api.get(`/reminders/${id}/history`)
    return res.data
  }

  return { reminders, loading, overdue, upcoming, fetchReminders, createReminder, updateReminder, deleteReminder, completeReminder, fetchHistory }
})
