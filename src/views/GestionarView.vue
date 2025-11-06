<template>
  <div class="container py-5" style="margin-top: 60px">
    <div class="text-center mb-5">
      <h2 class="fw-bold text-primary">
        🧭 Panel de Gestiones de la Aplicación
      </h2>
      <p class="text-muted">
        Administra tus productos, archivos Excel y configuraciones.
      </p>
      <hr class="w-25 mx-auto opacity-75" />
    </div>

    <div class="row g-4">
      <!-- Gestión de productos -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-box-seam text-success fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-success mb-0">Productos</h5>
            </div>
            <p class="text-muted mb-2">Gestión y control de inventario.</p>
            <p class="fw-semibold text-primary mb-3">
              Total productos: {{ cantidadProductos }}
            </p>
            <RouterLink class="btn btn-success w-100" to="/GestionarProductos">
              <i class="bi bi-pencil-square me-2"></i> Gestionar Productos
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Cargar Excel -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-file-earmark-excel text-info fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-info mb-0">Cargar Excel</h5>
            </div>
            <p class="text-muted mb-3">
              Importa productos desde un archivo Excel existente.
            </p>
            <RouterLink class="btn btn-info w-100 text-white" to="/cargarexcel">
              <i class="bi bi-upload me-2"></i> Ir a carga Excel
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Carrito -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-cart4 text-warning fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-warning mb-0">Carrito</h5>
            </div>
            <p class="text-muted mb-3">
              Consulta y administra productos en tu carrito.
            </p>
            <RouterLink class="btn btn-warning w-100" to="/carrito">
              <i class="bi bi-bag-check me-2"></i> Ir al carrito
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Descargar Excel -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-gear text-secondary fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-secondary mb-0">
                Descargar Excel
              </h5>
            </div>
            <p class="text-muted mb-3">
              Exporta tus productos o genera respaldos.
            </p>
            <RouterLink
              class="btn btn-outline-secondary w-100"
              to="/descargarExcel"
            >
              <i class="bi bi-download me-2"></i> Descargar Excel
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Comparar Excel -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-diagram-3 text-primary fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-primary mb-0">
                Comparar Excel
              </h5>
            </div>
            <p class="text-muted mb-3">
              Compara productos del Excel total con los nuevos o modificados.
            </p>
            <RouterLink class="btn btn-primary w-100" to="/compararExcel">
              <i class="bi bi-arrow-left-right me-2"></i> Comparar Excel
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Normalizar Excel -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-funnel text-success fs-3 me-2"></i>
              <h5 class="card-title fw-bold text-success mb-0">
                Formatear Excel
              </h5>
            </div>
            <p class="text-muted mb-3">
              Limpia y estandariza archivos Excel antes de cargarlos.
            </p>
            <RouterLink
              class="btn btn-outline-success w-100"
              to="/normalizarExcel"
            >
              <i class="bi bi-sliders me-2"></i> Formatear Excel
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import alertify from "alertifyjs";

import { useToast } from "vue-toastification";
const toast = useToast();

const cantidadProductos = ref(0);
const resultados = ref([]);
const productos = ref([]);
const noHayProductos = ref(null);
const router = useRouter();

// No necesitas lógica si solo navegas
onMounted(() => {
  const datosGuardados = localStorage.getItem("ListaProductos");
  if (datosGuardados) {
    productos.value = JSON.parse(datosGuardados);
    cantidadProductos.value = productos.value.length;

    resultados.value = productos.value;
  } else {
    noHayProductos.value =
      "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
  }
});

const vaciarProductos = () => {
  alertify.confirm(
    "⚠️ Confirmación",
    "¿Estás seguro de eliminar todos los productos cargados?",
    () => {
      // Eliminar del storage y actualizar estado local para reflejar el cambio inmediatamente
      localStorage.removeItem("ListaProductos");
      productos.value = [];
      resultados.value = [];
      cantidadProductos.value = 0;
      noHayProductos.value =
        "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
      toast.success("✅ Registros eliminados");
      setTimeout(() => {
        router.push("/");
      }, 1000);
      // No es necesario navegar a la misma ruta; si quieres forzar reload, podemos usar router.push o location.reload()
    },
    () => {
      toast.error("❌ Operación cancelada");
    }
  );
};
</script>

<style scoped>
.alertify-notifier {
  z-index: 9999 !important;
}
</style>
