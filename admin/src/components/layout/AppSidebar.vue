<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bottom-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen,
        'lg:w-[90px]': !isExpanded,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
  >
    <div
      :class="[
        'py-8 flex justify-center',
      ]"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isMobileOpen"
          src="/logo.png"
          alt="Logo"
          height="40"
          class="max-h-10 w-auto"
        />
        <img
          v-else
          src="/favicon.png"
          alt="Logo"
          width="36"
          height="36"
          class="rounded-lg"
        />
      </router-link>
    </div>
    <div
      class="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <!-- Expanded Menu -->
        <div v-if="isExpanded || isMobileOpen" class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              v-if="menuGroup.title"
              class="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start"
            >
              {{ menuGroup.title }}
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full justify-start',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    }
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span class="menu-item-text">{{ item.name }}</span>
                  <ChevronDownIcon
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      { 'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index) }
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group justify-start',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span class="menu-item-text">{{ item.name }}</span>
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div v-show="isSubmenuOpen(groupIndex, index)">
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(subItem.path),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="['menu-dropdown-badge', isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive']"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="['menu-dropdown-badge', isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive']"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>

        <!-- Collapsed Menu (Quick Access) -->
        <div v-else class="flex flex-col gap-4">
          <ul class="flex flex-col gap-4">
            <li v-for="item in quickAccessItems" :key="item.name">
              <router-link
                :to="item.path"
                :class="[
                  'menu-item group lg:justify-center w-full',
                  {
                    'menu-item-active': isActive(item.path),
                    'menu-item-inactive': !isActive(item.path),
                  },
                ]"
                :title="item.name"
              >
                <span
                  :class="[
                    isActive(item.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive',
                  ]"
                >
                  <component :is="item.icon" />
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- Logout fijo al fondo -->
    <div class="mt-auto border-t border-gray-200 dark:border-gray-800 py-4">
      <router-link
        to="/signin"
        @click="handleLogout"
        :class="[
          'menu-item group menu-item-inactive w-full',
          !isExpanded ? 'lg:justify-center' : 'justify-start',
        ]"
        title="Cerrar sesión"
      >
        <span class="menu-item-icon-inactive">
          <LogoutIcon />
        </span>
        <span v-if="isExpanded || isMobileOpen" class="menu-item-text">
          Cerrar sesión
        </span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import {
  UserCircleIcon,
  ChevronDownIcon,
  HorizontalDots,
  LogoutIcon,
  PieChartIcon,
  BoxCubeIcon,
  BarChartIcon,
  PageIcon,
  ListIcon,
  UserGroupIcon,
  FolderIcon,
  CalenderIcon,
  ScissorsIcon,
  GridIcon,
  LayoutDashboardIcon,
  ArchiveIcon,
  CashIcon,
  WalletIcon,
  DollarIcon,
} from "../../icons";

import SidebarWidget from "./SidebarWidget.vue";
import { useSidebar } from "@/composables/useSidebar";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();

const { isExpanded, isMobileOpen, openSubmenu } = useSidebar();
const { logout, getUser } = useAuth();
const userRole = computed(() => getUser()?.rol || '');

const handleLogout = () => {
  logout();
};

const quickAccessItems = computed(() => {
  if (userRole.value === 'Chef') {
    return [];
  }
  return [
    { icon: PieChartIcon, name: "Estadísticas", path: "/" },
    { icon: CashIcon, name: "POS", path: "/pos" },
    { icon: ListIcon, name: "Órdenes", path: "/ordenes" },
    { icon: ListIcon, name: "Ludoteca", path: "/ludoteca" },
    { icon: GridIcon, name: "Mesas", path: "/mesas" },
    { icon: ScissorsIcon, name: "Corte", path: "/corte" },
  ];
});

const menuGroups = computed(() => {
  if (userRole.value === 'Chef') {
    return [
      {
        title: "",
        items: [
          {
            icon: PieChartIcon,
            name: "Administración",
            subItems: [
              {
                name: "Recetas",
                path: "/recetas",
              }
            ]
          }
        ]
      }
    ];
  }

  return [
    {
      title: "",
      items: [
        {
          icon: PieChartIcon,
          name: "Administración",
          subItems: [
            { name: "Estadísticas", path: "/" },
            { name: "Usuarios", path: "/usuarios" },
            { name: "Compras", path: "/compras" },
            { name: "Gastos", path: "/gastos" },
            { name: "Inventario", path: "/inventario" },
            { name: "Recetas", path: "/recetas" },
            { name: "Carta", path: "/carta" },
            { name: "Clientes", path: "/clientes" },
            { name: "CXC", path: "/cxc" },
            { name: "Checador", path: "/checador" },
            { name: "Nómina", path: "/nomina" },
          ],
        },
        {
          icon: DollarIcon,
          name: "Caja",
          subItems: [
            { name: "Órdenes", path: "/ordenes" },
            { name: "Ludoteca", path: "/ludoteca" },
            { name: "Mesas", path: "/mesas" },
            { name: "POS", path: "/pos" },
            { name: "Ventas", path: "/ventas" },
            { name: "Corte", path: "/corte" },
            { name: "Uber Eats", path: "/uber-eats" },
          ],
        },
      ],
    },
  ];
});

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

onMounted(() => {
  if (!openSubmenu.value) {
    for (let g = 0; g < menuGroups.value.length; g++) {
      for (let i = 0; i < menuGroups.value[g].items.length; i++) {
        const item = menuGroups.value[g].items[i];
        if (item.subItems && item.subItems.some((sub) => isActive(sub.path))) {
          openSubmenu.value = `${g}-${i}`;
          return;
        }
      }
    }
  }
});

const isSubmenuOpen = (groupIndex, itemIndex) => {
  return openSubmenu.value === `${groupIndex}-${itemIndex}`;
};

const startTransition = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  el.offsetHeight; // force reflow
  el.style.height = height + "px";
};

const endTransition = (el) => {
  el.style.height = "";
};
</script>
