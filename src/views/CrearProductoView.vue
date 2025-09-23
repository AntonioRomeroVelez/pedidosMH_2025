<template>
  <main class="m-5">
    <form @submit.prevent="enviarProducto">
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="nombre" class="form-label">Nombre</label>
          <input
            v-model="nuevoProducto.NombreProducto"
            type="text"
            class="form-control"
            id="nombre"
            placeholder="Nombre del producto"
          />
        </div>

        <div class="col-md-4">
          <label for="pq" class="form-label">Precio Farmacia</label>
          <input
            v-model="nuevoProducto.PrecioFarmacia"
            type="number"
            step="0.01"
            class="form-control"
            id="pq"
            placeholder="P. Q."
          />
        </div>

        <div class="col-md-4">
          <label for="presentacion" class="form-label">Presentación</label>
          <input
            v-model="nuevoProducto.Presentacion"
            type="text"
            class="form-control"
            id="presentacion"
            placeholder="Ej. Caja, Frasco, Tabletas"
          />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <label for="principio" class="form-label">Principio Activo</label>
          <input
            v-model="nuevoProducto.PrincipioActivo"
            type="text"
            class="form-control"
            id="principio"
            placeholder="Ej. Paracetamol"
          />
        </div>

        <div class="col-md-4">
          <label for="pvp" class="form-label">PVP</label>
          <input
            v-model="nuevoProducto.PVP"
            type="number"
            step="0.01"
            class="form-control"
            id="pvp"
            placeholder="Precio de venta al público"
          />
        </div>

        <div class="col-md-4">
          <label for="promocion" class="form-label">Promoción</label>
          <input
            v-model="nuevoProducto.Promocion"
            type="text"
            class="form-control"
            id="promocion"
            placeholder="Ej. 2x1, descuento especial"
          />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <label for="descuento" class="form-label">Descuento (%)</label>
          <input
            v-model="nuevoProducto.Descuento"
            type="number"
            class="form-control"
            id="descuento"
            placeholder="Ej. 10"
          />
        </div>

        <div class="col-md-4">
          <label for="marca" class="form-label">Marca</label>
          <input
            v-model="nuevoProducto.Marca"
            type="text"
            class="form-control"
            id="marca"
            placeholder="Marca del producto"
          />
        </div>

        <div class="col-md-4">
          <label class="form-label d-block">¿Aplica IVA?</label>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              id="ivaSi"
              value="15"
              v-model="nuevoProducto.IVA"
            />
            <label class="form-check-label" for="ivaSi">Sí (12%)</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              id="ivaNo"
              value="0"
              v-model="nuevoProducto.IVA"
            />
            <label class="form-check-label" for="ivaNo">No</label>
          </div>
        </div>
      </div>

      <RouterLink class="btn btn-danger m-5" to="/Productos"
        >Cancelar</RouterLink
      >
      <button type="submit" class="btn btn-primary">Crear Producto</button>
    </form>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { crearProducto } from "@/servicios/api.js";
import { useRouter } from "vue-router";

const router = useRouter();

const nuevoProducto = ref({
  NombreProducto: "",
  Presentacion: "",
  PrincipioActivo: "",
  PrecioFarmacia: "",
  PVP: "",
  Promocion: "",
  Descuento: "",
  Marca: "",
  IVA: "",
});

const enviarProducto = async () => {
  try {
    const response = await crearProducto(nuevoProducto.value);
    (nuevoProducto.value.NombreProducto = ""),
      (nuevoProducto.value.Presentacion = ""),
      (nuevoProducto.value.PrincipioActivo = ""),
      (nuevoProducto.value.PrecioFarmacia = ""),
      (nuevoProducto.value.PVP = ""),
      (nuevoProducto.value.Promocion = ""),
      (nuevoProducto.value.Descuento = ""),
      (nuevoProducto.value.Marca = ""),
      (nuevoProducto.value.IVA = ""),
      console.log("producto creado con éxito", response.data);
    router.push("/Productos");
  } catch (error) {
    console.log("no se puede crear el producto", error);
  }
};
</script>

<style></style>
