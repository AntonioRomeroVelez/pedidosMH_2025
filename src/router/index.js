import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import crearProducto from "../views/CrearProductoView.vue";
import editarProducto from "../views/EditarProductoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/productos",
      name: "productos",
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/ProductosView.vue"),
    },
    {
      path: "/crearProducto",
      name: "crearProducto",
      component: crearProducto,
    },
    {
      path: "/editarProducto/:id",
      name: "editarProducto",
      component: editarProducto,
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
      component: () => import("../views/CargarExcelView.vue"),
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
