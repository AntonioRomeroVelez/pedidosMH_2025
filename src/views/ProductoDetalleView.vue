<template>
  <div class="container mt-5">
    <div class="card shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-primary mb-3">
          🧪 {{ producto.NombreProducto }}
        </h3>

        <div class="row">
          <div class="col-md-6 mb-2">
            <p><strong>Presentación:</strong> {{ producto.Presentacion }}</p>
            <p>
              <strong>Principio Activo:</strong> {{ producto.PrincipioActivo }}
            </p>
            <p><strong>Marca:</strong> {{ producto.Marca }}</p>
            <p>
              <strong>IVA:</strong>
              {{ producto.IVA > 0 ? producto.IVA + "%" : "No aplica" }}
            </p>
          </div>

          <div class="col-md-6 mb-2">
            <p>
              <strong>Precio Farmacia:</strong> ${{ producto.PrecioFarmacia }}
            </p>
            <p><strong>PVP:</strong> ${{ producto.PVP }}</p>
            <p><strong>Promoción:</strong> {{ producto.Promocion }}</p>
            <p><strong>Descuento:</strong> {{ producto.Descuento }}%</p>
          </div>
        </div>

        <hr />

        <div class="row align-items-end">
          <div class="col-md-4 mb-3">
            <label for="cantidad" class="form-label">Cantidad</label>
            <input
              type="number"
              min="1"
              v-model="cantidad"
              class="form-control"
              id="cantidad"
              placeholder="Ej. 1"
            />
          </div>

          <div class="col-md-4 mb-3">
            <button class="btn btn-success w-100" @click="agregarAlCarrito">
              🛒 Agregar al carrito
            </button>
          </div>

          <div class="col-md-4 mb-3">
            <RouterLink class="btn btn-warning w-100" to="/Productos">
              🔙 Regresar
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { verProducto } from "@/servicios/api";
import alertify from "alertifyjs";

const route = useRoute();
const router = useRouter();
const producto = ref({});
const cantidad = ref("");

onMounted(async () => {
  const id = route.params.id;
  try {
    const response = await verProducto(id);
    producto.value = response.data;
  } catch (error) {
    console.error("Error al cargar el producto", error);
    alertify.error("❌ Error al cargar el producto.");
  }
});

function calcularUnidadesConPromociones(cantidad, promociones) {
  if (!promociones) return cantidad;

  const lista = promociones.split(",").map((p) => p.trim());
  let mejorExtra = 0;

  for (const promo of lista) {
    const [x, y] = promo.split("+").map((n) => parseInt(n.trim()));
    if (isNaN(x) || isNaN(y) || x <= 0 || y < 0) continue;

    const grupos = Math.floor(cantidad / x);
    const extra = grupos * y;
    if (extra > mejorExtra) mejorExtra = extra;
  }

  return cantidad + mejorExtra;
}

const agregarAlCarrito = () => {
  const cantidadNum = parseInt(cantidad.value);
  if (!cantidadNum || cantidadNum < 1) {
    alertify.error("❌ Ingresa una cantidad válida antes de agregar.");
    return;
  }

  const unidadesEntregadas = calcularUnidadesConPromociones(
    cantidadNum,
    producto.value.Promocion
  );

  const item = {
    ...producto.value,
    cantidad: cantidadNum,
    unidadesEntregadas,
  };

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const index = carrito.findIndex((p) => p.id === item.id);

  if (index !== -1) {
    carrito[index].cantidad += item.cantidad;
    carrito[index].unidadesEntregadas += item.unidadesEntregadas;
    alertify.warning(
      `⚠️ Cantidad actualizada: "${item.NombreProducto}" x${carrito[index].cantidad} (entregados: ${carrito[index].unidadesEntregadas})`
    );
  } else {
    carrito.push(item);
    alertify.success(
      `✅ Producto agregado: "${item.NombreProducto}" x${item.cantidad} (entregados: ${item.unidadesEntregadas})`
    );
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  router.push("/Productos");
};
</script>
