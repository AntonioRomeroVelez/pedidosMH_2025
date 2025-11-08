<template>
  <div>
    <!-- 🧩 Mensaje sin productos -->
    <div
      v-if="noHayProductos !== null"
      class="d-flex justify-content-center align-items-center"
      style="height: 80vh"
    >
      <div class="alert alert-info text-center shadow-sm p-4">
        <i class="bi bi-box-seam fs-3 text-primary mb-2 d-block"></i>
        <h5 class="fw-bold mb-1">Sin productos disponibles</h5>
        <p class="mb-0 small text-muted">{{ noHayProductos }}</p>
      </div>
    </div>

    <!-- 🧪 Contenedor principal -->
    <div class="container py-4" v-else>
      <!-- 🔍 Buscador -->
      <div class="card border-0 shadow-sm sticky-buscador mb-4">
        <div class="card-body p-3">
          <div class="input-group input-group-lg">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-primary"></i>
            </span>
            <input
              v-model="busqueda"
              type="text"
              class="form-control border-start-0"
              placeholder="Buscar por nombre, marca o principio activo..."
              @keyup.enter="buscarProductos"
            />
            <button class="btn btn-primary" @click="buscarProductos">
              Buscar <i class="bi bi-arrow-right-short ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ⏳ Cargando -->
      <div v-if="loading" class="text-center py-5">
        <LoadingComponent />
      </div>

      <!-- 📦 Lista de productos -->
      <div v-else>
        <div class="row g-3 justify-content-center">
          <div
            v-for="producto in productosPaginados"
            :key="producto.ID"
            class="col-12 col-sm-6 col-lg-3"
          >
            <div class="card border-0 shadow-sm h-100 hover-card">
              <div class="card-body d-flex flex-column justify-content-between">
                <!-- Título y marca -->
                <div>
                  <h5
                    class="text-primary fw-bold mb-2 d-flex align-items-center"
                  >
                    <i class="bi bi-capsule me-2"></i>
                    {{ producto.NombreProducto }}
                  </h5>
                  <p class="text-muted mb-1 small">
                    {{ producto.Marca }} | {{ producto.Presentacion }}
                  </p>
                  <!-- <p class="text-muted mb-2 small">
                    
                    <strong>🧬 Principio Activo:</strong><br />
                    {{ producto.PrincipioActivo }}
                  </p> -->
                  <p
                    v-if="
                      producto.PrincipioActivo &&
                      producto.PrincipioActivo.toLowerCase() !== 'insumo'
                    "
                    class="text-muted mb-2 small"
                  >
                    <strong>🧬 Principio Activo:</strong><br />
                    {{ producto.PrincipioActivo }}
                  </p>
                </div>

                <!-- Precios -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between flex-wrap">
                    <span class="badge bg-light text-dark border">
                      🏥 Farmacia: ${{ producto.PrecioFarmacia.toFixed(2) }}
                    </span>
                    <span class="badge bg-light text-dark border">
                      💰 PVP: ${{ producto.PVP.toFixed(2) }}
                    </span>
                  </div>

                  <!-- Descuentos y promoción -->
                  <div class="d-flex justify-content-between flex-wrap mt-2">
                    <span
                      v-if="producto.Descuento"
                      class="badge bg-success-subtle text-success"
                    >
                      🎁 {{ producto.Descuento }}% descuento
                    </span>
                    <span
                      v-if="producto.IVA"
                      class="badge bg-danger-subtle text-danger"
                    >
                      🧾 IVA {{ producto.IVA }}%
                    </span>
                    <span
                      v-if="producto.Promocion"
                      class="badge bg-warning-subtle text-dark"
                    >
                      🎉 {{ producto.Promocion }}
                    </span>
                  </div>
                </div>

                <!-- Botón de acción -->
                <div class="text-center">
                  <router-link
                    class="btn btn-outline-primary w-75"
                    :to="{
                      path: '/producto/' + producto.ID,
                      query: {
                        modo: modo === 'gestionar' ? 'gestionar' : 'ver',
                      },
                    }"
                  >
                    🔍 Ver Producto
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📄 Paginación -->
        <div
          class="d-flex justify-content-center align-items-center mt-5 gap-3"
        >
          <button
            class="btn btn-outline-primary"
            @click="paginaAnterior"
            :disabled="paginaActual === 1"
          >
            ⬅️ Anterior
          </button>

          <span class="fw-bold text-secondary">
            Página {{ paginaActual }} / {{ totalPaginas }}
          </span>

          <button
            class="btn btn-outline-primary"
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

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.sticky-buscador {
  position: sticky;
  top: 70px;
  z-index: 10;
  background: #f8f9fa;
}

.card-body {
  font-size: 0.95rem;
}

.btn i {
  vertical-align: middle;
}
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import LoadingComponent from "./LoadingComponent.vue";
import Fuse from "fuse.js";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();

const modo = computed(() => route.query.modo || "ver");

const productos = ref([]);
const busqueda = ref("");
const resultados = ref([]);
const noHayProductos = ref(null);
const loading = ref(false);
const cantidadProductos = ref(0);
let fuse = null;

// 🔢 Paginación
const paginaActual = ref(1);
const elementosPorPagina = 5;

// 🧮 Calcular páginas totales
const totalPaginas = computed(() =>
  Math.ceil(resultados.value.length / elementosPorPagina)
);

// 🔄 Productos según página
const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;
  return resultados.value.slice(inicio, fin);
});

const paginaAnterior = () => {
  if (paginaActual.value > 1) paginaActual.value--;
};
const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
};

// 📦 Cargar datos
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

const buscarProductos = () => {
  const texto = busqueda.value.trim().toLowerCase();
  paginaActual.value = 1;

  if (!texto) {
    resultados.value = productos.value;
  } else {
    resultados.value = fuse
      ? fuse.search(texto).map((r) => r.item)
      : productos.value.filter(
          (p) =>
            p.NombreProducto?.toLowerCase() === texto ||
            p.Marca?.toLowerCase() === texto ||
            p.PrincipioActivo?.toLowerCase() === texto
        );
  }
};
</script>
