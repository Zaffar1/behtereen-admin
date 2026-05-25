<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Categories'" />

    <div class="space-y-4">
      <div class="flex justify-end">
        <RouterLink
          to="/categories/new"
          class="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Create Category
        </RouterLink>
      </div>

      <div v-if="error" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
        {{ error }}
      </div>

      <ComponentCard title="Category Trees" desc="Manage root categories and open edit view.">
        <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading categories...</div>

        <div v-else-if="categories.length === 0" class="text-sm text-gray-500 dark:text-gray-400">No categories found.</div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} categories
            </p>
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Rows</label>
              <select
                :value="String(perPage)"
                class="h-9 rounded-md border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-700"
                @change="onPerPageChange(($event.target as HTMLSelectElement).value)"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="max-w-full overflow-x-auto custom-scrollbar">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="px-5 py-3 text-left sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
                    </th>
                    <th class="px-5 py-3 text-left sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Category</p>
                    </th>
                    <th class="px-5 py-3 text-left sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Children</p>
                    </th>
                    <th class="px-5 py-3 text-left sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr
                    v-for="category in paginatedCategories"
                    :key="category.id"
                    class="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td class="px-5 py-4 sm:px-6">
                      <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ category.id }}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                      <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ category.name }}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                      <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ category.children?.length || 0 }}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                      <RouterLink
                        :to="`/categories/${category.id}/edit`"
                        class="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300"
                      >
                        Edit
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500 dark:text-gray-400">Page {{ page }} of {{ totalPages }}</p>
            <div class="flex gap-2">
              <button
                type="button"
                :disabled="page <= 1"
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                @click="goToPreviousPage"
              >
                Previous
              </button>
              <button
                type="button"
                :disabled="page >= totalPages"
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                @click="goToNextPage"
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
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import { apiFetch } from '@/services/api'

interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}

const loading = ref(false)
const error = ref('')
const categories = ref<CategoryNode[]>([])
const page = ref(1)
const perPage = ref(10)

const totalItems = computed(() => categories.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage.value)))
const paginatedCategories = computed(() => {
  const start = (page.value - 1) * perPage.value
  return categories.value.slice(start, start + perPage.value)
})

const startItem = computed(() => (totalItems.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
const endItem = computed(() => Math.min(page.value * perPage.value, totalItems.value))

const goToPreviousPage = () => {
  if (page.value > 1) {
    page.value -= 1
  }
}

const goToNextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1
  }
}

const onPerPageChange = (value: string) => {
  const parsed = Number(value)
  if (!Number.isNaN(parsed) && parsed > 0) {
    perPage.value = parsed
    page.value = 1
  }
}

const fetchCategories = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiFetch<{ data: CategoryNode[] }>('/api/admin/categories', {
      method: 'GET',
    })

    categories.value = Array.isArray(response.data) ? response.data : []
    page.value = 1
  } catch (err) {
    const errorObj = err as Error & { payload?: { message?: string } }
    error.value = errorObj?.payload?.message || errorObj.message || 'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>
