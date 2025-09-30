<template>
  <div class="container mt-5">
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h1 class="text-center text-primary fw-bold mb-4">🛠️ Nuevo producto</h1>

        <h3 class="text-primary fw-bold mb-4 d-flex">
          🧪
          <input
            type="text"
            v-model="producto.NombreProducto"
            class="form-control"
            placeholder="Nombre del producto"
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

        <!-- Botones -->
        <div class="d-flex gap-5 justify-content-center align-items-center">
          <RouterLink class="btn btn-danger px-5" to="/Productos">
            ❌ Cancelar creación
          </RouterLink>
          <button class="btn btn-success px-5" @click="guardarCambios">
            💾 Guardar producto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import alertify from "alertifyjs";

const router = useRouter();

const producto = ref({
  ID: Date.now().toString(),
  NombreProducto: "",
  Presentacion: "",
  PrincipioActivo: "",
  Marca: "",
  IVA: 0,
  PrecioFarmacia: 0,
  PVP: 0,
  Promocion: "",
  Descuento: 0,
});

const guardarCambios = () => {
  // Validación de campos requeridos
  const camposObligatorios = [
    producto.value.NombreProducto,
    producto.value.Presentacion,
    producto.value.PrincipioActivo,
    producto.value.Marca,
  ];

  const preciosValidos =
    producto.value.PrecioFarmacia > 0 && producto.value.PVP > 0;

  if (
    camposObligatorios.some((campo) => campo.trim() === "") ||
    !preciosValidos
  ) {
    alertify.error(
      "❌ Todos los campos requeridos deben estar completos y los precios deben ser mayores a 0"
    );
    return;
  }

  const productosGuardados = JSON.parse(
    localStorage.getItem("ListaProductos") || "[]"
  );

  productosGuardados.push(producto.value);
  localStorage.setItem("ListaProductos", JSON.stringify(productosGuardados));

  alertify.success("✅ Producto creado correctamente");
  router.push("/Productos");
};
</script>
