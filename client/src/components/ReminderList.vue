<script setup>
import ReminderCard from './ReminderCard.vue'

defineProps({
  reminders: { type: Array, required: true },
  title: { type: String, required: true },
})

const emit = defineEmits(['complete', 'delete', 'edit'])
</script>

<template>
  <div v-if="reminders.length > 0">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ title }}</h2>
    <div class="space-y-3">
      <ReminderCard
        v-for="reminder in reminders"
        :key="reminder.id"
        :reminder="reminder"
        @complete="emit('complete', $event)"
        @delete="emit('delete', $event)"
        @edit="emit('edit', $event)"
      />
    </div>
  </div>
</template>
