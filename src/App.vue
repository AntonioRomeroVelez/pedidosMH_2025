<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
    <div class="container">
      <!-- Logo / Marca -->
      <RouterLink class="navbar-brand fw-bold text-primary fs-4" to="/">
        Inicio
      </RouterLink>

      <!-- Botón móvil -->
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

      <!-- Links -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link custom-link" to="/productos">
              Productos
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link custom-link position-relative"
              to="/carrito"
            >
              Carrito
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container py-5">
    <RouterView />
  </main>
</template>

<style scoped>
/* Enlaces elegantes y minimalistas */
.custom-link {
  font-weight: 500;
  color: #333 !important;
  transition: color 0.3s ease, border-bottom 0.3s ease;
  border-bottom: 2px solid transparent;
}
.custom-link:hover {
  color: #0d6efd !important; /* Azul corporativo Bootstrap */
  border-bottom: 2px solid #0d6efd;
}
</style>
