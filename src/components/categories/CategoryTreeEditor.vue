<template>
  <div class="space-y-4">
    <div v-if="submitError" class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/20">
      {{ submitError }}
    </div>
    <div v-if="successMessage" class="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900 dark:bg-success-950/20">
      {{ successMessage }}
    </div>

    <ComponentCard :title="cardTitle" :desc="cardDescription">
      <div v-if="formLoading" class="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700">
        Loading category...
      </div>

      <form v-else class="space-y-4" @submit.prevent="submitForm">
        <CategoryNodeForm
          :node="form"
          :depth="1"
          :path-prefix="''"
          :errors="errors"
          :is-root="true"
          :input-types="inputTypes"
          :input-types-loading="inputTypesLoading"
          :input-types-error="inputTypesError"
          :option-groups="optionGroups"
          :option-groups-loading="optionGroupsLoading"
          :option-groups-error="optionGroupsError"
        />

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{ loading ? submitLoadingLabel : submitLabel }}
          </button>
        </div>
      </form>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ComponentCard from '@/components/common/ComponentCard.vue'
import CategoryNodeForm from '@/components/categories/CategoryNodeForm.vue'
import { apiFetch } from '@/services/api'

interface CategoryOption {
  id?: number
  value: string
}

type OptionGroupMode = 'select_existing' | 'create_new'

interface NewOptionGroup {
  name: string
  options: CategoryOption[]
}

interface CategoryField {
  id?: number
  label: string
  input_type: string
  required: boolean
  option_group_id: string
  option_group_mode: OptionGroupMode
  option_group_search: string
  new_option_group: NewOptionGroup
}

interface CategoryNode {
  id?: number
  name: string
  image?: string
  fields: CategoryField[]
  children: CategoryNode[]
}

interface InputTypeItem {
  id: number
  type: string
  label: string
  has_options: boolean
}

interface OptionGroupOption {
  id: number
  label: string
  value: string
}

interface OptionGroupItem {
  id: number
  name: string
  slug: string
  options: OptionGroupOption[]
}

interface ApiCategoryOption {
  id?: number
  label?: string
  value: string
}

interface ApiCategoryField {
  id?: number
  label: string
  input_type: string
  required: boolean
  option_group_id?: number | null
  option_group?: {
    id?: number
    name?: string
    slug?: string
  } | null
  options?: ApiCategoryOption[]
}

interface ApiCategoryNode {
  id?: number
  name: string
  image?: string | null
  fields?: ApiCategoryField[]
  children?: ApiCategoryNode[]
}

const props = defineProps<{
  mode: 'create' | 'edit'
  categoryId?: string
}>()

const router = useRouter()
const loading = ref(false)
const formLoading = ref(false)
const submitError = ref('')
const successMessage = ref('')
const errors = ref<Record<string, string>>({})

const inputTypes = ref<InputTypeItem[]>([])
const inputTypesLoading = ref(false)
const inputTypesError = ref('')

const optionGroups = ref<OptionGroupItem[]>([])
const optionGroupsLoading = ref(false)
const optionGroupsError = ref('')

const cardTitle = computed(() => (props.mode === 'create' ? 'Create Category Tree' : 'Edit Category Tree'))
const cardDescription = computed(() => (
  props.mode === 'create'
    ? 'Add one parent category with nested children and form fields.'
    : 'Update category fields, nested children, and form fields.'
))
const submitLabel = computed(() => (props.mode === 'create' ? 'Create Category' : 'Update Category'))
const submitLoadingLabel = computed(() => (props.mode === 'create' ? 'Creating...' : 'Updating...'))

const makeInitialForm = (): CategoryNode => ({
  name: '',
  image: '',
  fields: [],
  children: [],
})

const form = ref<CategoryNode>(makeInitialForm())

const getInputType = (type: string) => inputTypes.value.find((item) => item.type === type)

const generateLabelFromValue = (value: string) => {
  const cleaned = value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  if (!cleaned) {
    return ''
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const addError = (map: Record<string, string>, key: string, message: string) => {
  if (!map[key]) {
    map[key] = message
  }
}

const validateNodeClient = (
  node: CategoryNode,
  prefix: string,
  depth: number,
  nextErrors: Record<string, string>,
): void => {
  const dot = (key: string) => (prefix ? `${prefix}.${key}` : key)

  if (!node.name.trim()) {
    addError(nextErrors, dot('name'), 'Category name is required.')
  }

  if (depth === 1 && node.fields.length > 0) {
    addError(nextErrors, dot('fields'), 'Category level 1 cannot have fields. Add fields only in level 2 or 3 categories.')
  }

  node.fields.forEach((field, fieldIndex) => {
    const base = dot(`fields.${fieldIndex}`)

    if (!field.label.trim()) {
      addError(nextErrors, `${base}.label`, 'Field label is required.')
    }

    if (!field.input_type.trim()) {
      addError(nextErrors, `${base}.input_type`, 'Field input_type is required.')
      return
    }

    const inputType = getInputType(field.input_type)
    if (inputType?.has_options) {
      if (field.option_group_mode === 'select_existing') {
        if (!field.option_group_id.trim()) {
          addError(nextErrors, `${base}.option_group_id`, 'Option group selection is required.')
        }
      } else {
        if (!field.new_option_group.name.trim()) {
          addError(nextErrors, `${base}.option_group.name`, 'Option group name is required.')
        }

        if (field.new_option_group.options.length === 0) {
          addError(nextErrors, `${base}.option_group.options`, 'At least one option is required.')
        }

        field.new_option_group.options.forEach((option, optionIndex) => {
          if (!option.value.trim()) {
            addError(nextErrors, `${base}.option_group.options.${optionIndex}.value`, 'Option value is required.')
          }
        })
      }
    }
  })

  if (depth >= 3 && node.children.length > 0) {
    addError(nextErrors, dot('children'), 'Maximum allowed category depth is 3 levels.')
  }

  node.children.forEach((child, childIndex) => {
    validateNodeClient(child, dot(`children.${childIndex}`), depth + 1, nextErrors)
  })
}

const normalizeNodeForPayload = (node: CategoryNode, depth: number): Record<string, unknown> => {
  const mappedFields = depth === 1
    ? []
    : node.fields.map((field) => {
        const inputType = getInputType(field.input_type)
        const hasOptions = Boolean(inputType?.has_options)

        const basePayload: Record<string, unknown> = {
          ...(field.id ? { id: field.id } : {}),
          label: field.label.trim(),
          input_type: field.input_type.trim(),
          required: field.required,
        }

        if (!hasOptions) {
          return basePayload
        }

        if (field.option_group_mode === 'select_existing') {
          return {
            ...basePayload,
            option_group_id: field.option_group_id.trim(),
          }
        }

        return {
          ...basePayload,
          option_group: {
            name: field.new_option_group.name.trim(),
            options: field.new_option_group.options.map((option) => ({
              label: generateLabelFromValue(option.value),
              value: option.value.trim(),
            })),
          },
        }
      })

  return {
    ...(node.id ? { id: node.id } : {}),
    name: node.name.trim(),
    image: depth === 1 ? node.image?.trim() || undefined : undefined,
    fields: mappedFields,
    children: node.children.map((child) => normalizeNodeForPayload(child, depth + 1)),
  }
}

const mapApiNodeToFormNode = (node: ApiCategoryNode, depth: number): CategoryNode => {
  const fields = depth === 1
    ? []
    : (node.fields || []).map((field) => {
        const optionGroup = field.option_group
        const existingOptions = Array.isArray(field.options) ? field.options : []

        return {
          id: field.id,
          label: field.label || '',
          input_type: field.input_type || '',
          required: field.required ?? true,
          option_group_id: field.option_group_id ? String(field.option_group_id) : optionGroup?.id ? String(optionGroup.id) : '',
          option_group_mode: optionGroup?.id ? 'select_existing' : 'create_new',
          option_group_search: '',
          new_option_group: {
            name: optionGroup?.name || '',
            options: existingOptions.map((option) => ({
              id: option.id,
              value: option.value,
            })),
          },
        } as CategoryField
      })

  return {
    id: node.id,
    name: node.name || '',
    image: depth === 1 ? (node.image || '') : undefined,
    fields,
    children: (node.children || []).map((child) => mapApiNodeToFormNode(child, depth + 1)),
  }
}

const mapApiErrors = (err: Error & { payload?: { errors?: Record<string, string[] | string> } }) => {
  const mapped: Record<string, string> = {}

  const payloadErrors = err.payload?.errors || {}
  Object.entries(payloadErrors).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      mapped[key] = String(value[0])
    } else if (typeof value === 'string') {
      mapped[key] = value
    }
  })

  return mapped
}

const fetchInputTypes = async () => {
  inputTypesLoading.value = true
  inputTypesError.value = ''

  try {
    const response = await apiFetch<{ data: InputTypeItem[] }>('/api/admin/input-types', {
      method: 'GET',
    })

    inputTypes.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    inputTypesError.value = err?.payload?.message || err.message || 'Failed to load input types.'
  } finally {
    inputTypesLoading.value = false
  }
}

const fetchOptionGroups = async () => {
  optionGroupsLoading.value = true
  optionGroupsError.value = ''

  try {
    const response = await apiFetch<{ data: OptionGroupItem[] }>('/api/admin/option-groups', {
      method: 'GET',
    })

    optionGroups.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    optionGroupsError.value = err?.payload?.message || err.message || 'Failed to load option groups.'
  } finally {
    optionGroupsLoading.value = false
  }
}

const fetchCategory = async () => {
  if (props.mode !== 'edit' || !props.categoryId) {
    return
  }

  formLoading.value = true
  submitError.value = ''

  try {
    const response = await apiFetch<{ data?: { root_category?: ApiCategoryNode } }>(`/api/admin/categories/${props.categoryId}`, {
      method: 'GET',
    })

    const rootCategory = response?.data?.root_category
    if (!rootCategory) {
      throw new Error('Invalid category response.')
    }

    form.value = mapApiNodeToFormNode(rootCategory, 1)
  } catch (error) {
    const err = error as Error & { payload?: { message?: string } }
    submitError.value = err?.payload?.message || err.message || 'Failed to load category.'
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchInputTypes(), fetchOptionGroups()])
  await fetchCategory()
})

const submitForm = async () => {
  submitError.value = ''
  successMessage.value = ''

  const nextErrors: Record<string, string> = {}
  validateNodeClient(form.value, '', 1, nextErrors)

  if (Object.keys(nextErrors).length > 0) {
    errors.value = nextErrors
    return
  }

  errors.value = {}
  loading.value = true

  try {
    const payload = normalizeNodeForPayload(form.value, 1)

    const path = props.mode === 'create'
      ? '/api/admin/categories'
      : `/api/admin/categories/${props.categoryId}`

    const method = props.mode === 'create' ? 'POST' : 'PUT'

    const response = await apiFetch<{ message: string }>(path, {
      method,
      body: JSON.stringify(payload),
    })

    successMessage.value = response.message || (props.mode === 'create' ? 'Category created successfully.' : 'Category updated successfully.')

    if (props.mode === 'create') {
      form.value = makeInitialForm()
      await router.replace({ path: '/categories/new', query: { created: '1', t: String(Date.now()) } })
    }
  } catch (error) {
    const err = error as Error & { status?: number; payload?: { message?: string; errors?: Record<string, string[] | string> } }

    if (err.status === 422 && err.payload?.errors) {
      errors.value = mapApiErrors(err)
      submitError.value = err.payload.message || 'Please fix the highlighted fields.'
    } else {
      submitError.value = err?.payload?.message || err.message || (props.mode === 'create' ? 'Failed to create category.' : 'Failed to update category.')
    }
  } finally {
    loading.value = false
  }
}
</script>
