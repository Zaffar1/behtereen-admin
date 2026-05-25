<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="'Create Category'" />
    <CategoryTreeEditor mode="create" />
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import CategoryTreeEditor from '@/components/categories/CategoryTreeEditor.vue'
</script>
