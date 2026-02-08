<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  await auth.fetchUser()
  loading.value = false
})

function goToDashboard() {
  router.push('/')
}
</script>

<template>
  <div class="max-w-md mx-auto text-center py-12">
    <div v-if="loading" class="text-gray-500">Confirming your upgrade...</div>
    <template v-else>
      <div class="text-4xl mb-4">&#10003;</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Upgrade Successful!</h1>
      <p class="text-gray-600 mb-6">
        Your account has been upgraded to the paid plan. You now have unlimited reminders,
        completion history, and webhook notifications.
      </p>
      <button @click="goToDashboard"
        class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Go to Dashboard
      </button>
    </template>
  </div>
</template>
