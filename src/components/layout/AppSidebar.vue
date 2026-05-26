<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
    <router-link to="/" class="flex items-center gap-2">
      <img
        src="/images/logo/behtereen-logo.png"
        alt="Behtereen Logo"
        width="32"
        height="32"
        class="shrink-0"
      />

      <span
        v-if="isExpanded || isHovered || isMobileOpen"
        class="text-xlg font-semibold text-gray-900 dark:text-white whitespace-nowrap"
      >
        BEHTEREEN.PK
      </span>
    </router-link>
    </div>

    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <h2
          :class="[
            'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
            !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
          ]"
        >
          <template v-if="isExpanded || isHovered || isMobileOpen">Navigation</template>
          <HorizontalDots v-else />
        </h2>

        <ul class="flex flex-col gap-4">
          <li>
            <router-link
              to="/admin/ads"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': route.path.startsWith('/admin/ads'),
                  'menu-item-inactive': !route.path.startsWith('/admin/ads'),
                },
              ]"
            >
              <span
                :class="[
                  route.path.startsWith('/admin/ads')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <BoxIcon />
              </span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text"
                >Ads</span
              >
            </router-link>
          </li>
          <li>
            <router-link
              to="/categories"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': route.path.startsWith('/categories'),
                  'menu-item-inactive': !route.path.startsWith('/categories'),
                },
              ]"
            >
              <span
                :class="[
                  route.path.startsWith('/categories')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <ListIcon />
              </span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text"
                >Categories</span
              >
            </router-link>
          </li>
        </ul>
      </nav>

      <nav class="mb-6">
        <h2
          :class="[
            'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
            !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
          ]"
        >
          <template v-if="isExpanded || isHovered || isMobileOpen">Settings</template>
          <HorizontalDots v-else />
        </h2>

        <ul class="flex flex-col gap-4">
          <li>
            <router-link
              to="/settings/invite-members"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': route.path.startsWith('/settings/invite-members'),
                  'menu-item-inactive': !route.path.startsWith('/settings/invite-members'),
                },
              ]"
            >
              <span
                :class="[
                  route.path.startsWith('/settings/invite-members')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <SettingsIcon />
              </span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text"
                >Invite Members</span
              >
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { BoxIcon, HorizontalDots, ListIcon, SettingsIcon } from '../../icons'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const { isExpanded, isMobileOpen, isHovered } = useSidebar()

</script>
