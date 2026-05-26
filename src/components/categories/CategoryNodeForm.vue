<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-800 dark:text-white/90">
        {{ isRoot ? 'Parent Category' : `Child Category (Level ${depth})` }}
      </h4>
      <button
        v-if="!isRoot"
        type="button"
        class="text-xs font-medium text-error-500 hover:text-error-600"
        @click="$emit('remove')"
      >
        Remove Category
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          v-model="node.name"
          :data-error-key="dot(pathPrefix, 'name')"
          type="text"
          class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          placeholder="e.g. vehicles"
        />
        <p v-if="errorFor('name')" class="mt-1.5 text-xs text-error-500">{{ errorFor('name') }}</p>
      </div>

      <div v-if="isRoot">
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
        <input
          :data-error-key="dot(pathPrefix, 'image')"
          type="file"
          accept="image/*"
          class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          @change="onRootImageChange"
        />
        <p v-if="rootImageLabel()" class="mt-1 text-xs text-gray-500 dark:text-gray-400">Selected: {{ rootImageLabel() }}</p>
        <p v-if="errorFor('image')" class="mt-1.5 text-xs text-error-500">{{ errorFor('image') }}</p>
      </div>
    </div>

    <div v-if="!isRoot" class="mt-6">
      <div class="mb-3 flex items-center justify-between">
        <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Form Fields</h5>
        <button
          type="button"
          class="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300"
          @click="addField"
        >
          Add Form Field
        </button>
      </div>

      <p v-if="errorFor('fields')" class="mb-2 text-xs text-error-500">{{ errorFor('fields') }}</p>
      <p v-if="inputTypesError" class="mb-2 text-xs text-error-500">{{ inputTypesError }}</p>
      <p v-if="optionGroupsError" class="mb-2 text-xs text-error-500">{{ optionGroupsError }}</p>

      <div v-if="node.fields.length === 0" class="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500 dark:border-gray-700">
        No form fields added.
      </div>

      <div v-for="(field, fieldIndex) in node.fields" :key="`field-${fieldIndex}`" class="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">Field {{ fieldIndex + 1 }}</p>
          <button
            type="button"
            class="text-xs font-medium text-error-500 hover:text-error-600"
            @click="removeField(fieldIndex)"
          >
            Remove
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Label</label>
            <input v-model="field.label" :data-error-key="dot(pathPrefix, `fields.${fieldIndex}.label`)" type="text" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700" />
            <p v-if="fieldError(fieldIndex, 'label')" class="mt-1 text-xs text-error-500">{{ fieldError(fieldIndex, 'label') }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Input Type</label>
            <select
              v-model="field.input_type"
              :data-error-key="dot(pathPrefix, `fields.${fieldIndex}.input_type`)"
              class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
              :disabled="inputTypesLoading"
              @change="onInputTypeChange(field)"
            >
              <option value="">{{ inputTypesLoading ? 'Loading input types...' : 'Select type' }}</option>
              <option v-for="type in inputTypes" :key="type.id" :value="type.type">{{ type.label }}</option>
            </select>
            <p v-if="fieldError(fieldIndex, 'input_type')" class="mt-1 text-xs text-error-500">{{ fieldError(fieldIndex, 'input_type') }}</p>
          </div>

          <label class="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <input v-model="field.required" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
            Required
          </label>
        </div>

        <div v-if="inputTypeHasOptions(field.input_type)" class="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div class="mb-2">
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">Option Group</p>
          </div>

          <div class="mb-3 flex gap-4">
            <label class="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                value="select_existing"
                v-model="field.option_group_mode"
                @change="setOptionGroupMode(field, 'select_existing')"
              />
              Select Existing
            </label>
            <label class="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                value="create_new"
                v-model="field.option_group_mode"
                @change="setOptionGroupMode(field, 'create_new')"
              />
              Create New
            </label>
          </div>

          <div v-if="field.option_group_mode === 'select_existing'" class="space-y-2">
            <input
              v-model="field.option_group_search"
              type="text"
              placeholder="Search option groups"
              class="h-9 w-full rounded-md border border-gray-300 px-2 text-sm dark:border-gray-700"
            />
            <select v-model="field.option_group_id" :data-error-key="dot(pathPrefix, `fields.${fieldIndex}.option_group_id`)" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700">
              <option value="">Select option group</option>
              <option v-for="group in filteredOptionGroups(field.option_group_search)" :key="group.id" :value="String(group.id)">
                {{ group.name }}
              </option>
            </select>
            <p v-if="fieldError(fieldIndex, 'option_group_id')" class="text-xs text-error-500">{{ fieldError(fieldIndex, 'option_group_id') }}</p>

            <div v-if="selectedGroup(field.option_group_id)" class="rounded-md border border-gray-200 p-2 dark:border-gray-700">
              <p class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Options Preview</p>
              <ul class="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <li v-for="option in selectedGroup(field.option_group_id)?.options || []" :key="option.id">
                  {{ generateLabelFromValue(option.value) }} ({{ option.value }})
                </li>
              </ul>
            </div>
          </div>

          <div v-else class="space-y-2">
            <input
              v-model="field.new_option_group.name"
              :data-error-key="dot(pathPrefix, `fields.${fieldIndex}.option_group.name`)"
              type="text"
              placeholder="New option group name"
              class="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
            />
            <p v-if="fieldError(fieldIndex, 'option_group.name')" class="text-xs text-error-500">{{ fieldError(fieldIndex, 'option_group.name') }}</p>

            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">Options</p>
              <button
                type="button"
                class="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-200"
                @click="addOption(fieldIndex)"
              >
                Add Option
              </button>
            </div>

            <div v-if="field.new_option_group.options.length === 0" class="text-xs text-gray-500">No options yet.</div>

            <div v-for="(option, optionIndex) in field.new_option_group.options" :key="`new-option-${optionIndex}`" class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
              <input v-model="option.value" :data-error-key="dot(pathPrefix, `fields.${fieldIndex}.option_group.options.${optionIndex}.value`)" type="text" placeholder="Value" class="h-9 rounded-md border border-gray-300 px-2 text-sm dark:border-gray-700" />
              <span class="truncate text-xs text-gray-600 dark:text-gray-300">{{ generateLabelFromValue(option.value) || '-' }}</span>
              <button type="button" class="h-9 rounded-md border border-error-300 px-2 text-xs text-error-500" @click="removeOption(fieldIndex, optionIndex)">
                Remove
              </button>
              <p v-if="optionError(fieldIndex, optionIndex, 'value')" class="text-xs text-error-500">{{ optionError(fieldIndex, optionIndex, 'value') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div class="mb-3 flex items-center justify-between">
        <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Children</h5>
        <button
          type="button"
          :disabled="depth >= 3"
          class="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-700 dark:text-brand-300"
          @click="addChild"
        >
          Add Child Category
        </button>
      </div>

      <p v-if="errorFor('children')" class="mb-2 text-xs text-error-500">{{ errorFor('children') }}</p>

      <div v-if="node.children.length === 0" class="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500 dark:border-gray-700">
        No child categories added.
      </div>

      <div class="space-y-3">
        <CategoryNodeForm
          v-for="(child, childIndex) in node.children"
          :key="`child-${childIndex}`"
          :node="child"
          :depth="depth + 1"
          :path-prefix="dot(pathPrefix, `children.${childIndex}`)"
          :errors="errors"
          :is-root="false"
          :input-types="inputTypes"
          :input-types-loading="inputTypesLoading"
          :input-types-error="inputTypesError"
          :option-groups="optionGroups"
          :option-groups-loading="optionGroupsLoading"
          :option-groups-error="optionGroupsError"
          @remove="removeChild(childIndex)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CategoryOption {
  value: string
}

interface NewOptionGroup {
  name: string
  options: CategoryOption[]
}

type OptionGroupMode = 'select_existing' | 'create_new'

interface CategoryField {
  label: string
  input_type: string
  required: boolean
  option_group_id: string
  option_group_mode: OptionGroupMode
  option_group_search: string
  new_option_group: NewOptionGroup
}

interface CategoryNode {
  name: string
  image?: string | File | null
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

const props = defineProps<{
  node: CategoryNode
  depth: number
  isRoot: boolean
  pathPrefix: string
  errors: Record<string, string>
  inputTypes: InputTypeItem[]
  inputTypesLoading: boolean
  inputTypesError: string
  optionGroups: OptionGroupItem[]
  optionGroupsLoading: boolean
  optionGroupsError: string
}>()

defineEmits<{
  remove: []
}>()

const dot = (prefix: string, key: string) => {
  if (!prefix) {
    return key
  }

  return `${prefix}.${key}`
}

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

const errorFor = (key: string) => props.errors[dot(props.pathPrefix, key)] || ''
const fieldError = (index: number, key: string) => props.errors[dot(props.pathPrefix, `fields.${index}.${key}`)] || ''
const optionError = (fieldIndex: number, optionIndex: number, key: string | null) => {
  const base = dot(props.pathPrefix, `fields.${fieldIndex}.option_group.options.${optionIndex}`)
  if (!key) {
    return props.errors[base] || ''
  }
  return props.errors[`${base}.${key}`] || ''
}

const inputTypeHasOptions = (inputType: string) => {
  const type = props.inputTypes.find((item) => item.type === inputType)
  return Boolean(type?.has_options)
}

const filteredOptionGroups = (search: string) => {
  const term = search.trim().toLowerCase()
  if (!term) {
    return props.optionGroups
  }

  return props.optionGroups.filter((group) => {
    return group.name.toLowerCase().includes(term) || group.slug.toLowerCase().includes(term)
  })
}

const selectedGroup = (id: string) => {
  if (!id) {
    return null
  }

  return props.optionGroups.find((group) => String(group.id) === String(id)) || null
}

const rootImageLabel = () => {
  if (!props.isRoot || !props.node.image) {
    return ''
  }

  return props.node.image instanceof File ? props.node.image.name : String(props.node.image)
}

const onRootImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  props.node.image = target.files?.[0] || null
}

const resetOptionGroupData = (field: CategoryField) => {
  field.option_group_id = ''
  field.option_group_search = ''
  field.new_option_group = {
    name: '',
    options: [],
  }
}

const setOptionGroupMode = (field: CategoryField, mode: OptionGroupMode) => {
  if (field.option_group_mode === mode) {
    return
  }

  field.option_group_mode = mode
  resetOptionGroupData(field)
}

const onInputTypeChange = (field: CategoryField) => {
  if (!inputTypeHasOptions(field.input_type)) {
    resetOptionGroupData(field)
  }
}

const addChild = () => {
  props.node.children.push({
    name: '',
    fields: [],
    children: [],
  })
}

const removeChild = (index: number) => {
  props.node.children.splice(index, 1)
}

const addField = () => {
  props.node.fields.push({
    label: '',
    input_type: '',
    required: true,
    option_group_id: '',
    option_group_mode: 'select_existing',
    option_group_search: '',
    new_option_group: {
      name: '',
      options: [],
    },
  })
}

const removeField = (index: number) => {
  props.node.fields.splice(index, 1)
}

const addOption = (fieldIndex: number) => {
  props.node.fields[fieldIndex].new_option_group.options.push({ value: '' })
}

const removeOption = (fieldIndex: number, optionIndex: number) => {
  props.node.fields[fieldIndex].new_option_group.options.splice(optionIndex, 1)
}
</script>
