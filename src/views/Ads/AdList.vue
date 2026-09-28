<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Ads'" />

    <div class="space-y-4">
      <div v-if="error" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
        {{ error }}
      </div>
      <div v-if="success" class="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-800 dark:bg-success-950/20">
        {{ success }}
      </div>

      <ComponentCard title="Ads" desc="Browse ads with server-side filters and pagination.">
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div class="w-full md:max-w-sm">
            <label class="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">Search</label>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search title or location"
              class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div class="flex w-full gap-3 md:w-auto">
            <div>
              <label class="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">Status</label>
              <select v-model="filters.status" class="h-10 min-w-32 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90" @change="onFiltersChanged">
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label class="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">Category</label>
              <select
                v-model="filters.category_id"
                class="h-10 min-w-44 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                @change="onFiltersChanged"
              >
                <option value="">All categories</option>
                <option v-for="category in categoryOptions" :key="category.id" :value="String(category.id)">
                  {{ category.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">Per page</label>
              <select
                v-model.number="pagination.per_page"
                class="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                @change="onPerPageChanged"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading ads...</div>

        <div v-else-if="ads.length === 0" class="text-sm text-gray-500 dark:text-gray-400">No ads found.</div>

        <div v-else class="space-y-4">
          <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="max-w-full overflow-x-auto custom-scrollbar">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p></th>
                    <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">User</p></th>
                    <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Category</p></th>
                    <th class="cursor-pointer px-5 py-3 text-left sm:px-6" @click="toggleSort('title')"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Title {{ sortIndicator('title') }}</p></th>
                    <th class="cursor-pointer px-5 py-3 text-left sm:px-6" @click="toggleSort('price')"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Price {{ sortIndicator('price') }}</p></th>
                    <th class="cursor-pointer px-5 py-3 text-left sm:px-6" @click="toggleSort('location')"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Location {{ sortIndicator('location') }}</p></th>
                    <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</p></th>
                    <th class="cursor-pointer px-5 py-3 text-left sm:px-6" @click="toggleSort('created_at')"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Created At {{ sortIndicator('created_at') }}</p></th>
                    <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="ad in ads" :key="ad.id" class="border-t border-gray-100 dark:border-gray-800">
                    <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ ad.id }}</p></td>
                    <td class="px-5 py-4 sm:px-6">
                      <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ ad.user?.name || '-' }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ ad.user?.email || '-' }}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ ad.category?.name || '-' }}</p></td>
                    <td class="px-5 py-4 sm:px-6"><p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ ad.title }}</p></td>
                    <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatPrice(ad.price) }}</p></td>
                    <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ ad.location }}</p></td>
                    <td class="px-5 py-4 sm:px-6"><Badge :color="statusBadgeColor(ad.status)" size="sm">{{ ad.status }}</Badge></td>
                    <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatDate(ad.created_at) }}</p></td>
                    <td class="px-5 py-4 sm:px-6"><div class="flex items-center gap-2">
                      <RouterLink
                        :to="{ path: `/admin/ads/${ad.id}`, query: route.query }"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-300 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300"
                        title="View ad"
                      >
                        <Eye :size="16" />
                      </RouterLink>
                      <template v-if="ad.status === 'Pending'">
                        <button type="button" :disabled="processingAdId === ad.id" class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-success-300 text-success-600 hover:bg-success-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-success-700 dark:text-success-400" title="Approve ad" @click="updateStatus(ad, 'Approved')"><Check :size="16" /></button>
                        <button type="button" :disabled="processingAdId === ad.id" class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-error-300 text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-error-700 dark:text-error-400" title="Reject ad" @click="updateStatus(ad, 'Rejected')"><X :size="16" /></button>
                      </template>
                    </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Showing {{ pagination.from || 0 }}-{{ pagination.to || 0 }} of {{ pagination.total }} ads
            </p>

            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="pagination.current_page <= 1"
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                @click="goToPage(pagination.current_page - 1)"
              >
                Previous
              </button>

              <button
                v-for="pageNumber in visiblePages"
                :key="pageNumber"
                type="button"
                :class="[
                  'rounded-md border px-3 py-1.5 text-xs font-medium',
                  pageNumber === pagination.current_page
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300',
                ]"
                @click="goToPage(pageNumber)"
              >
                {{ pageNumber }}
              </button>

              <button
                type="button"
                :disabled="pagination.current_page >= pagination.last_page"
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                @click="goToPage(pagination.current_page + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Badge from '@/components/ui/Badge.vue'
import { apiFetch } from '@/services/api'
import { Check, Eye, X } from 'lucide-vue-next'

interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}

interface AdRow {
  id: number
  title: string
  price: number | null
  location: string
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at: string
  user: { id: number; name: string; email: string } | null
  category: { id: number; name: string } | null
}

interface Pagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

interface AdsResponse {
  success: boolean
  data: {
    ads: AdRow[]
    pagination: Pagination
  }
}

const route = useRoute()
const router = useRouter()

const ads = ref<AdRow[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const categories = ref<CategoryNode[]>([])
const searchInput = ref('')
const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
const processingAdId = ref<number | null>(null)

const filters = ref({
  search: '',
  category_id: '',
  status: '',
  sort_by: 'created_at',
  sort_order: 'desc' as 'asc' | 'desc',
})

const pagination = ref<Pagination>({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
})

const categoryOptions = computed(() => {
  const options: Array<{ id: number; label: string }> = []

  const walk = (items: CategoryNode[], depth: number) => {
    for (const item of items) {
      const prefix = depth > 0 ? `${'-'.repeat(depth)} ` : ''
      options.push({ id: item.id, label: `${prefix}${item.name}` })
      if (item.children?.length) {
        walk(item.children, depth + 1)
      }
    }
  }

  walk(categories.value, 0)
  return options
})

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  const pages = [] as number[]
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber)
  }

  if (!pages.includes(1)) {
    pages.unshift(1)
  }

  if (!pages.includes(total)) {
    pages.push(total)
  }

  return [...new Set(pages)]
})

const parseQuery = () => {
  const query = route.query

  filters.value.search = String(query.search || '')
  filters.value.category_id = String(query.category_id || '')
  filters.value.status = String(query.status || '')
  filters.value.sort_by = String(query.sort_by || 'created_at')

  const sortOrder = String(query.sort_order || 'desc').toLowerCase()
  filters.value.sort_order = sortOrder === 'asc' ? 'asc' : 'desc'

  const page = Number(query.page || 1)
  pagination.value.current_page = Number.isNaN(page) || page <= 0 ? 1 : page

  const perPage = Number(query.per_page || 10)
  pagination.value.per_page = Number.isNaN(perPage) || perPage <= 0 ? 10 : perPage

  searchInput.value = filters.value.search
}

const toQueryObject = () => {
  return {
    page: String(pagination.value.current_page),
    per_page: String(pagination.value.per_page),
    search: filters.value.search || undefined,
    category_id: filters.value.category_id || undefined,
    status: filters.value.status || undefined,
    sort_by: filters.value.sort_by,
    sort_order: filters.value.sort_order,
  }
}

const syncQueryAndFetch = async () => {
  await router.replace({ query: toQueryObject() })
}

const fetchAds = async () => {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams()
    params.set('page', String(pagination.value.current_page))
    params.set('per_page', String(pagination.value.per_page))
    params.set('sort_by', filters.value.sort_by)
    params.set('sort_order', filters.value.sort_order)

    if (filters.value.search) {
      params.set('search', filters.value.search)
    }

    if (filters.value.category_id) {
      params.set('category_id', filters.value.category_id)
    }

    if (filters.value.status) {
      params.set('status', filters.value.status)
    }

    const response = await apiFetch<AdsResponse>(`/api/admin/ads?${params.toString()}`, {
      method: 'GET',
    })

    ads.value = Array.isArray(response.data.ads) ? response.data.ads : []
    pagination.value = {
      ...pagination.value,
      ...response.data.pagination,
    }
  } catch (err) {
    const errorObj = err as Error & { payload?: { message?: string } }
    error.value = errorObj?.payload?.message || errorObj.message || 'Failed to load ads.'
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await apiFetch<{ data: CategoryNode[] }>('/api/admin/categories', {
      method: 'GET',
    })

    categories.value = Array.isArray(response.data) ? response.data : []
  } catch {
    categories.value = []
  }
}

const goToPage = async (pageNumber: number) => {
  if (pageNumber < 1 || pageNumber > pagination.value.last_page || pageNumber === pagination.value.current_page) {
    return
  }

  pagination.value.current_page = pageNumber
  await syncQueryAndFetch()
}

const onPerPageChanged = async () => {
  pagination.value.current_page = 1
  await syncQueryAndFetch()
}

const onFiltersChanged = async () => {
  pagination.value.current_page = 1
  await syncQueryAndFetch()
}

const statusBadgeColor = (status: AdRow['status']) => {
  if (status === 'Approved') {
    return 'success'
  }

  if (status === 'Rejected') {
    return 'error'
  }

  return 'warning'
}

const updateStatus = async (ad: AdRow, status: 'Approved' | 'Rejected') => {
  if (!window.confirm(`${status} "${ad.title}"?`)) {
    return
  }

  processingAdId.value = ad.id
  error.value = ''
  success.value = ''

  try {
    await apiFetch(`/api/admin/ads/${ad.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    success.value = `Ad ${status.toLowerCase()} successfully.`
    await fetchAds()
  } catch (err) {
    const errorObj = err as Error & { payload?: { message?: string } }
    error.value = errorObj?.payload?.message || errorObj.message || 'Failed to update ad status.'
  } finally {
    processingAdId.value = null
  }
}

const toggleSort = async (column: string) => {
  if (filters.value.sort_by === column) {
    filters.value.sort_order = filters.value.sort_order === 'asc' ? 'desc' : 'asc'
  } else {
    filters.value.sort_by = column
    filters.value.sort_order = 'asc'
  }

  pagination.value.current_page = 1
  await syncQueryAndFetch()
}

const sortIndicator = (column: string) => {
  if (filters.value.sort_by !== column) {
    return ''
  }

  return filters.value.sort_order === 'asc' ? '↑' : '↓'
}

const formatDate = (value: string) => {
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

watch(searchInput, (value) => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }

  searchDebounce.value = setTimeout(async () => {
    filters.value.search = value.trim()
    pagination.value.current_page = 1
    await syncQueryAndFetch()
  }, 300)
})

watch(
  () => route.query,
  async () => {
    parseQuery()
    await fetchAds()
  },
  { deep: true }
)

onMounted(async () => {
  parseQuery()
  await fetchCategories()
  await fetchAds()
})

onUnmounted(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>
