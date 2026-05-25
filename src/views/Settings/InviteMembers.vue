<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Invite Members'" />

    <div class="space-y-4">
      <div v-if="pageError" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
        {{ pageError }}
      </div>

      <ComponentCard title="Send Invitation" desc="Invite Gmail users to access the admin panel via Google sign-in.">
        <form class="space-y-3" @submit.prevent="submitInvite">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Gmail Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="name@gmail.com"
              class="h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              :class="fieldError ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800' : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700'"
            />
            <p v-if="fieldError" class="mt-1.5 text-xs text-error-500">{{ fieldError }}</p>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="submit"
              :disabled="sending"
              class="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{ sending ? 'Sending...' : 'Send Invite' }}
            </button>
          </div>

          <div v-if="successMessage" class="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900 dark:bg-success-950/20">
            {{ successMessage }}
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Invitations" desc="Manage pending and accepted invitations.">
        <div v-if="listLoading" class="text-sm text-gray-500 dark:text-gray-400">Loading invitations...</div>

        <div v-else-if="invitations.length === 0" class="text-sm text-gray-500 dark:text-gray-400">No invitations found.</div>

        <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Gmail</p></th>
                  <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</p></th>
                  <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Sent At</p></th>
                  <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Action</p></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="invitation in invitations" :key="invitation.id" class="border-t border-gray-100 dark:border-gray-800">
                  <td class="px-5 py-4 sm:px-6"><p class="text-gray-800 text-theme-sm dark:text-white/90">{{ invitation.email }}</p></td>
                  <td class="px-5 py-4 sm:px-6">
                    <Badge :color="invitation.status === 'accepted' ? 'success' : 'warning'" variant="light" size="sm">
                      {{ invitation.status }}
                    </Badge>
                  </td>
                  <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatDate(invitation.created_at) }}</p></td>
                  <td class="px-5 py-4 sm:px-6">
                    <button
                      v-if="invitation.status === 'pending'"
                      type="button"
                      class="rounded-md border border-error-300 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-error-700 dark:text-error-400"
                      :disabled="revokingId === invitation.id"
                      @click="confirmAndRevoke(invitation.id)"
                    >
                      {{ revokingId === invitation.id ? 'Revoking...' : 'Revoke' }}
                    </button>
                    <span v-else class="text-xs text-gray-400 dark:text-gray-500">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Badge from '@/components/ui/Badge.vue'
import { apiFetch } from '@/services/api'

interface Invitation {
  id: number
  email: string
  status: 'pending' | 'accepted'
  created_at: string
  accepted_at: string | null
}

const email = ref('')
const fieldError = ref('')
const pageError = ref('')
const successMessage = ref('')
const sending = ref(false)
const listLoading = ref(false)
const invitations = ref<Invitation[]>([])
const revokingId = ref<number | null>(null)

const validateEmail = (): string => {
  const value = email.value.trim().toLowerCase()

  if (!value) {
    return 'Gmail address is required.'
  }

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(value)) {
    return 'Only Gmail addresses are allowed.'
  }

  return ''
}

const fetchInvitations = async () => {
  listLoading.value = true
  pageError.value = ''

  try {
    const response = await apiFetch<{ data: Invitation[] }>('/api/admin/invitations', {
      method: 'GET',
    })

    invitations.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    pageError.value = err?.payload?.message || err.message || 'Failed to load invitations.'
  } finally {
    listLoading.value = false
  }
}

const submitInvite = async () => {
  fieldError.value = ''
  pageError.value = ''
  successMessage.value = ''

  const validationError = validateEmail()
  if (validationError) {
    fieldError.value = validationError
    return
  }

  sending.value = true

  try {
    await apiFetch<{ message: string; data: Invitation }>('/api/admin/invitations', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim().toLowerCase() }),
    })

    successMessage.value = 'Invitation sent successfully.'
    email.value = ''
    await fetchInvitations()
  } catch (error) {
    const err = error as Error & {
      payload?: { message?: string; errors?: Record<string, string[] | string> }
    }

    const emailErrors = err?.payload?.errors?.email
    if (emailErrors) {
      fieldError.value = Array.isArray(emailErrors) ? emailErrors[0] : emailErrors
    } else {
      pageError.value = err?.payload?.message || err.message || 'Failed to send invitation.'
    }
  } finally {
    sending.value = false
  }
}

const confirmAndRevoke = async (id: number) => {
  if (!window.confirm('Are you sure you want to revoke this invitation?')) {
    return
  }

  pageError.value = ''
  revokingId.value = id

  try {
    await apiFetch<{ message: string }>(`/api/admin/invitations/${id}`, {
      method: 'DELETE',
    })

    successMessage.value = 'Invitation revoked successfully.'
    await fetchInvitations()
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    pageError.value = err?.payload?.message || err.message || 'Failed to revoke invitation.'
  } finally {
    revokingId.value = null
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

onMounted(fetchInvitations)
</script>
