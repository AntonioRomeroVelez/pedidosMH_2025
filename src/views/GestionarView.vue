<template>
  <div class="container py-4">
    <h2 class="text-primary fw-bold mb-4 text-center">
      🧭 Gestiones de la aplicación
    </h2>

    <div class="row g-4">
      <!-- Gestión de productos -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title text-success">📦 Productos</h5>
            <p class="card-text">Crear, editar, eliminar y listar productos.</p>
            <RouterLink class="btn btn-outline-success" to="/productos"
              >Ir a productos</RouterLink
            >
          </div>
        </div>
      </div>

      <!-- Cargar Excel -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title text-info">📁 Cargar Excel</h5>
            <p class="card-text">Importar productos desde archivo Excel.</p>
            <RouterLink class="btn btn-outline-info" to="/cargarexcel"
              >Ir a carga Excel</RouterLink
            >
          </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title text-warning">🛒 Carrito</h5>
            <p class="card-text">Ver y gestionar productos en el carrito.</p>
            <RouterLink class="btn btn-outline-warning" to="/carrito"
              >Ir al carrito</RouterLink
            >
          </div>
        </div>
      </div>

     
      <!-- Configuración (opcional) -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title text-secondary">⚙️ Configuración</h5>
            <p class="card-text">
              Preferencias, exportaciones, limpieza de datos.
            </p>
            <RouterLink class="btn btn-outline-secondary" to="/descargarExcel"
              >Descargar Excel</RouterLink
            >
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No necesitas lógica si solo navegas
</script>
