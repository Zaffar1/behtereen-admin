<template>
  <FullScreenLayout>
    <div class="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
        <h1 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Google Sign-In</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ statusMessage }}</p>
        <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
        <router-link to="/signin" class="mt-5 inline-block text-sm text-brand-500 hover:text-brand-600">
          Back to login
        </router-link>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { completeGoogleCallback } from '@/services/auth'

const route = useRoute()
const router = useRouter()
const statusMessage = ref('Verifying your Google account...')
const errorMessage = ref('')

onMounted(async () => {
  const loginCode = String(route.query.login_code || '')
  const queryError = String(route.query.message || '')

  if (queryError) {
    errorMessage.value = queryError
    statusMessage.value = 'Sign-in failed.'
    return
  }

  if (!loginCode) {
    errorMessage.value = 'Missing login code.'
    statusMessage.value = 'Sign-in failed.'
    return
  }

  try {
    await completeGoogleCallback(loginCode)
    statusMessage.value = 'Authentication successful. Redirecting...'
    await router.replace('/admin/dashboard')
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    errorMessage.value = err?.payload?.message || err.message || 'Google login failed.'
    statusMessage.value = 'Sign-in failed.'
  }
})
</script>
