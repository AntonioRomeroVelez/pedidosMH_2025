<script setup>
// No necesitas lógica aquí si solo estás mostrando contenido estático
</script>

<template>
  <div class="pantalla-completa">
    <div class="contenido text-center">
      <div class="logo-wrapper mb-3">
        <img src="/logo_mh.png" alt="Logo MG" class="logo" />
        <p class="marca text-2xl">Representaciones Molina Herrera</p>
      </div>

      <RouterLink class="btn btn-primary" to="/Productos">
        Lista de productos
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.pantalla-completa {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* altura completa de la ventana */
  background-color: #f5f7ff; /* opcional: fondo suave que resalta el logo */
}

.contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin-bottom: 8px;
}
.marca {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2028b1;
  margin-top: 8px;
  text-align: center;
}
</style>
