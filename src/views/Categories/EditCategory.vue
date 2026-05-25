<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Edit Category'" />
    <CategoryTreeEditor mode="edit" :category-id="categoryId" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import CategoryTreeEditor from '@/components/categories/CategoryTreeEditor.vue'

const route = useRoute()
const categoryId = computed(() => String(route.params.id || ''))
</script>
