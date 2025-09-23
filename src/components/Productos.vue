<template>
  <div class="container py-4">
    <!-- Encabezado y acción -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-dark fw-bold">📦 Gestión de Productos</h2>
      <router-link class="btn btn-success btn-lg" to="/crearProducto">
        ➕ Crear producto nuevo
      </router-link>
    </div>

    <!-- Buscador -->
    <div class="input-group mb-4">
      <span class="input-group-text bg-light">🔍</span>
      <input
        v-model="busqueda"
        type="text"
        class="form-control form-control-lg"
        placeholder="Buscar por nombre de producto..."
      />
    </div>

    <div v-if="Loading">
      <LoadingComponent />
    </div>

    <!-- Tarjetas de productos -->
    <div class="row" v-else>
      <div
        class="col-lg-4 col-md-6 mb-4"
        v-for="producto in productosFiltrados"
        :key="producto.id"
      >
        <div class="card h-100 shadow-sm border-2">
          <div class="card-body d-flex flex-column justify-content-between">
            <h4 class="card-title text-primary fw-semibold mb-3">
              {{ producto.NombreProducto }}
            </h4>

            <div class="mb-3 fs-6">
              <p><strong>Presentación:</strong> {{ producto.Presentacion }}</p>
              <p>
                <strong>Principio Activo:</strong>
                {{ producto.PrincipioActivo }}
              </p>
              <p><strong>PVP:</strong> ${{ producto.PVP }}</p>
              <p>
                <strong>Descuento:</strong>
                {{
                  producto.Descuento
                    ? producto.Descuento + "%"
                    : "No hay descuento"
                }}
              </p>
              <p>
                <strong>Promoción:</strong>
                {{ producto.Promocion || "Sin promoción" }}
              </p>
              <p>
                <strong>IVA:</strong>
                {{ producto.IVA > 0 ? producto.IVA + "%" : "No aplica" }}
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2 justify-content-center mt-auto">
              <button
                class="btn btn-outline-danger px-3"
                @click="EliminarProducto(producto.id, producto.NombreProducto)"
              >
                🗑️ Eliminar
              </button>
              <RouterLink
                class="btn btn-outline-warning px-3"
                :to="'editarProducto/' + producto.id"
              >
                ✏️ Editar
              </RouterLink>
              <RouterLink
                class="btn btn-outline-primary px-3"
                :to="'producto/' + producto.id"
              >
                🔍 Ver
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import LoadingComponent from "./LoadingComponent.vue";

const busqueda = ref("");
const productos = ref([]);
const Loading = ref(false);

const productosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim();
  return productos.value.filter((p) =>
    p.NombreProducto.toLowerCase().includes(texto)
  );
});

async function obtenerProductos() {
  Loading.value = true;
  try {
    const response = await axios.get("http://localhost:8000/api/productos");
    productos.value = response.data;
    Loading.value = false;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  obtenerProductos();
});

const EliminarProducto = async (id, NombreProducto) => {
  const confirmDelete = window.confirm(
    `estas seguro de querer eliminar el ${NombreProducto}?`
  );
  if (confirmDelete) {
    try {
      await axios.delete(`http://localhost:8000/api/productos/${id}`);
      obtenerProductos();
    } catch (error) {
      console.log(`error al eliminar el ${NombreProducto}`, error);
    }
  }
};
</script>
