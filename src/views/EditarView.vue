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

<style>
.alertify-notifier {
  z-index: 9999 !important;
}

/* Alertify: asegurar visibilidad por encima de overlays y en pantallas móviles */
.ajs-notifier,
.ajs-message,
.ajs-reset,
.ajs-log,
.ajs-error,
.ajs-success,
.ajs-alert,
.ajs-notifier.ajs-top,
.ajs-dialog {
  z-index: 2147483647 !important;
  pointer-events: auto !important;
}

.ajs-notifier {
  max-width: 95% !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  box-sizing: border-box !important;
  padding: 0 0.25rem !important;
}
.ajs-notifier {
  position: fixed !important;
  top: 20px !important;
  z-index: 2147483647 !important;
}

.ajs-message {
  word-break: break-word !important;
  white-space: normal !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  font-size: 15px !important;
  padding: 12px 16px !important;
}

/* Mejorar visibilidad de los diálogos de confirmación */
.ajs-dialog {
  max-width: 95% !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.ajs-header {
  border-radius: 12px 12px 0 0 !important;
  padding: 16px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

.ajs-body {
  padding: 16px !important;
  font-size: 15px !important;
}

.ajs-footer {
  padding: 12px 16px !important;
  border-radius: 0 0 12px 12px !important;
}

.ajs-button {
  border-radius: 6px !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
  transition: all 0.2s !important;
}

@media (max-width: 480px) {
  .ajs-notifier {
    top: 12px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 90% !important;
    font-size: 14px !important;
  }

  .ajs-message {
    padding: 10px 12px !important;
    font-size: 14px !important;
  }
  .ajs-dialog {
    margin: 16px !important;
  }

  .ajs-body {
    padding: 12px !important;
  }

  .ajs-footer {
    padding: 8px 12px !important;
  }

  .ajs-button {
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
}

/* Mejoras para mensajes de éxito/error */
.ajs-success {
  background-color: #d4edda !important;
  color: #155724 !important;
  border-color: #c3e6cb !important;
}

.ajs-error {
  background-color: #f8d7da !important;
  color: #721c24 !important;
  border-color: #f5c6cb !important;
}

/* Backdrop para diálogos */
.ajs-dim {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}
</style>
