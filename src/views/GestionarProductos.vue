<template>
  <div class="container py-5" style="margin-top: 80px">
    <div class="text-center mb-5">
      <h2 class="fw-bold text-primary">📦 Gestión de Productos</h2>
      <p class="text-muted">
        Administra, crea o elimina productos registrados en el sistema.
      </p>
      <hr class="w-25 mx-auto opacity-75" />
    </div>

    <div class="d-flex justify-content-center flex-wrap gap-3 mt-4">
      <!-- Ir a productos -->
      <router-link
        class="btn btn-success d-flex align-items-center px-4 py-2"
        :to="{ path: '/productos', query: { modo: 'gestionar' } }"
      >
        <i class="bi bi-box-seam me-2 fs-5"></i>
        Ir a productos
      </router-link>

      <!-- Crear nuevo producto -->
      <RouterLink
        class="btn btn-primary d-flex align-items-center px-4 py-2"
        :to="'/crear'"
      >
        <i class="bi bi-plus-circle me-2 fs-5"></i>
        Nuevo producto
      </RouterLink>

      <!-- Eliminar productos -->
      <button
        @click="vaciarProductos"
        class="btn btn-danger d-flex align-items-center px-4 py-2"
      >
        <i class="bi bi-trash3 me-2 fs-5"></i>
        Eliminar productos registrados
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn {
  font-weight: 500;
  border-width: 2px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

h2 {
  letter-spacing: 0.5px;
}

hr {
  border-top: 3px solid #0d6efd;
  width: 80px;
}
</style>

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
