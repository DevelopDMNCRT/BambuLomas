import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/usuarios',
      name: 'Usuarios',
      component: () => import('../views/Usuarios/UsuariosView.vue'),
      meta: {
        title: 'Usuarios',
      },
    },
    {
      path: '/usuarios/form',
      name: 'UsuariosForm',
      component: () => import('../views/Usuarios/UsuariosForm.vue'),
      meta: {
        title: 'Formulario de Usuario',
      },
    },
    {
      path: '/compras',
      name: 'Compras',
      component: () => import('../views/Compras/ComprasView.vue'),
      meta: {
        title: 'Compras',
      },
    },
    {
      path: '/compras/form',
      name: 'ComprasForm',
      component: () => import('../views/Compras/ComprasForm.vue'),
      meta: {
        title: 'Formulario de Compra',
      },
    },
    {
      path: '/gastos',
      name: 'Gastos',
      component: () => import('../views/Gastos/GastosView.vue'),
      meta: {
        title: 'Gastos',
      },
    },
    {
      path: '/gastos/form',
      name: 'GastosForm',
      component: () => import('../views/Gastos/GastosForm.vue'),
      meta: {
        title: 'Formulario de Gasto',
      },
    },
    {
      path: '/inventario',
      name: 'Inventario',
      component: () => import('../views/Inventario/InventarioView.vue'),
      meta: {
        title: 'Inventario',
      },
    },
    {
      path: '/inventario/historial',
      name: 'InventarioHistory',
      component: () => import('../views/Inventario/InventarioHistory.vue'),
      meta: {
        title: 'Historial de Compras',
      },
    },
    {
      path: '/recetas',
      name: 'Recetas',
      component: () => import('../views/Recetas/RecetasView.vue'),
      meta: {
        title: 'Recetas',
      },
    },
    {
      path: '/recetas/form',
      name: 'RecetasForm',
      component: () => import('../views/Recetas/RecetasForm.vue'),
      meta: {
        title: 'Formulario de Receta',
      },
    },
    {
      path: '/carta',
      name: 'Carta',
      component: () => import('../views/Carta/CartaView.vue'),
      meta: {
        title: 'Carta',
      },
    },
    {
      path: '/carta/form',
      name: 'CartaForm',
      component: () => import('../views/Carta/CartaForm.vue'),
      meta: {
        title: 'Formulario de Platillo',
      },
    },
    {
      path: '/checador',
      name: 'Checador',
      component: () => import('../views/Checador/ChecadorView.vue'),
      meta: {
        title: 'Checador de Asistencia',
      },
    },
    {
      path: '/mesas',
      name: 'Mesas',
      component: () => import('../views/Mesas/MesasView.vue'),
      meta: {
        title: 'Mesas',
      },
    },
    {
      path: '/pos',
      name: 'POS',
      component: () => import('../views/POS/PosView.vue'),
      meta: {
        title: 'Punto de Venta',
      },
    },
    {
      path: '/ordenes',
      name: 'Ordenes',
      component: () => import('../views/Ordenes/OrdenesView.vue'),
      meta: {
        title: 'Órdenes del Cliente',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

// ── Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/signin', '/signup']

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} | Bambu Cloud - Admin`
  }

  const { isAuthenticated } = useAuth()
  const isPublic = PUBLIC_ROUTES.includes(to.path)

  if (!isPublic && !isAuthenticated()) {
    // Redirigir al login si no está autenticado
    return next('/signin')
  }

  if (to.path === '/signin' && isAuthenticated()) {
    // Si ya inició sesión, redirigir al inicio (o recetas si es Chef)
    const user = useAuth().getUser()
    if (user && user.rol === 'Chef') {
      return next('/recetas')
    }
    return next('/')
  }

  // Restricciones de Rol: Chef
  const user = useAuth().getUser()
  if (user && user.rol === 'Chef') {
    if (!to.path.startsWith('/recetas') && to.path !== '/profile' && !isPublic) {
      return next('/recetas')
    }
  }

  next()
})
