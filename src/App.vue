<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";

const isMobile = ref(false);
const menuOpen = ref(false);

const handleClickOutside = (event) => {
  const menu = document.querySelector(".menu-panel");
  const button = document.querySelector(".floating-button");
  if (
    menuOpen.value &&
    menu &&
    !menu.contains(event.target) &&
    !button.contains(event.target)
  ) {
    menuOpen.value = false;
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside); // 👈 para móviles
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <!-- Menú de escritorio -->
  <nav
    class="navbar navbar-expand-lg bg-light border-bottom shadow-sm custom-navbar fixed-top"
    v-if="!isMobile"
  >
    <div class="container">
      <RouterLink class="navbar-brand fw-bold text-primary fs-4" to="/">
        Inicio
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/productos"
              >Productos</RouterLink
            >
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/carrito"
              >Carrito</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/gestionar"
              >Gestionar</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Menú flotante para móviles -->

  <div v-if="isMobile" class="floating-menu">
    <button
      @click="menuOpen = !menuOpen"
      aria-label="Abrir menú"
      class="btn btn-primary rounded-3 shadow floating-button"
    >
      ☰
    </button>
    <div v-if="menuOpen" class="menu-panel shadow">
      <!-- <RouterLink class="menu-item" to="/">🏠 Inicio</RouterLink> -->
      <RouterLink class="menu-item" to="/productos">📦 Productos</RouterLink>
      <RouterLink class="menu-item" to="/cargarexcel"
        >📁 Cargar Excel</RouterLink
      >
      <RouterLink class="menu-item" to="/carrito">🛒 Carrito</RouterLink>
    </div>
  </div>

  <!-- Vista principal -->
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
.custom-link {
  font-weight: 500;
  color: #2028b1 !important;
  transition: color 0.3s ease, border-bottom 0.3s ease;
  border-bottom: 2px solid transparent;
  margin: 0px 5px;
  border-radius: 5px;
  box-shadow: 0 2px 2px #dbe1ff;
}
.custom-link:hover {
  color: #1a22a0 !important;
  border-bottom: 2px solid #1a22a0;
}
.router-link-active {
  color: #2028b1 !important;
  border-bottom: 2px solid #2028b1;
}

/* Estilos flotantes para móviles */

.floating-button {
  width: 56px;
  height: 56px;
  /* background-color: #2028b1; */
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
}

.menu-item {
  display: block;
  padding: 10px;
  color: #2028b1;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  font-weight: 500;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f0f2ff;
  color: #1a22a0;
}

.floating-menu {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
}

.menu-panel {
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 10px;
  padding: 10px;
  width: 200px;
  box-shadow: 0 4px 8px rgba(32, 40, 177, 0.2);
}
</style>
