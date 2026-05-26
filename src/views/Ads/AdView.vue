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

      <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading ad details...</div>

      <template v-else-if="ad">
        <ComponentCard title="Ad Info">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><p class="text-xs text-gray-500">Title</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.title || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Price</p><p class="text-sm text-gray-900 dark:text-white">{{ formatPrice(ad.price) }}</p></div>
            <div><p class="text-xs text-gray-500">Location</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.location || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Status</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.status || '-' }}</p></div>
            <div><p class="text-xs text-gray-500">Created At</p><p class="text-sm text-gray-900 dark:text-white">{{ formatDate(ad.created_at) }}</p></div>
            <div><p class="text-xs text-gray-500">Updated At</p><p class="text-sm text-gray-900 dark:text-white">{{ formatDate(ad.updated_at) }}</p></div>
            <div class="md:col-span-2"><p class="text-xs text-gray-500">Description</p><p class="text-sm text-gray-900 dark:text-white">{{ ad.description || '-' }}</p></div>
          </div>
        </ComponentCard>

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
import { apiFetch } from '@/services/api'

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
const ad = ref<AdDetail | null>(null)

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

watch(() => route.params.id, fetchAd)
onMounted(fetchAd)
</script>
