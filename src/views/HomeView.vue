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

      <div class="botones d-flex flex-column gap-3 mt-4">
        <RouterLink class="btn-custom btn-primario" to="/Productos">
          <i class="bi bi-box-seam"></i> Lista de productos
        </RouterLink>

        <RouterLink class="btn-custom btn-secundario" to="/imagenespdf">
          <i class="bi bi-file-image"></i> Cargar imágenes para PDF
        </RouterLink>

        <RouterLink
          class="btn-custom btn-success btn-registroActividadDiaria"
          to="/visitasdiarias"
        >
          <i class="bi bi-geo-alt"></i> Registrar visitas diarias
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .pantalla-completa {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e9f1ff 0%, #f1f6ff 100%);
} */

.pantalla-completa {
  height: 100vh;
  min-height: 100dvh; /* Soporta navegadores móviles con barras dinámicas */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column; /* Acomoda elementos verticalmente */
  background: linear-gradient(135deg, #e9f1ff 0%, #f8fbff 100%);
  padding: 1.5rem;
  text-align: center;
  font-family: "Inter", "Segoe UI", sans-serif;
  color: #1e3a8a;
  position: relative;
  overflow: hidden;
}

/* Efecto de fondo animado suave */
.pantalla-completa::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, #93c5fd33, transparent 60%),
    radial-gradient(circle at 70% 70%, #60a5fa22, transparent 70%);
  animation: fondo-movimiento 12s ease-in-out infinite alternate;
  z-index: 0;
}

/* Contenido principal sobre el fondo */
.pantalla-completa > * {
  position: relative;
  z-index: 1;
}

/* Animación del fondo */
@keyframes fondo-movimiento {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(5%, 5%) scale(1.05);
  }
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

.btn-registroActividadDiaria {
  background-color: #1e3a8a; /* azul profundo */
  color: #fff;
  border: none;
  transition: all 0.3s ease;
}

.btn-registroActividadDiaria:hover,
.btn-registroActividadDiaria:focus {
  background-color: #3b82f6; /* azul más brillante al pasar el mouse */
  transform: scale(1.05);
  color: #fff;
}
</style>
