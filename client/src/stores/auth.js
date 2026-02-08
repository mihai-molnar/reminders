import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
  }

  async function register(email, password) {
    const res = await api.post('/auth/register', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      user.value = res.data.user
    } catch {
      logout()
    }
  }

  async function upgradeToPaid() {
    const res = await api.post('/payments/create-checkout-session')
    window.location.href = res.data.url
  }

  return { user, token, isLoggedIn, login, register, logout, fetchUser, upgradeToPaid }
})
