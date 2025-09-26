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

onMounted(() => {
  isMobile.value = window.innerWidth <= 768;
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <nav
    class="navbar navbar-expand-lg bg-white border-bottom shadow-sm"
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
            <RouterLink class="nav-link custom-link" to="/cargarexcel"
              >Cargar Excel</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/carrito"
              >Carrito</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Menú flotante para móviles -->
  <div v-if="isMobile" class="floating-menu">
    <button
      class="btn btn-primary rounded-circle shadow floating-button"
      @click="menuOpen = !menuOpen"
    >
      <i class="bi bi-list fs-4"></i>
    </button>

    <div v-if="menuOpen" class="menu-panel shadow">
      <RouterLink class="menu-item" to="/productos">Productos</RouterLink>
      <RouterLink class="menu-item" to="/cargarexcel">Cargar Excel</RouterLink>
      <RouterLink class="menu-item" to="/carrito">Carrito</RouterLink>
    </div>
  </div>

  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
.custom-link {
  font-weight: 500;
  color: #333 !important;
  transition: color 0.3s ease, border-bottom 0.3s ease;
  border-bottom: 2px solid transparent;
  margin: 0px 5px;
  border-radius: 5px;
  box-shadow: 0 2px 2px #cedcf1;
}
.custom-link:hover {
  color: #0d6efd !important;
  border-bottom: 2px solid #0d6efd;
}
.router-link-active {
  color: #0d6efd !important;
  border-bottom: 2px solid #0d6efd;
}

/* Estilos flotantes para móviles */
.floating-menu {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}

.floating-button {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  border-radius: 10px;
  padding: 10px;
  width: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.menu-item {
  display: block;
  padding: 10px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}
</style>
