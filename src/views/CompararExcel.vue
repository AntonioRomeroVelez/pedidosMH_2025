<template>
  <div class="container py-4" style="margin-top: 80px">
    <h2 class="text-center mb-4">🧾 Comparador de Archivos Excel</h2>

    <div class="row g-4">
      <!-- Archivo anterior -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Archivo anterior</h5>
            <input
              type="file"
              accept=".xlsx,.xls"
              class="form-control"
              @change="leerArchivo($event, 'base')"
            />
            <div v-if="baseNombre" class="mt-2 text-success small">
              <i class="bi bi-file-earmark-excel"></i> {{ baseNombre }}
            </div>

            <!-- Selector de hoja -->
            <div v-if="baseHojas.length" class="mt-3">
              <label class="form-label">Seleccionar hoja:</label>
              <select
                class="form-select"
                v-model="baseHojaSeleccionada"
                @change="cargarHoja('base')"
              >
                <option disabled value="">-- Selecciona una hoja --</option>
                <option v-for="(h, i) in baseHojas" :key="i" :value="h">
                  {{ h }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Archivo nuevo -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Archivo nuevo</h5>
            <input
              type="file"
              accept=".xlsx,.xls"
              class="form-control"
              @change="leerArchivo($event, 'nuevo')"
            />
            <div v-if="nuevoNombre" class="mt-2 text-success small">
              <i class="bi bi-file-earmark-excel"></i> {{ nuevoNombre }}
            </div>

            <!-- Selector de hoja -->
            <div v-if="nuevoHojas.length" class="mt-3">
              <label class="form-label">Seleccionar hoja:</label>
              <select
                class="form-select"
                v-model="nuevoHojaSeleccionada"
                @change="cargarHoja('nuevo')"
              >
                <option disabled value="">-- Selecciona una hoja --</option>
                <option v-for="(h, i) in nuevoHojas" :key="i" :value="h">
                  {{ h }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="text-center mt-4">
      <button
        class="btn btn-primary px-4 me-2"
        :disabled="!baseData.length || !nuevoData.length"
        @click="comparar"
      >
        <i class="bi bi-arrow-repeat"></i> Comparar archivos
      </button>

      <button
        v-if="resultado.length"
        class="btn btn-success px-4"
        @click="exportarExcel"
      >
        <i class="bi bi-file-earmark-arrow-down"></i> Exportar resultado
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="resultado.length" class="mt-5">
      <h4 class="mb-3">Resultado de la comparación</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Promoción</th>
              <th>Presentación</th>
              <th>Estado</th>
              <th>Cambios</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in resultado"
              :key="i"
              :class="{
                'table-success': r.estado === 'Nuevo',
                'table-danger': r.estado === 'Eliminado',
                'table-warning': r.estado === 'Cambiado',
              }"
            >
              <td>{{ r.nombre }}</td>
              <td>{{ r.precio }}</td>
              <td>{{ r.promociones }}</td>
              <td>{{ r.presentacion }}</td>
              <td>
                <strong>{{ r.estado }}</strong>
              </td>
              <td>{{ r.cambios?.join(", ") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref } from "vue";

// Datos de archivos
const baseData = ref([]);
const nuevoData = ref([]);
const resultado = ref([]);

// Nombres y hojas
const baseNombre = ref("");
const nuevoNombre = ref("");
const baseWorkbook = ref(null);
const nuevoWorkbook = ref(null);
const baseHojas = ref([]);
const nuevoHojas = ref([]);
const baseHojaSeleccionada = ref("");
const nuevoHojaSeleccionada = ref("");

/**
 * Lee el archivo Excel y guarda el workbook completo
 */
function leerArchivo(e, tipo) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hojas = workbook.SheetNames;

    if (tipo === "base") {
      baseWorkbook.value = workbook;
      baseHojas.value = hojas;
      baseNombre.value = file.name;
      baseHojaSeleccionada.value = ""; // reset
      baseData.value = [];
    } else {
      nuevoWorkbook.value = workbook;
      nuevoHojas.value = hojas;
      nuevoNombre.value = file.name;
      nuevoHojaSeleccionada.value = "";
      nuevoData.value = [];
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Carga los datos de una hoja seleccionada
 */
function cargarHoja(tipo) {
  let workbook, hojaSeleccionada, destino;

  if (tipo === "base") {
    workbook = baseWorkbook.value;
    hojaSeleccionada = baseHojaSeleccionada.value;
    destino = baseData;
  } else {
    workbook = nuevoWorkbook.value;
    hojaSeleccionada = nuevoHojaSeleccionada.value;
    destino = nuevoData;
  }

  if (!workbook || !hojaSeleccionada) return;

  const hoja = workbook.Sheets[hojaSeleccionada];
  const json = XLSX.utils.sheet_to_json(hoja, { defval: "" });

  // Normaliza los datos (ajusta los nombres de columna según tu Excel)
  destino.value = json.map((p) => ({
    nombre: p.Nombre?.trim() || p.Producto || "",
    precio: parseFloat(p.Precio) || 0,
    presentacion: p.Presentacion || "",
    principio_activo: p["Principio Activo"] || "",
    ica: p.ICA || "",
    promociones: p.Promocion || p.Promociones || "",
  }));
}

/**
 * Compara ambos archivos
 */
function comparar() {
  const baseMap = new Map(baseData.value.map((p) => [p.nombre, p]));
  const resultadoTmp = [];

  for (const prod of nuevoData.value) {
    const anterior = baseMap.get(prod.nombre);

    if (!anterior) {
      resultadoTmp.push({ ...prod, estado: "Nuevo" });
    } else {
      const cambios = [];
      if (prod.precio !== anterior.precio) cambios.push("Precio");
      if (prod.promociones !== anterior.promociones) cambios.push("Promoción");
      if (prod.presentacion !== anterior.presentacion)
        cambios.push("Presentación");
      if (cambios.length) {
        resultadoTmp.push({ ...prod, estado: "Cambiado", cambios });
      } else {
        resultadoTmp.push({ ...prod, estado: "Sin cambios" });
      }
      baseMap.delete(prod.nombre);
    }
  }

  for (const eliminado of baseMap.values()) {
    resultadoTmp.push({ ...eliminado, estado: "Eliminado" });
  }

  resultado.value = resultadoTmp;
}

/**
 * Exporta los resultados a un archivo Excel
 */
function exportarExcel() {
  if (!resultado.value.length) return;

  const ws = XLSX.utils.json_to_sheet(resultado.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultado");
  XLSX.writeFile(wb, "resultado_comparacion.xlsx");
}
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
