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
            <button
              class="btn btn-success w-100"
              @click="agregarAlCarrito(producto)"
            >
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
import axios from "axios";

const route = useRoute();
const router = useRouter();
const producto = ref({});
const cantidad = ref(1); // valor inicial

onMounted(async () => {
  const id = route.params.id;
  try {
    const response = await axios.get(
      `http://localhost:8000/api/productos/${id}`
    );
    producto.value = response.data;
  } catch (error) {
    console.error("Error al cargar el producto", error);
  }
});

const agregarAlCarrito = (producto) => {
  const item = {
    ...producto,
    cantidad: cantidad.value,
  };

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Buscar si el producto ya está en el carrito
  const index = carrito.findIndex((p) => p.id === item.id);

  if (index !== -1) {
    // Ya existe: actualizar la cantidad
    carrito[index].cantidad += item.cantidad;
    console.log(
      `Cantidad actualizada: "${item.NombreProducto}" x${carrito[index].cantidad}`
    );
  } else {
    // No existe: agregar nuevo
    carrito.push(item);
    console.log(
      `Nuevo producto agregado: "${item.NombreProducto}" x${item.cantidad}`
    );
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  router.push("/Productos");
};
</script>
