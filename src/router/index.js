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
  ],
});

export default router;
