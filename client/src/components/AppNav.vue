<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="bg-white shadow">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <router-link to="/" class="text-xl font-bold text-gray-900">Reminders</router-link>
      <div class="flex items-center gap-4">
        <template v-if="auth.isLoggedIn">
          <span class="text-sm text-gray-600">{{ auth.user?.email }}</span>
          <button @click="auth.togglePlan()"
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="auth.user?.plan === 'paid'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ auth.user?.plan }} plan
          </button>
          <button @click="logout" class="text-sm text-red-600 hover:underline">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-sm text-blue-600 hover:underline">Login</router-link>
          <router-link to="/register" class="text-sm text-blue-600 hover:underline">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>
