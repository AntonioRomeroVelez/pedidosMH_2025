<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";

const isMobile = ref(false);
const menuOpen = ref(false);

const handleClickOutside = (event) => {
  const menu = document.querySelector(".mobile-menu");
  const button = document.querySelector(".mobile-menu-button");
  const navbar = document.querySelector(".mobile-navbar");

  // Si el menú está cerrado, no hacemos nada
  if (!menuOpen.value) return;

  try {
    // Verificar si el clic fue fuera del menú y del botón
    const isOutside =
      menu &&
      !menu.contains(event.target) &&
      !(button && button.contains(event.target)) &&
      navbar &&
      !navbar.contains(event.target);

    if (isOutside) {
      menuOpen.value = false;
      // Eliminar el foco del botón
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  } catch (e) {
    console.warn("Error en handleClickOutside:", e);
    menuOpen.value = false;
  }
};

// Manejar pérdida de foco
const handleBlur = (event) => {
  if (!menuOpen.value) return;

  // Dar tiempo para detectar el nuevo elemento enfocado
  setTimeout(() => {
    const menu = document.querySelector(".mobile-menu");
    const button = document.querySelector(".mobile-menu-button");
    const activeElement = document.activeElement;

    // Si el foco no está en el menú ni en el botón, cerrar
    if (
      menu &&
      button &&
      activeElement &&
      !menu.contains(activeElement) &&
      activeElement !== button
    ) {
      menuOpen.value = false;
    }
  }, 0);
};

// Manejar scroll
const handleScroll = () => {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();

  // Event Listeners
  window.addEventListener("resize", checkMobile);
  document.addEventListener("pointerdown", handleClickOutside, true);
  document.addEventListener("focusout", handleBlur, true);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("close-mobile-menu", handleCloseMenu);

  // Eventos táctiles específicos para móviles
  if ("ontouchstart" in window) {
    document.addEventListener(
      "touchstart",
      (e) => {
        if (menuOpen.value) {
          handleClickOutside(e);
        }
      },
      { passive: true }
    );
  }
});

onBeforeUnmount(() => {
  // Limpieza de Event Listeners
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("pointerdown", handleClickOutside, true);
  document.removeEventListener("focusout", handleBlur, true);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("close-mobile-menu", handleCloseMenu);

  if ("ontouchstart" in window) {
    document.removeEventListener("touchstart", handleClickOutside);
  }
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
        <img src="/logo.png" alt="MH Logo" class="company-logo" />
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

<style>
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
  padding: 0rem 1rem;
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
  padding: 0rem 0.5rem;
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
  animation: slideDown 0.2s ease-out;
  transform-origin: top;
  -webkit-tap-highlight-color: transparent;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  width: 100%;
}
</style>

<style>
.alertify-notifier {
  z-index: 9999 !important;
}

/* Alertify: asegurar visibilidad por encima de overlays y en pantallas móviles */
.ajs-notifier,
.ajs-message,
.ajs-reset,
.ajs-log,
.ajs-error,
.ajs-success,
.ajs-alert,
.ajs-notifier.ajs-top,
.ajs-dialog {
  z-index: 2147483647 !important;
  pointer-events: auto !important;
}

.ajs-notifier {
  max-width: 95% !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  box-sizing: border-box !important;
  padding: 0 0.25rem !important;
}
.ajs-notifier {
  position: fixed !important;
  top: 20px !important;
  z-index: 2147483647 !important;
}

.ajs-message {
  word-break: break-word !important;
  white-space: normal !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  font-size: 15px !important;
  padding: 12px 16px !important;
}

/* Mejorar visibilidad de los diálogos de confirmación */
.ajs-dialog {
  max-width: 95% !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.ajs-header {
  border-radius: 12px 12px 0 0 !important;
  padding: 16px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

.ajs-body {
  padding: 16px !important;
  font-size: 15px !important;
}

.ajs-footer {
  padding: 12px 16px !important;
  border-radius: 0 0 12px 12px !important;
}

.ajs-button {
  border-radius: 6px !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
  transition: all 0.2s !important;
}

@media (max-width: 480px) {
  .ajs-notifier {
    top: 12px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 90% !important;
    font-size: 14px !important;
  }

  .ajs-message {
    padding: 10px 12px !important;
    font-size: 14px !important;
  }
  .ajs-dialog {
    margin: 16px !important;
  }

  .ajs-body {
    padding: 12px !important;
  }

  .ajs-footer {
    padding: 8px 12px !important;
  }

  .ajs-button {
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
}

/* Mejoras para mensajes de éxito/error */
.ajs-success {
  background-color: #d4edda !important;
  color: #155724 !important;
  border-color: #c3e6cb !important;
}

.ajs-error {
  background-color: #f8d7da !important;
  color: #721c24 !important;
  border-color: #f5c6cb !important;
}

/* Backdrop para diálogos */
.ajs-dim {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}
</style>
