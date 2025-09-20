<template>
  <div>
    <h2>Lista de Productos</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>P. Q.</th>
          <th>Presentacion</th>
          <th>Principio Activo</th>
          <th>PVP</th>
          <th>Promocion</th>
          <th>Descuento</th>
          <th>Marca</th>
          <th>IVA</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productos" :key="producto.id">
          <td>{{ producto.NombreProducto }}</td>
          <td>$ {{ producto.PrecioFarmacia }}</td>
          <td>{{ producto.Presentacion }}</td>
          <td>{{ producto.PrincipioActivo }}</td>
          <td>$ {{ producto.PVP }}</td>
          <td>{{ producto.Promocion }}</td>
          <td>{{ producto.Descuento }}</td>
          <td>{{ producto.Marca }}</td>
          <td>{{ producto.IVA }}</td>
          <td>Editar / Ver / Borrar</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const productos = ref([]);

async function obtenerProductos() {
  try {
    const response = await axios.get("http://localhost:8000/api/productos");
    productos.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  obtenerProductos();
});
</script>
