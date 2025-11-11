<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";
import alertify from "alertifyjs";

const isMobile = ref(false);
const menuOpen = ref(false);
const sidebarOpen = ref(true);

const handleClickOutside = (event) => {
  const menu = document.querySelector(".mobile-menu");
  const button = document.querySelector(".mobile-menu-button");
  const navbar = document.querySelector(".mobile-navbar");

  if (!menuOpen.value) return;

  try {
    const isOutside =
      menu &&
      !menu.contains(event.target) &&
      !(button && button.contains(event.target)) &&
      navbar &&
      !navbar.contains(event.target);

    if (isOutside) {
      menuOpen.value = false;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  } catch (e) {
    console.warn("Error en handleClickOutside:", e);
    menuOpen.value = false;
  }
};

const handleBlur = () => {
  if (!menuOpen.value) return;
  setTimeout(() => {
    const menu = document.querySelector(".mobile-menu");
    const button = document.querySelector(".mobile-menu-button");
    const activeElement = document.activeElement;
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

const handleScroll = () => {
  if (menuOpen.value) menuOpen.value = false;
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  document.addEventListener("pointerdown", handleClickOutside, true);
  document.addEventListener("focusout", handleBlur, true);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("close-mobile-menu", handleCloseMenu);
  if ("ontouchstart" in window) {
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("pointerdown", handleClickOutside, true);
  document.removeEventListener("focusout", handleBlur, true);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("close-mobile-menu", handleCloseMenu);
});

function handleCloseMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <div class="app-layout">
    <!-- 📱 Navbar móvil -->
    <!-- 📱 Botón flotante menú móvil -->
    <div v-if="isMobile">
      <button class="fab-menu" @click="menuOpen = !menuOpen">
        <i class="bi" :class="menuOpen ? 'bi-x-lg' : 'bi-list'"></i>
      </button>

      <transition name="fade-slide">
        <div v-if="menuOpen" class="fab-menu-panel shadow-lg">
          <RouterLink
            to="/"
            class="d-flex align-items-center text-decoration-none"
          >
            <img src="/logo.png" alt="Logo" class="sidebar-logo me-2" />
            <span class="fw-bold text-primary fs-7">Molina Herrera</span>
          </RouterLink>
          <RouterLink
            to="/productos"
            class="fab-link"
            @click="menuOpen = false"
          >
            <i class="bi bi-box-seam me-2"></i> Productos
          </RouterLink>
          <RouterLink
            to="/cargarexcel"
            class="fab-link"
            @click="menuOpen = false"
          >
            <i class="bi bi-cloud-arrow-up-fill me-2"></i> Cargar Excel
          </RouterLink>
          <RouterLink to="/carrito" class="fab-link" @click="menuOpen = false">
            <i class="bi bi-cart3 me-2"></i> Carrito
          </RouterLink>
          <RouterLink
            to="/gestionar"
            class="fab-link"
            @click="menuOpen = false"
          >
            <i class="bi bi-gear me-2"></i> Gestionar
          </RouterLink>
        </div>
      </transition>
    </div>

    <!-- 💻 Sidebar (solo escritorio) -->
    <aside
      v-if="!isMobile"
      :class="['sidebar shadow-lg', { 'sidebar-collapsed': !sidebarOpen }]"
    >
      <div
        class="sidebar-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom"
      >
        <RouterLink
          to="/"
          class="d-flex align-items-center text-decoration-none"
        >
          <img src="/logo.png" alt="Logo" class="sidebar-logo me-2" />
          <span v-if="sidebarOpen" class="fw-bold text-primary fs-5"
            >Molina Herrera</span
          >
        </RouterLink>
        <button
          class="btn btn-sm btn-outline-primary toggle-btn"
          @click="toggleSidebar"
        >
          <i
            class="bi"
            :class="sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'"
          ></i>
        </button>
      </div>

      <nav class="sidebar-nav mt-3">
        <RouterLink class="sidebar-link" to="/productos">
          <i class="bi bi-box-seam me-2"></i>
          <span v-if="sidebarOpen">Productos</span>
        </RouterLink>
        <RouterLink class="sidebar-link" to="/cargarexcel">
          <i class="bi bi-cloud-arrow-up-fill me-2"></i>
          <span v-if="sidebarOpen">Cargar Excel</span>
        </RouterLink>
        <RouterLink class="sidebar-link" to="/carrito">
          <i class="bi bi-cart3 me-2"></i>
          <span v-if="sidebarOpen">Carrito</span>
        </RouterLink>
        <RouterLink class="sidebar-link" to="/gestionar">
          <i class="bi bi-gear me-2"></i>
          <span v-if="sidebarOpen">Gestionar</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 🧭 Contenido principal -->
    <main
      :class="['main-content', { 'main-expanded': !sidebarOpen && !isMobile }]"
    >
      <div class="container py-4">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f3f5;
  font-family: "Inter", sans-serif;
}

/* ──────────────── SIDEBAR ──────────────── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  border-bottom: 1px solid #e9ecef;
}

.sidebar-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1rem;
  font-weight: 500;
  color: #444;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.sidebar-link:hover {
  background: #e7f1ff;
  color: #0d6efd;
  transform: translateX(4px);
}

.router-link-active {
  background: #dce9ff !important;
  color: #0d6efd !important;
  font-weight: 600;
}

/* ──────────────── MAIN CONTENT ──────────────── */
.main-content {
  margin-left: 250px;
  flex-grow: 1;
  transition: margin-left 0.3s ease;
}

.main-expanded {
  margin-left: 80px;
}

/* ──────────────── MOBILE NAVBAR ──────────────── */
.mobile-navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  z-index: 1050;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.mobile-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
}

.company-logo-mobile {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.mobile-menu-button {
  border: none;
  background: none;
  font-size: 1.8rem;
  color: #0d6efd;
  transition: transform 0.2s ease;
}

.mobile-menu-button:hover {
  transform: rotate(6deg);
}

.mobile-menu {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  animation: slideDown 0.25s ease forwards;
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
  padding: 0.9rem 1rem;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  transition: background 0.2s ease, padding-left 0.2s ease;
}

.mobile-link:hover {
  background: #e7f1ff;
  color: #0d6efd;
  padding-left: 1.2rem;
}

/* ──────────────── RESPONSIVE ──────────────── */
@media (max-width: 768px) {
  .main-content,
  .main-expanded {
    margin-left: 0 !important;
    width: 100% !important;
    padding: 0 !important;
  }
}

/* FAB MENU button */
.fab-menu {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 58px;
  height: 58px;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);
  z-index: 1100;
  transition: transform 0.25s ease, background 0.25s ease;
}

.fab-menu:hover {
  transform: scale(1.06);
}

/* Panel flotante */
.fab-menu-panel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 0.5rem 0;
  width: 200px;
  z-index: 1090;
  border: 1px solid #eee;
}

/* Items del menú flotante */
.fab-link {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  color: #333;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.fab-link:hover {
  background: #e7f1ff;
  color: #0d6efd;
}

/* Animación */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
