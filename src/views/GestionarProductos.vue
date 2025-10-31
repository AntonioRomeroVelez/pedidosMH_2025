<template>
  <div style="margin-top: 100px">
    <div class="container">
      <h1>Gestión de productos</h1>
      <!-- <RouterLink class="btn btn-outline-success" to="/productos"
        >Ir a productos</RouterLink
      > -->
      <div
        class="text-center mt-4 d-flex gap-3 align-content-center justify-content-center flex-wrap"
      >
        <router-link
          class="btn btn-outline-success"
          :to="{
            path: '/productos',
            query: { modo: 'gestionar' },
          }"
        >
          Ir a productos
        </router-link>

        <RouterLink class="btn btn-outline-primary" :to="'/crear'">
          Nuevo producto
        </RouterLink>

        <button @click="vaciarProductos" class="btn btn-outline-danger">
          Eliminar productos registrados
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import alertify from "alertifyjs";

import { useToast } from "vue-toastification";
const toast = useToast();

const cantidadProductos = ref(0);
const resultados = ref([]);
const productos = ref([]);
const noHayProductos = ref(null);
const router = useRouter();

// No necesitas lógica si solo navegas
onMounted(() => {
  const datosGuardados = localStorage.getItem("ListaProductos");
  if (datosGuardados) {
    productos.value = JSON.parse(datosGuardados);
    cantidadProductos.value = productos.value.length;

    resultados.value = productos.value;
  } else {
    noHayProductos.value =
      "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
  }
});

const vaciarProductos = () => {
  alertify.confirm(
    "⚠️ Confirmación",
    "¿Estás seguro de eliminar todos los productos cargados?",
    () => {
      // Eliminar del storage y actualizar estado local para reflejar el cambio inmediatamente
      localStorage.removeItem("ListaProductos");
      productos.value = [];
      resultados.value = [];
      cantidadProductos.value = 0;
      noHayProductos.value =
        "No hay productos para mostrar, puedes agregar productos en Cargar Excel";
      toast.success("✅ Registros eliminados");
      setTimeout(() => {
        router.push("/");
      }, 1000);
      // No es necesario navegar a la misma ruta; si quieres forzar reload, podemos usar router.push o location.reload()
    },
    () => {
      toast.error("❌ Operación cancelada");
    }
  );
};
</script>

<style scoped>
.alertify-notifier {
  z-index: 9999 !important;
}
</style>
