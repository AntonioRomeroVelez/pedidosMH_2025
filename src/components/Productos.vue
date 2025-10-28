<template>
  <div v-if="noHayProductos !== null">
    <div class="alert alert-info text-center mt-3 shadow-sm">
      <i class="bi bi-box-seam"></i> {{ noHayProductos }}
    </div>
  </div>

  <div class="container py-4" v-else>
    <!-- 🔍 Buscador -->
    <div class="sticky-buscador">
      <div class="input-group">
        <span class="input-group-text border-0 bg-white">
          <i class="bi bi-search text-primary"></i>
        </span>
        <input
          v-model="busqueda"
          type="text"
          class="form-control form-control-lg"
          placeholder="Buscar por nombre, marca o principio activo..."
          @keyup.enter="buscarProductos"
        />
        <button class="btn btn-primary btn-lg" @click="buscarProductos">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Mensaje carga -->
    <div v-if="loading">
      <LoadingComponent />
    </div>

    <!-- Tarjetas de productos -->
    <div class="row" v-else>
      
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
                    @click="cerrarMenuMobile"
                  >
                    🔍 Ver Producto
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
import { ref, onMounted, computed } from "vue";
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
  // Pedir al navbar móvil que se oculte si está abierto
  try { window.dispatchEvent(new Event('close-mobile-menu')); } catch (e) {}
};
const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
  // Pedir al navbar móvil que se oculte si está abierto
  try { window.dispatchEvent(new Event('close-mobile-menu')); } catch (e) {}
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

// Función para notificar al navbar que cierre el menú móvil
const cerrarMenuMobile = () => {
  try { window.dispatchEvent(new Event('close-mobile-menu')); } catch (e) {}
};
</script>

<style>
/* Estilos base del buscador */
.sticky-buscador {
  position: sticky;
  z-index: 100;
  background-color: transparent;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.input-group {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.input-group:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.input-group-text {
  background-color: white !important;
  border: none !important;
  color: #0d6efd;
  font-size: 1.2rem;
  padding-left: 1rem;
}

.form-control-lg {
  border: none;
  font-size: 1rem;
  background-color: white;
}

.form-control-lg:focus {
  box-shadow: none;
  background-color: white;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
  transition: all 0.3s ease;
  padding: 0.5rem 1.5rem;
}

.btn-primary:hover {
  background-color: #198691;
}

/* Pantallas extra grandes (≥1400px) */
@media (min-width: 1400px) {
  .sticky-buscador {
    width: 50%;
    padding: 20px;
  }
  .form-control-lg {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
}

/* Pantallas grandes (≥1200px) */
@media (min-width: 1200px) and (max-width: 1399px) {
  .sticky-buscador {
    width: 55%;
    padding: 15px;
  }
}

/* Pantallas medianas (≥992px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .sticky-buscador {
    width: 65%;
    padding: 15px;
  }
}

/* Pantallas pequeñas (≥768px) */
@media (min-width: 768px) and (max-width: 991px) {
  .sticky-buscador {
    width: 85%;
    padding: 12px;
    margin: 3px 0px;
  }
  .form-control-lg {
    padding: 0.75rem 1rem;
  }
}

/* Tablets (≥576px) */
@media (min-width: 576px) and (max-width: 767px) {
  .sticky-buscador {
    width: 100%;
    padding: 0px;
    margin: 3px 0px;
  }
  .btn-primary {
    padding: 0.5rem 1rem;
  }
}

/* Móviles (<576px) */
@media (max-width: 575px) {
  .sticky-buscador {
    width: 100%;
    padding: 0px;
    margin: 3px 0px;
  }
  .form-control-lg {
    padding: 0.5rem;
    font-size: 0.95rem;
  }
  .input-group-text {
    padding-left: 0.75rem;
    font-size: 1rem;
  }
  .btn-primary {
    padding: 0.5rem 0.75rem;
  }
  .form-control-lg::placeholder {
    font-size: 0.9rem;
  }
}
</style>
