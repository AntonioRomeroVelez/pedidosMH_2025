<script setup>
// No necesitas lógica aquí si solo estás mostrando contenido estático
</script>

<template>
  <div
    class="pantalla-completa d-flex align-items-center justify-content-center text-center"
  >
    <div class="contenido bg-white shadow rounded-4 p-5">
      <!-- Logo y marca -->
      <div class="logo-wrapper mb-4">
        <img src="/logo_mh.png" alt="Logo MH" class="logo mb-2" />
        <h3 class="marca fw-bold text-primary">
          Representaciones Molina Herrera
        </h3>
        <p class="text-muted mb-0">Gestión y control de productos</p>
      </div>

      <!-- Botones principales -->
      <div class="d-flex flex-wrap justify-content-center gap-4 mt-4">
        <RouterLink
          class="btn btn-primary btn-lg d-flex align-items-center gap-2"
          to="/Productos"
        >
          <i class="bi bi-box-seam fs-5"></i> Lista de productos
        </RouterLink>

        <RouterLink
          class="btn btn-success btn-lg d-flex align-items-center gap-2"
          to="/imagenespdf"
        >
          <i class="bi bi-file-image fs-5"></i> Cargar imágenes para PDF
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pantalla-completa {
  height: 100vh;
  background: linear-gradient(135deg, #e9f1ff 0%, #f7fcff 100%);
}

.contenido {
  max-width: 600px;
  border: 1px solid #e0e0e0;
}

.logo {
  width: 100px;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.marca {
  font-size: 1.4rem;
  color: #0d6efd;
}

.btn {
  font-weight: 500;
  border-width: 2px;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-3px);
}
</style>

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
