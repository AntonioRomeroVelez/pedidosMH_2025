<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";

const isMobile = ref(false);
const menuOpen = ref(false);

const handleClickOutside = (event) => {
  // Selectores actuales del menú móvil en App.vue
  const menu = document.querySelector(".mobile-menu");
  const button = document.querySelector(".mobile-menu-button");
  try {
    if (
      menuOpen.value &&
      menu &&
      !menu.contains(event.target) &&
      !(button && button.contains(event.target))
    ) {
      menuOpen.value = false;
    }
  } catch (e) {
    // seguridad: en caso de targets inesperados
    menuOpen.value = false;
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  // Escuchamos pointerdown para cubrir mouse y táctil; mantenemos click/touchstart por compatibilidad
  document.addEventListener("pointerdown", handleClickOutside);
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside); // 👈 para móviles
  // Listener personalizado para cerrar el menú desde vistas hijas (usamos función nombrada para poder removerla)
  window.addEventListener("close-mobile-menu", handleCloseMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("pointerdown", handleClickOutside);
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("touchstart", handleClickOutside);
  window.removeEventListener("close-mobile-menu", handleCloseMenu);
});

// función nombrada para cerrar el menú (usada por window events)
function handleCloseMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <!-- Menú de escritorio -->
  <nav class="navbar navbar-expand-lg custom-navbar fixed-top" v-if="!isMobile">
    <div class="container">
      <RouterLink
        class="navbar-brand d-flex align-items-center brand-link"
        to="/"
      >
        <div class="logo-container">
          <img src="/logo.png" alt="MH Logo" class="company-logo" />
        </div>
      </RouterLink>

      <button
        class="navbar-toggler custom-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list"></i>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/productos">
              <i class="bi bi-box-seam me-1"></i>
              Productos
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/carrito">
              <i class="bi bi-cart3 me-1"></i>
              Carrito
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/gestionar">
              <i class="bi bi-gear me-1"></i>
              Gestionar
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Menú para móviles -->
  <nav class="mobile-navbar" v-if="isMobile">
    <div class="mobile-brand">
      <RouterLink to="/" class="mobile-brand-link">
        <div class="border border-primary p-1 rounded">MH</div>
      </RouterLink>

      <button
        @click="menuOpen = !menuOpen"
        aria-label="Abrir menú"
        class="mobile-menu-button"
      >
        <i class="bi" :class="menuOpen ? 'bi-x-lg' : 'bi-list'"></i>
      </button>
    </div>

    <div v-if="menuOpen" class="mobile-menu">
      <RouterLink class="mobile-link" to="/productos" @click="menuOpen = false">
        <i class="bi bi-box-seam me-2"></i>
        Productos
      </RouterLink>
      <RouterLink
        class="mobile-link"
        to="/cargarexcel"
        @click="menuOpen = false"
      >
        <i class="bi bi-cloud-arrow-up-fill me-2"></i>
        Cargar Excel
      </RouterLink>
      <RouterLink class="mobile-link" to="/carrito" @click="menuOpen = false">
        <i class="bi bi-cart3 me-2"></i>
        Carrito
      </RouterLink>
      <RouterLink class="mobile-link" to="/gestionar" @click="menuOpen = false">
        <i class="bi bi-gear me-2"></i>
        Gestionar
      </RouterLink>
    </div>
  </nav>

  <!-- Vista principal -->
  <div class="container containerApp">
    <RouterView />
  </div>
</template>

<style scoped>
/* Estilos del navbar */
.custom-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  padding: 0rem 0;
  transition: all 0.3s ease;
}

/* Estilos del logo y marca */
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.company-logo-mobile {
  width: 35px;
  height: 35px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d6efd;
  letter-spacing: -0.5px;
}

.company-type {
  font-size: 0.9rem;
  color: #2028b1;
  font-weight: 500;
}

.brand-link:hover .company-logo {
  transform: scale(1.1) rotate(-5deg);
}

.mobile-brand-link:hover .company-logo-mobile {
  transform: scale(1.1);
}

/* Estilos de los enlaces */
.custom-link {
  font-weight: 500;
  color: #4a4a4a !important;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem !important;
  margin: 0 0.3rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.custom-link:hover {
  color: #0d6efd !important;
  background-color: rgba(32, 167, 177, 0.1);
  transform: translateY(-1px);
}

.router-link-active {
  color: #0d6efd !important;
  background-color: rgba(32, 167, 177, 0.15);
  font-weight: 600;
}

/* Estilos para móviles */
.mobile-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.mobile-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.mobile-brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.mobile-menu-button {
  background: none;
  border: none;
  color: #0d6efd;
  font-size: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-button:hover {
  transform: scale(1.1);
}

.mobile-menu {
  padding: 0.5rem;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.mobile-link {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: #4a4a4a;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0.25rem 0;
  font-weight: 500;
}

.mobile-link:hover {
  background: rgba(32, 167, 177, 0.1);
  color: #0d6efd;
}

.mobile-link.router-link-active {
  background: rgba(32, 167, 177, 0.15);
  color: #0d6efd;
  font-weight: 600;
}

.containerApp {
  margin-top: 20px;
}
@media (max-width: 768px) {
  .containerApp {
    margin-top: 60px;
  }
}
</style>
