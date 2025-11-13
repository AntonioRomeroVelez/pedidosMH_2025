<template>
  <div class="visitas-container py-4 px-3 px-md-5">
    <h2 class="titulo text-center mb-4">🗓️ Registro de Visitas Diarias</h2>

    <!-- Formulario -->
    <div class="formulario shadow-sm p-4 rounded-4 bg-white mb-4">
      <div class="mb-3">
        <label class="form-label fw-semibold">Lugar de visita</label>
        <textarea
          v-model="lugar"
          class="form-control campo-texto"
          rows="1"
          placeholder="Ej. Farmacia San José"
        ></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Observación</label>
        <textarea
          v-model="observacion"
          class="form-control campo-texto"
          rows="2"
          placeholder="Ej. Realizó un pedido grande o no se encontraba el encargado"
        ></textarea>
      </div>

      <button class="btn-agregar w-100" @click="agregarVisita">
        ➕ Agregar visita
      </button>
    </div>

    <!-- Botones finales -->
    <div
      v-if="visitas.length"
      class="d-flex flex-column flex-md-row gap-3 mb-4"
    >
      <button class="btn-accion copiar w-100" @click="copiarTexto">
        📋 Copiar reporte
      </button>
      <button class="btn-accion borrar w-100" @click="limpiarVisitas">
        🗑️ Borrar todo
      </button>
    </div>

    <!-- Lista de visitas -->
    <div
      v-if="visitas.length"
      class="listado-visitas shadow-sm p-3 rounded-4 bg-white"
    >
      <h5 class="fw-bold mb-3 text-secondary">📋 Visitas registradas</h5>
      <ul class="list-group">
        <li
          v-for="(v, i) in visitas"
          :key="i"
          class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
        >
          <div class="texto-visita mb-2 mb-md-0">
            <strong>{{ v.lugar }}</strong
            >: {{ v.observacion }}
          </div>
          <button class="btn-eliminar" @click="eliminarVisita(i)">
            ✖ Eliminar
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useToast } from "vue-toastification";
const toast = useToast();
const lugar = ref("");
const observacion = ref("");
const visitas = ref([]);
import alertify from "alertifyjs";

// Cargar visitas guardadas
onMounted(() => {
  const guardadas = localStorage.getItem("visitas_diarias");
  if (guardadas) visitas.value = JSON.parse(guardadas);
});

// Guardar en localStorage
watch(
  visitas,
  (nuevas) => {
    localStorage.setItem("visitas_diarias", JSON.stringify(nuevas));
  },
  { deep: true }
);

function agregarVisita() {
  if (!lugar.value.trim()) {
    toast.error("Por favor, ingresa el lugar de visita.");
    return;
  }

  visitas.value.push({
    lugar: lugar.value.trim(),
    observacion: observacion.value.trim() || "Sin observaciones",
  });

  toast.success("Visita agregada correctamente.");
  lugar.value = "";
  observacion.value = "";
}

function eliminarVisita(index) {
  visitas.value.splice(index, 1);
  toast.info("Visita eliminada.");
}

const limpiarVisitas = () => {
  if (!visitas.value.length) {
    toast.info("No hay visitas para borrar.");
    return;
  }

  alertify
    .confirm(
      "🧹 Borrar todas las visitas",
      `Se eliminarán ${visitas.value.length} visitas registradas. Esta acción no se puede deshacer.`,
      () => {
        visitas.value = [];
        localStorage.removeItem("visitas_diarias"); // 👈 corregido
        toast.success("✅ Todas las visitas fueron eliminadas correctamente.");
      },
      () => {
        toast.info("❌ Cancelado");
      }
    )
    .set({
      labels: { ok: "Sí, borrar", cancel: "Cancelar" },
      transition: "zoom",
      movable: false,
      closable: false,
      padding: true,
    });
};

function copiarTexto() {
  const fecha = new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const texto = [
    `${fecha}`,
    "",
    ...visitas.value.map((v) => `${v.lugar.toLowerCase()}: ${v.observacion}.`),
  ].join("\n");

  navigator.clipboard.writeText(texto).then(() => {
    toast.success("Reporte copiado al portapapeles.");
  });
}
</script>

<style scoped>
.visitas-container {
  max-width: 700px;
  margin: 0 auto;
}

.titulo {
  font-weight: 700;
  color: #1e3a8a;
}

.formulario {
  border: 1px solid #e5e7eb;
}

.campo-texto {
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}

.campo-texto:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
  border-color: #2563eb;
}

.btn-agregar {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px;
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-agregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-accion {
  padding: 10px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn-accion.copiar {
  background-color: #0d9488;
  color: white;
  border: none;
}

.btn-accion.copiar:hover {
  background-color: #14b8a6;
  transform: translateY(-2px);
}

.btn-accion.borrar {
  background-color: #ef4444;
  color: white;
  border: none;
}

.btn-accion.borrar:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background-color: transparent;
  padding: 10px 5px;
}

.texto-visita {
  word-break: break-word;
  color: #374151;
}

.btn-eliminar {
  background: transparent;
  color: #dc2626;
  border: 1px solid #fca5a5;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-eliminar:hover {
  background-color: #fee2e2;
}
</style>
