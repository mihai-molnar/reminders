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
          <button v-if="auth.user?.plan === 'free'" @click="auth.upgradeToPaid()"
            class="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
            Upgrade
          </button>
          <span v-else
            class="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
            Paid plan
          </span>
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
