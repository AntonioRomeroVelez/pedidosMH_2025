<template>
  <div class="pantalla-completa">
    <div class="contenido shadow-lg rounded-4 p-5 bg-white">
      <!-- Logo y marca -->
      <div class="text-center mb-4">
        <img src="/logo_mh.png" alt="Logo MH" class="logo mb-3" />
        <h3 class="marca">Representaciones Molina Herrera</h3>
        <p class="text-muted mb-0">Gestión y control de productos</p>
      </div>

      <!-- Botones principales -->
      <div class="botones">
        <RouterLink class="btn-custom btn-primario" to="/Productos">
          <i class="bi bi-box-seam"></i> Lista de productos
        </RouterLink>

        <RouterLink class="btn-custom btn-secundario" to="/imagenespdf">
          <i class="bi bi-file-image"></i> Cargar imágenes para PDF
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pantalla-completa {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e9f1ff 0%, #f1f6ff 100%);
}

.contenido {
  max-width: 450px;
  text-align: center;
}

.logo {
  width: 100px;
  transition: transform 0.25s ease;
}

.logo:hover {
  transform: scale(1.06);
}

/* Tipografía */
.marca {
  font-size: 1.4rem;
  color: #0d6efd;
}

/* Botones */
.botones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-custom:hover {
  transform: translateY(-2px);
}

.btn-primario {
  background: #0d6efd;
  color: white;
}

.btn-secundario {
  background: #198754;
  color: white;
}
</style>
