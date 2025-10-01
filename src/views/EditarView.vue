<template>
  <div class="container mt-5">
    <div v-if="producto" class="card border-0 shadow-sm">
      <div class="card-body">
        <h1 class="text-center text-primary fw-bold mb-4">
          🛠️ Edición de producto
        </h1>

        <h3 class="text-primary fw-bold mb-4 d-flex">
          🧪
          <input
            type="text"
            v-model="producto.NombreProducto"
            class="form-control"
          />
        </h3>

        <div class="row g-3">
          <!-- Columna izquierda -->
          <div class="col-md-6">
            <ul class="list-unstyled mb-0">
              <li>
                <strong>📦 Presentación:</strong>
                <input
                  type="text"
                  v-model="producto.Presentacion"
                  class="form-control"
                />
              </li>
              <li>
                <strong>🧬 Principio Activo:</strong>
                <input
                  type="text"
                  v-model="producto.PrincipioActivo"
                  class="form-control"
                />
              </li>
              <li>
                <strong>🏷️ Marca:</strong>
                <input
                  type="text"
                  v-model="producto.Marca"
                  class="form-control"
                />
              </li>
              <li>
                <strong>🧾 IVA:</strong>
                <select v-model="producto.IVA" class="form-control">
                  <option :value="0">No aplica</option>
                  <option :value="15">15%</option>
                </select>
              </li>
            </ul>
          </div>

          <!-- Columna derecha -->
          <div class="col-md-6">
            <ul class="list-unstyled mb-0">
              <li>
                <strong>💊 Precio Farmacia:</strong>
                <input
                  type="number"
                  v-model="producto.PrecioFarmacia"
                  class="form-control"
                />
              </li>
              <li>
                <strong>💰 PVP:</strong>
                <input
                  type="number"
                  v-model="producto.PVP"
                  class="form-control"
                />
              </li>
              <li>
                <strong>🎁 Promoción:</strong>
                <input
                  type="text"
                  v-model="producto.Promocion"
                  class="form-control"
                />
              </li>
              <li>
                <strong>🔻 Descuento:</strong>
                <div class="d-flex align-items-center">
                  <input
                    type="number"
                    v-model="producto.Descuento"
                    class="form-control"
                    style="width: 100px"
                  />
                  %
                </div>
              </li>
            </ul>
          </div>
        </div>

        <hr class="my-4" />

        <!-- Botón de regreso -->
        <div class="d-flex gap-5 justify-content-center align-items-center">
          <RouterLink
            class="btn btn-danger px-2 sm"
            style="color: white"
            :to="'/producto/' + producto.ID"
          >
            ❌ Cancelar
          </RouterLink>

          <button class="btn btn-success px-2 sm" @click="guardarCambios">
            💾 Guardar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <h4 class="text-danger">❌ Producto no encontrado</h4>
      <RouterLink class="btn btn-secondary mt-3" to="/Productos">
        🔙 Volver al listado
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import alertify from "alertifyjs";

const route = useRoute();
const router = useRouter();
const producto = ref(null);
const cantidad = ref("");

onMounted(() => {
  const productosGuardados = JSON.parse(
    localStorage.getItem("ListaProductos") || "[]"
  );
  producto.value = productosGuardados.find((p) => p.ID === route.params.id);
});

const guardarCambios = () => {
  const productosGuardados = JSON.parse(
    localStorage.getItem("ListaProductos") || "[]"
  );
  const index = productosGuardados.findIndex((p) => p.ID === producto.value.ID);

  if (index !== -1) {
    productosGuardados[index] = producto.value;
    localStorage.setItem("ListaProductos", JSON.stringify(productosGuardados));
    alertify.success("✅ Cambios guardados correctamente");
    router.push("/Productos"); // opcional: redirige al listado
  } else {
    alertify.error("❌ No se pudo guardar el producto");
  }
};
</script>
