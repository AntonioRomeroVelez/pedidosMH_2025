import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/productos",
      name: "productos",
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/ProductosView.vue"),
    },
    {
      path: "/producto/:id",
      name: "ProductoDetalle",
      component: () => import("../views/ProductoDetalleView.vue"),
    },
    {
      path: "/cargarexcel",
      name: "cargarexcel",
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/CargarExcel.vue"),
    },
    {
      path: "/carrito",
      name: "carrito",
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/CarritoView.vue"),
    },
    {
      path: "/GestionarProductos",
      name: "GestionarProductos",
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/GestionarProductos.vue"),
    },
    {
      path: "/editar/:id",
      name: "EditarProducto",
      component: () => import("../views/EditarView.vue"),
    },
    {
      path: "/crear",
      name: "CrearProducto",
      component: () => import("../views/CrearView.vue"),
    },
    {
      path: "/gestionar",
      name: "Gestionar",
      component: () => import("../views/GestionarView.vue"),
    },
    {
      path: "/descargarExcel",
      name: "DescargarExcel",
      component: () => import("../views/DescargarExcelView.vue"),
    },
  ],
});

export default router;
