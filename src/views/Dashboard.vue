<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Dashboard'" />

    <div class="space-y-4">
      <div v-if="error" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="card in cards" :key="card.title" class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ card.title }}</p>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              <component :is="card.icon" class="h-5 w-5" />
            </span>
          </div>
          <p v-if="loading" class="mt-3 h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></p>
          <p v-else class="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{{ card.value }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { apiFetch } from '@/services/api'
import { BoxIcon, ListIcon, UserGroupIcon } from '@/icons'

interface TotalAdsResponse {
  success: boolean
  totalAds: number
}

interface TotalCategoriesResponse {
  success: boolean
  totalCategories: number
}

interface TotalUsersResponse {
  success: boolean
  totalUsers: number
}

const loading = ref(true)
const error = ref('')
const totalAds = ref(0)
const totalCategories = ref(0)
const totalUsers = ref(0)

const cards = computed(() => [
  { title: 'Ads', value: totalAds.value, icon: BoxIcon },
  { title: 'Categories', value: totalCategories.value, icon: ListIcon },
  { title: 'Users', value: totalUsers.value, icon: UserGroupIcon },
])

const fetchStats = async () => {
  loading.value = true
  error.value = ''

  try {
    const [adsResponse, categoriesResponse, usersResponse] = await Promise.all([
      apiFetch<TotalAdsResponse>('/api/admin/stats/total-ads', { method: 'GET' }),
      apiFetch<TotalCategoriesResponse>('/api/admin/stats/total-categories', { method: 'GET' }),
      apiFetch<TotalUsersResponse>('/api/admin/stats/total-users', { method: 'GET' }),
    ])

    totalAds.value = adsResponse.totalAds ?? 0
    totalCategories.value = categoriesResponse.totalCategories ?? 0
    totalUsers.value = usersResponse.totalUsers ?? 0
  } catch (err) {
    const errorObj = err as Error & { payload?: { message?: string } }
    error.value = errorObj?.payload?.message || errorObj.message || 'Failed to load dashboard stats.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>
