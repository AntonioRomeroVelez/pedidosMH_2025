<template>
  <div v-if="noHayProductos !== null">
    <div class="alert alert-info text-center mt-3 shadow-sm">
      <i class="bi bi-box-seam"></i> {{ noHayProductos }}
    </div>
  </div>

  <div class="container py-4" v-else>
    <!-- Buscador -->
    <div class="sticky-buscador">
      <div class="input-group mb-4">
        <span class="input-group-text bg-light">🔍</span>
        <input
          v-model="busqueda"
          type="text"
          class="form-control form-control-lg"
          placeholder="Buscar..."
        />
      </div>
    </div>

    <!-- Mensaje carga -->
    <div v-if="loading">
      <LoadingComponent />
    </div>

    <!-- Tarjetas de productos -->
    <!-- Tarjetas de productos -->
    <div class="row" v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-primary fw-bold mb-0">
          🧮 Total de productos: {{ cantidadProductos }}
        </h5>

        <RouterLink class="btn btn-success" style="color: white" :to="'/crear'">
          📦 Nuevo producto
        </RouterLink>
      </div>

      <div class="container">
        <div class="row g-1 justify-content-center">
          <div
            v-for="producto in productosPaginados"
            :key="producto.ID"
            class="col-md-6 col-lg-4"
          >
            <div
              class="card border border-primary rounded-1 shadow-sm h-100"
              style="border-width: 2px"
            >
              <div class="card-body d-flex flex-column justify-content-between">
                <div class="mb-3">
                  <h5
                    class="card-title text-primary fw-bold d-flex align-items-center"
                  >
                    🧪 {{ producto.NombreProducto }}
                  </h5>
                  <p class="card-subtitle text-muted mb-1">
                    {{ producto.Marca }} | {{ producto.Presentacion }}
                  </p>
                  <p class="card-subtitle text-muted mb-1">
                    <strong>🧬 Principio Activo:</strong><br />
                    {{ producto.PrincipioActivo }}
                  </p>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between flex-wrap">
                    <span class="badge bg-light text-dark border mb-2">
                      🏥 P. Farmacia: ${{ producto.PrecioFarmacia.toFixed(2) }}
                    </span>
                    <span class="badge bg-light text-dark border mb-2">
                      💰 PVP: ${{ producto.PVP.toFixed(2) }}
                    </span>
                  </div>
                  <div class="d-flex justify-content-between flex-wrap">
                    <span
                      v-if="producto.Descuento"
                      class="badge bg-success-subtle text-success mb-2"
                    >
                      🎁 Descuento: {{ producto.Descuento }}%
                    </span>
                    <span
                      v-if="producto.IVA"
                      class="badge bg-danger-subtle text-danger mb-2"
                    >
                      🧾 IVA: {{ producto.IVA }}%
                    </span>
                  </div>
                </div>

                <div class="text-center">
                  <router-link
                    class="btn btn-outline-secondary w-75"
                    :to="'/producto/' + producto.ID"
                  >
                    🔍 Ver detalles
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📄 Controles de paginación -->
        <div class="d-flex justify-content-center align-items-center mt-4">
          <button
            class="btn btn-outline-primary me-2"
            @click="paginaAnterior"
            :disabled="paginaActual === 1"
          >
            ⬅️ Anterior
          </button>

          <span class="fw-bold">
            Página {{ paginaActual }} / {{ totalPaginas }}
          </span>

          <button
            class="btn btn-outline-primary ms-2"
            @click="paginaSiguiente"
            :disabled="paginaActual === totalPaginas"
          >
            Siguiente ➡️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import LoadingComponent from "./LoadingComponent.vue";
import Fuse from "fuse.js";

const productos = ref([]);
const busqueda = ref("");
const resultados = ref([]);
const noHayProductos = ref(null);
const loading = ref(false);
const cantidadProductos = ref(0);
let fuse = null;

// 🔢 Paginación
const paginaActual = ref(1);
const elementosPorPagina = 10;

// 🧮 Calcular páginas totales
const totalPaginas = computed(() =>
  Math.ceil(resultados.value.length / elementosPorPagina)
);

// 🔄 Productos a mostrar según página
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;
  return resultados.value.slice(inicio, fin);
});

// ⏪ Cambiar página
const paginaAnterior = () => {
  if (paginaActual.value > 1) paginaActual.value--;
};
const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
};

// 1️⃣ Cargar datos
onMounted(() => {
  const datosGuardados = localStorage.getItem("ListaProductos");
  if (datosGuardados) {
    productos.value = JSON.parse(datosGuardados);
    cantidadProductos.value = productos.value.length;

    fuse = new Fuse(productos.value, {
      keys: ["NombreProducto", "Marca", "PrincipioActivo"],
      threshold: 0.3,
    });

    resultados.value = productos.value;
  } else {
    noHayProductos.value =
      "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
  }
});

// 2️⃣ Búsqueda con debounce + reinicio de página
let timeout = null;
watch(busqueda, (valor) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const texto = valor.trim().toLowerCase();
    paginaActual.value = 1; // Reiniciar al buscar
    if (!texto) {
      resultados.value = productos.value;
    } else {
      resultados.value = fuse
        ? fuse.search(texto).map((r) => r.item)
        : productos.value.filter(
            (p) =>
              p.NombreProducto?.toLowerCase().includes(texto) ||
              p.Marca?.toLowerCase().includes(texto) ||
              p.PrincipioActivo?.toLowerCase().includes(texto)
          );
    }
  }, 300);
});
</script>

<style>
.sticky-buscador {
  width: 60%;
  position: sticky;
  top: 0px;
  z-index: 5000;
  background-color: transparent;
  padding-top: 5px;
  margin-left: 70px;
}
@media (max-width: 768px) {
  .sticky-buscador {
    width: 80%;
    margin-left: 0px;
  }
}
</style>
