<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Ad Details'" />

    <div class="space-y-4">
      <div class="flex justify-end">
        <RouterLink
          :to="{ path: '/admin/ads', query: route.query }"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
        >
          Back to Ads
        </RouterLink>
      </div>

      <div v-if="error" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
        {{ error }}
      </div>
      <div v-if="success" class="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-800 dark:bg-success-950/20">
        {{ success }}
      </div>

      <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading ad details...</div>

      <template v-else-if="ad">
        <ComponentCard title="Ad Info">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><p class="text-xs text-gray-500">Title</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.title || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Price</p><p class="text-sm text-gray-900 dark:text-white">{{ formatPrice(ad.price) }}</p></div>
            <div><p class="text-xs text-gray-500">Location</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.location || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Status</p><Badge :color="statusBadgeColor(ad.status)" size="sm">{{ ad.status || '-' }}</Badge></div>
            <div><p class="text-xs text-gray-500">Created At</p><p class="text-sm text-gray-900 dark:text-white">{{ formatDate(ad.created_at) }}</p></div>
            <div><p class="text-xs text-gray-500">Updated At</p><p class="text-sm text-gray-900 dark:text-white">{{ formatDate(ad.updated_at) }}</p></div>
            <div class="md:col-span-2"><p class="text-xs text-gray-500">Description</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.description || '-' }}</p></div>
          </div>
        </ComponentCard>

        <div v-if="ad.status === 'Pending'" class="flex items-center gap-2">
          <button type="button" :disabled="processing" class="inline-flex items-center gap-2 rounded-md bg-success-500 px-3 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:cursor-not-allowed disabled:opacity-50" @click="updateStatus('Approved')"><Check :size="16" /> Approve</button>
          <button type="button" :disabled="processing" class="inline-flex items-center gap-2 rounded-md bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50" @click="updateStatus('Rejected')"><X :size="16" /> Reject</button>
        </div>

        <ComponentCard title="User Info">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><p class="text-xs text-gray-500">Name</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.user?.name || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Email</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.user?.email || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Phone</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.user?.phone || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Member Since</p><p class="text-sm text-gray-900 dark:text-white">{{ formatDate(ad.user?.created_at || '') }}</p></div>
          </div>
        </ComponentCard>

        <ComponentCard title="Category">
          <p class="text-sm text-gray-900 dark:text-white">{{ ad.category?.name || '-' }}</p>
        </ComponentCard>

        <ComponentCard title="Images">
          <div v-if="!ad.images?.length" class="text-sm text-gray-500 dark:text-gray-400">No images available.</div>
          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div v-for="image in ad.images" :key="image.id" class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <img :src="image.url" alt="Ad image" class="h-32 w-full object-cover" />
            </div>
          </div>
        </ComponentCard>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Badge from '@/components/ui/Badge.vue'
import { apiFetch } from '@/services/api'
import { Check, X } from 'lucide-vue-next'

interface AdDetail {
  id: number
  title: string
  description: string
  price: number | null
  location: string
  status: string
  created_at: string
  updated_at: string
  user: { name: string; email: string; phone: string; created_at: string } | null
  category: { name: string } | null
  images: Array<{ id: number; url: string }>
}

interface AdViewResponse {
  success: boolean
  data: {
    ad: AdDetail
  }
}

const route = useRoute()
const loading = ref(false)
const error = ref('')
const success = ref('')
const ad = ref<AdDetail | null>(null)
const processing = ref(false)

const fetchAd = async () => {
  const adId = String(route.params.id || '')
  if (!adId) {
    error.value = 'Ad not found.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await apiFetch<AdViewResponse>(`/api/admin/ads/${adId}`, {
      method: 'GET',
    })
    ad.value = response.data.ad
  } catch (err) {
    ad.value = null
    const errorObj = err as Error & { status?: number; payload?: { message?: string } }
    if (errorObj.status === 404) {
      error.value = errorObj?.payload?.message || 'Ad not found.'
    } else {
      error.value = errorObj?.payload?.message || errorObj.message || 'Failed to load ad details.'
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

const formatPrice = (price: number | null) => {
  if (price === null || Number.isNaN(Number(price))) {
    return '-'
  }

  return Number(price).toLocaleString()
}

const statusBadgeColor = (status: string) => {
  if (status === 'Approved') {
    return 'success'
  }

  if (status === 'Rejected') {
    return 'error'
  }

  return 'warning'
}

const updateStatus = async (status: 'Approved' | 'Rejected') => {
  if (!ad.value || !window.confirm(`${status} "${ad.value.title}"?`)) {
    return
  }

  processing.value = true
  error.value = ''
  success.value = ''

  try {
    await apiFetch(`/api/admin/ads/${ad.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    ad.value.status = status
    success.value = `Ad ${status.toLowerCase()} successfully.`
  } catch (err) {
    const errorObj = err as Error & { payload?: { message?: string } }
    error.value = errorObj?.payload?.message || errorObj.message || 'Failed to update ad status.'
  } finally {
    processing.value = false
  }
}

watch(() => route.params.id, fetchAd)
onMounted(fetchAd)
</script>
