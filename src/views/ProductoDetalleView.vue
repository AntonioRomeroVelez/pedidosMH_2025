<template>
  <div class="container mt-5">
    <div v-if="producto" class="card border-0 shadow-sm">
      <div class="card-body">
        <!-- Cantidad y botón de agregar (ahora arriba) -->
        <div v-if="modo === 'gestionar'"></div>

        <div class="row g-3 align-items-center mb-4" v-else>
          <div class="col-4">
            <input
              type="number"
              min="1"
              v-model="cantidad"
              class="form-control py-2 fs-1 text text-center"
              id="cantidad"
              placeholder="0"
            />
          </div>
          <div class="col-8">
            <button
              class="btn btn-lg btn-primary w-100 w-md-auto"
              @click="agregarAlCarrito"
            >
              🛒 Agregar al carrito
            </button>
          </div>
        </div>

        <h3 class="text-primary fw-bold mb-4">
          🧪 {{ producto.NombreProducto }}
        </h3>

        <div class="row g-3">
          <!-- Columna izquierda -->
          <div class="col-md-6">
            <ul class="list-unstyled mb-0">
              <li>
                <strong>📦 Presentación:</strong> {{ producto.Presentacion }}
              </li>
              <li>
                <strong>🧬 Principio Activo:</strong>
                {{ producto.PrincipioActivo }}
              </li>
              <li><strong>🏷️ Marca:</strong> {{ producto.Marca }}</li>
              <li>
                <strong>🧾 IVA:</strong>
                {{ producto.IVA > 0 ? producto.IVA + "%" : "No aplica" }}
              </li>
            </ul>
          </div>

          <!-- Columna derecha -->
          <div class="col-md-6">
            <ul class="list-unstyled mb-0">
              <li>
                <strong>💊 Precio Farmacia:</strong> ${{
                  producto.PrecioFarmacia.toFixed(2)
                }}
              </li>
              <li><strong>💰 PVP:</strong> ${{ producto.PVP.toFixed(2) }}</li>
              <li>
                <strong>🎁 Promoción:</strong>
                {{ producto.Promocion || "Sin promoción" }}
              </li>
              <li><strong>🔻 Descuento:</strong> {{ producto.Descuento }}%</li>
            </ul>
          </div>
        </div>

        <hr class="my-4" />

        <div v-if="modo === 'gestionar'">
          <!-- <p>gestinar prodcutp</p> -->
          <!-- Mostrar producto -->
          <div
            class="text-center mt-4 d-flex gap-3 align-content-center justify-content-center"
          >
            <button class="btn btn-danger px-2 sm" @click="eliminarProducto">
              🗑️ Eliminar
            </button>

            <router-link
              class="btn btn-info px-2 sm"
              :to="'/editar/' + producto.ID"
            >
              ✏️ Editar
            </router-link>
            
            <RouterLink class="btn btn-warning px-2 sm" to="/Productos">
              🔙 Regresar
            </RouterLink>
          </div>
        </div>

        <div v-else>
          <!-- <p>solo ver producto</p> -->
          <div
            class="text-center mt-4 d-flex gap-3 align-content-center justify-content-center"
          >
            <RouterLink class="btn btn-warning px-2 sm" to="/Productos">
              🔙 Regresar
            </RouterLink>
          </div>
        </div>

        <!-- Botón de regreso -->
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import alertify from "alertifyjs";

import { useToast } from "vue-toastification";
const toast = useToast();

const route = useRoute();

const modo = computed(() => route.query.modo || "ver");

const router = useRouter();
const producto = ref(null);
const cantidad = ref("");

import { calcularPromocionYTotales } from "../servicios/utility";

onMounted(() => {
  const productosGuardados = JSON.parse(
    localStorage.getItem("ListaProductos") || "[]"
  );
  producto.value = productosGuardados.find((p) => p.ID === route.params.id);
});

const eliminarProducto = () => {
  alertify.confirm(
    "¿Eliminar producto?",
    "Esta acción no se puede deshacer.",
    () => {
      const productosGuardados = JSON.parse(
        localStorage.getItem("ListaProductos") || "[]"
      );
      const nuevosProductos = productosGuardados.filter(
        (p) => p.ID !== producto.value.ID
      );
      localStorage.setItem("ListaProductos", JSON.stringify(nuevosProductos));
      toast.success("🗑️ Producto eliminado");
      router.push("/Productos");
    },
    () => {
      toast.message("❌ Cancelado");
    }
  );
};

const agregarAlCarrito = () => {
  const cantidadNum = parseInt(cantidad.value);
  if (!cantidadNum || cantidadNum < 1) {
    toast.error("❌ Ingresa una cantidad válida antes de agregar.");
    return;
  }

  const unidadesEntregadas = calcularPromocionYTotales(
    cantidadNum,
    producto.value.Promocion
  ).total;

  const item = {
    ...producto.value,
    cantidad: cantidadNum,
    unidadesEntregadas,
  };

  const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  const index = carrito.findIndex((p) => p.ID === item.ID);

  if (index !== -1) {
    carrito[index].cantidad += item.cantidad;
    carrito[index].unidadesEntregadas += item.unidadesEntregadas;
    toast.warning(
      `⚠️ Cantidad actualizada: "${item.NombreProducto}" x${carrito[index].cantidad} (entregados: ${carrito[index].unidadesEntregadas})`
    );
  } else {
    carrito.push(item);
    toast.success(
      `✅ Producto agregado: "${item.NombreProducto}" x${item.cantidad} (entregados: ${item.unidadesEntregadas})`
    );
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  router.push("/Productos");
};
</script>

<style scoped>
.alertify-notifier {
  z-index: 9999 !important;
}
</style>
