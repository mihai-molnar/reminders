<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function handleRegister() {
  error.value = ''
  try {
    await auth.register(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Registration failed'
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Register</h1>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="email" type="email" required
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input v-model="password" type="password" required minlength="6"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <button type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Register</button>
    </form>
    <p class="mt-4 text-sm text-gray-600">
      Already have an account? <router-link to="/login" class="text-blue-600 underline">Login</router-link>
    </p>
  </div>
</template>
