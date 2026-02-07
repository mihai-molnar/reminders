<script setup>
import { onMounted } from 'vue'
import AppNav from './components/AppNav.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.fetchUser()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNav />
    <main class="max-w-4xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>
