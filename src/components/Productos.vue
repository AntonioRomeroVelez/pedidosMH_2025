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
        <div class="row g-3 justify-content-center">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.ID"
            class="col-md-6 col-lg-4 d-flex justify-content-center"
            style="max-width: 550px"
          >
            <div class="list-group w-100 shadow-sm border border-1 rounded-3">
              <div
                class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-3"
              >
                <!-- Info producto -->
                <div>
                  <h6 class="mb-1 fw-bold text-dark">
                    {{ producto.NombreProducto }}
                  </h6>
                  <small class="text-muted">
                    {{ producto.Marca }} | {{ producto.Presentacion }}
                  </small>
                </div>

                <!-- Precio -->
                <div class="text-end">
                  <small class="text-success fw-bold d-block">
                    {{
                      producto.Descuento ? producto.Descuento + "% Dscto." : ""
                    }}
                  </small>
                  <small class="d-block text-danger fw-bold">
                    {{ producto.IVA ? "IVA " + producto.IVA + " %" : "" }}
                  </small>
                </div>
              </div>

              <div class="px-3 py-2 text-center">
                <div class="d-flex gap-3 flex-wrap justify-content-center mt-3">
                  <button
                    type="button"
                    class="btn btn-outline-success btn-sm rounded-2"
                    style="pointer-events: none; cursor: default; width: 100px"
                  >
                    🏥 Precio Farmacia: <br />
                    ${{ producto.PrecioFarmacia.toFixed(2) }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm rounded-2"
                    style="pointer-events: none; cursor: default; width: 100px"
                  >
                    💰 PVP: <br />
                    ${{ producto.PVP.toFixed(2) }}
                  </button>
                  <router-link
                    class="btn btn-sm btn-outline-secondary rounded-2"
                    style="width: 150px"
                    :to="'/producto/' + producto.ID"
                  >
                    🔍 Ver
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
