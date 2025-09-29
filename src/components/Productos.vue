<template>
  <div v-if="noHayProductos !== null">
    <div class="alert alert-info text-center mt-3 shadow-sm">
      <i class="bi bi-box-seam"></i> {{ noHayProductos }}
    </div>
  </div>
  <div class="container py-4" v-else>
    <!-- Buscador -->
    <div class="sticky-buscador" style="width: 80%">
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
    <div class="row" v-else>
      <h5 class="text-primary fw-bold mb-3">
        🧮 Total de productos: {{ cantidadProductos }}
      </h5>

      <div class="container">
        <div class="row g-1 justify-content-center">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.ID"
            class="col-md-6 col-lg-4"
          >
            <div
              class="card border border-primary rounded-1 shadow-sm h-100"
              style="border-width: 2px"
            >
              <div class="card-body d-flex flex-column justify-content-between">
                <!-- Encabezado -->
                <div class="mb-3">
                  <h5
                    class="card-title text-primary fw-bold d-flex align-items-center"
                  >
                    🧪 {{ producto.NombreProducto }}
                  </h5>
                  <p class="card-subtitle text-muted mb-1">
                    {{ producto.Marca }} | {{ producto.Presentacion }}
                  </p>
                </div>

                <!-- Precios y detalles -->
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

                <!-- Acción -->
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LoadingComponent from "./LoadingComponent.vue";
import { computed } from "vue";

const productos = ref([]);
const busqueda = ref("");
const noHayProductos = ref(null);
const loading = ref(false);
const cantidadProductos = ref(0);

onMounted(() => {
  const datosGuardados = localStorage.getItem("ListaProductos");
  if (datosGuardados) {
    productos.value = JSON.parse(datosGuardados);
    console.log("datosGuardados :", datosGuardados);
    cantidadProductos.value = productos.value.length;
  } else {
    noHayProductos.value =
      "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
  }
});

const productosFiltrados = computed(() => {
  // const texto = busqueda.value.toLowerCase().trim();
  // return productos.value.filter((p) =>
  //   p.NombreProducto?.toLowerCase().includes(texto)
  // );

  return productos.value.filter((p) => {
    const texto = busqueda.value.toLowerCase().trim();
    return (
      p.NombreProducto?.toLowerCase().includes(texto) ||
      p.Marca?.toLowerCase().includes(texto) ||
      p.PrincipioActivo?.toLowerCase().includes(texto)
    );
  });
});
</script>

<style>
.sticky-buscador {
  position: sticky;
  top: 0px;
  z-index: 1000;
  background-color: white;
  padding-top: 5px;
}
</style>
