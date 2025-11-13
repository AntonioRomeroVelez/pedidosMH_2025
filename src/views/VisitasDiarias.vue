<template>
  <div class="visitas-container py-4 px-3 px-md-5">
    <h2 class="titulo text-center mb-4">Registro de Visitas Diarias</h2>

    <!-- Formulario -->
    <div class="formulario shadow-sm p-4 rounded-4 bg-white mb-4">
      <div class="mb-3">
        <label class="form-label fw-semibold">Lugar de visita</label>
        <textarea
          v-model="lugar"
          class="form-control campo-texto"
          rows="1"
          placeholder=""
        ></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Observación</label>
        <textarea
          v-model="observacion"
          class="form-control campo-texto"
          rows="3"
          placeholder=""
        ></textarea>
      </div>

      <button class="btn-agregar w-100" @click="guardarVisita">
        {{ editando ? "💾 Guardar cambios" : "➕ Agregar visita" }}
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

          <div class="d-flex gap-2">
            <button class="btn-editar" @click="editarVisita(i)">
              ✏️ Editar
            </button>
            <button class="btn-eliminar" @click="eliminarVisita(i)">
              ✖ Eliminar
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useToast } from "vue-toastification";
import alertify from "alertifyjs";

const toast = useToast();
const lugar = ref("");
const observacion = ref("");
const visitas = ref([]);
const editando = ref(false);
const indiceEditando = ref(null);

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

function guardarVisita() {
  if (!lugar.value.trim()) {
    toast.error("Por favor, ingresa el lugar de visita.");
    return;
  }

  if (editando.value) {
    visitas.value[indiceEditando.value] = {
      lugar: lugar.value.trim(),
      observacion: observacion.value.trim() || "Sin observaciones",
    };
    toast.success("✏️ Visita actualizada correctamente.");
    cancelarEdicion();
  } else {
    visitas.value.push({
      lugar: lugar.value.trim(),
      observacion: observacion.value.trim() || "Sin observaciones",
    });
    toast.success("✅ Visita agregada correctamente.");
    limpiarCampos();
  }
}

function editarVisita(index) {
  const visita = visitas.value[index];
  lugar.value = visita.lugar;
  observacion.value = visita.observacion;
  editando.value = true;
  indiceEditando.value = index;
  toast.info("✏️ Editando visita...");
}

function cancelarEdicion() {
  limpiarCampos();
  editando.value = false;
  indiceEditando.value = null;
}

function limpiarCampos() {
  lugar.value = "";
  observacion.value = "";
}

function eliminarVisita(index) {
  alertify
    .confirm(
      "❌ Eliminar visita",
      `¿Deseas eliminar la visita a "${visitas.value[index].lugar}"?`,
      () => {
        visitas.value.splice(index, 1);
        toast.success("🗑️ Visita eliminada.");
      },
      () => {
        toast.info("❌ Cancelado");
      }
    )
    .set({
      labels: { ok: "Sí, eliminar", cancel: "Cancelar" },
      transition: "zoom",
      movable: false,
    });
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
        localStorage.removeItem("visitas_diarias");
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
    ...visitas.value.map((v) => ` ${v.lugar.toLowerCase()}: ${v.observacion}.`),
  ].join("\n");

  navigator.clipboard.writeText(texto).then(() => {
    toast.success("📋 Reporte copiado al portapapeles.");
  });
}
</script>

<style>
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

.btn-eliminar,
.btn-editar {
  background: transparent;
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-eliminar {
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-editar {
  color: #2563eb;
  border-color: #93c5fd;
}

.btn-eliminar:hover {
  background-color: #fee2e2;
}

.btn-editar:hover {
  background-color: #dbeafe;
}

/* 📱 Estilos para pantallas móviles */
@media (max-width: 768px) {
  .titulo {
    font-size: 1.3rem;
  }

  .form-label,
  .texto-visita,
  .btn-agregar,
  .btn-accion,
  .btn-eliminar,
  .btn-editar {
    font-size: 0.9rem;
  }

  .campo-texto {
    font-size: 0.9rem;
  }

  .list-group-item {
    padding: 8px 4px;
  }
}

/* 💻 Estilos para pantallas grandes */
@media (min-width: 769px) {
  .titulo {
    font-size: 1.6rem;
  }

  .form-label,
  .campo-texto,
  .texto-visita {
    font-size: 1rem;
  }

  .btn-agregar,
  .btn-accion,
  .btn-eliminar,
  .btn-editar {
    font-size: 1rem;
  }
}
</style>
