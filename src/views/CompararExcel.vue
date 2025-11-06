<template>
  <div class="container py-4" style="margin-top: 80px">
    <h2 class="text-center mb-4">📊 Comparador de Archivos Excel</h2>

    <div class="row g-4">
      <!-- Archivo anterior -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">📘 Archivo base (anterior)</h5>
            <input
              type="file"
              accept=".xlsx,.xls"
              class="form-control"
              @change="leerArchivo($event, 'base')"
            />
            <div v-if="baseNombre" class="mt-2 text-success small">
              <i class="bi bi-file-earmark-excel"></i> {{ baseNombre }}
            </div>
          </div>
        </div>
      </div>

      <!-- Archivo nuevo -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">📗 Archivo nuevo</h5>
            <input
              type="file"
              accept=".xlsx,.xls"
              class="form-control"
              @change="leerArchivo($event, 'nuevo')"
            />
            <div v-if="nuevoNombre" class="mt-2 text-success small">
              <i class="bi bi-file-earmark-excel"></i> {{ nuevoNombre }}
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
        <i class="bi bi-file-earmark-arrow-down"></i> Descargar plantilla
        actualizada
      </button>
    </div>

    <!-- 🔍 Filtro de estado -->
    <div v-if="resultado.length" class="mt-4 text-center">
      <label class="fw-bold me-2">Filtrar por estado:</label>
      <select v-model="filtroEstado" class="form-select d-inline-block w-auto">
        <option value="Todos">Todos</option>
        <option value="Nuevo">Nuevos</option>
        <option value="Actualizado">Actualizados</option>
        <option value="Eliminado">Eliminados</option>
        <option value="Sin cambios">Sin cambios</option>
      </select>
    </div>

    <!-- Resultados -->
    <div v-if="resultado.length" class="mt-5">
      <h4 class="mb-3">Resultado de la comparación</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>CODIGO</th>
              <th>MARCA</th>
              <th>NOMBRE</th>
              <th>PRESENTACION</th>
              <th>PRINCIPIO_ACTIVO</th>
              <th>P_FARMACIA</th>
              <th>PVP</th>
              <th>PROMOCION</th>
              <th>DESCUENTO</th>
              <th>IVA</th>
              <th>ESTADO</th>
              <th>DETALLE_CAMBIO</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in resultadoFiltrado"
              :key="i"
              :class="{
                'table-success': r.ESTADO === 'Nuevo',
                'table-warning': r.ESTADO === 'Actualizado',
                'table-danger': r.ESTADO === 'Eliminado',
              }"
            >
              <td>{{ r.CODIGO }}</td>
              <td>{{ r.MARCA }}</td>
              <td>{{ r.NOMBRE }}</td>
              <td>{{ r.PRESENTACION }}</td>
              <td>{{ r.PRINCIPIO_ACTIVO }}</td>
              <td>{{ r.P_FARMACIA }}</td>
              <td>{{ r.PVP }}</td>
              <td>{{ r.PROMOCION }}</td>
              <td>{{ r.DESCUENTO }}</td>
              <td>{{ r.IVA }}</td>
              <td>
                <strong>{{ r.ESTADO }}</strong>
              </td>
              <td>{{ r.DETALLE_CAMBIO }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ref, computed } from "vue";

const baseData = ref([]);
const nuevoData = ref([]);
const resultado = ref([]);

const baseNombre = ref("");
const nuevoNombre = ref("");
const filtroEstado = ref("Todos");

// 🔧 Función de limpieza para comparación más precisa
function limpiarTexto(texto) {
  return texto
    ? texto.toString().toLowerCase().replace(/\s+/g, " ").trim()
    : "";
}

/**
 * Lee el archivo Excel (solo primera hoja)
 */
function leerArchivo(e, tipo) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const normalizado = json.map((r) => ({
        CODIGO: r.CODIGO?.toString().trim() || "",
        MARCA: r.MARCA?.toString().trim() || "",
        NOMBRE: r.NOMBRE?.toString().trim() || "",
        PRESENTACION: r.PRESENTACION?.toString().trim() || "",
        PRINCIPIO_ACTIVO: r.PRINCIPIO_ACTIVO?.toString().trim() || "",
        P_FARMACIA: parseFloat(r.P_FARMACIA) || 0,
        PVP: parseFloat(r.PVP) || 0,
        PROMOCION: r.PROMOCION?.toString().trim() || "",
        DESCUENTO: r.DESCUENTO?.toString().trim() || "",
        IVA: r.IVA?.toString().trim() || "",
      }));

      if (tipo === "base") {
        baseData.value = normalizado;
        baseNombre.value = file.name;
      } else {
        nuevoData.value = normalizado;
        nuevoNombre.value = file.name;
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (error) {
    alert(
      "⚠️ Error al leer el archivo. Verifica que el formato sea válido (.xlsx o .xls)."
    );
  }
}

/**
 * Compara ambos archivos
 */
function comparar() {
  if (!baseData.value.length || !nuevoData.value.length) {
    alert("⚠️ Debes cargar ambos archivos antes de comparar.");
    return;
  }

  const marcasNuevas = new Set(
    nuevoData.value.map((p) => limpiarTexto(p.MARCA))
  );
  const baseFiltrada = baseData.value.filter((p) =>
    marcasNuevas.has(limpiarTexto(p.MARCA))
  );

  const resultadoTmp = [];
  const baseKeyMap = new Map();

  for (const prod of baseFiltrada) {
    const key = [
      limpiarTexto(prod.MARCA),
      limpiarTexto(prod.NOMBRE),
      limpiarTexto(prod.PRESENTACION),
      limpiarTexto(prod.PRINCIPIO_ACTIVO),
    ].join("|");
    baseKeyMap.set(key, prod);
  }

  for (const nuevo of nuevoData.value) {
    const key = [
      limpiarTexto(nuevo.MARCA),
      limpiarTexto(nuevo.NOMBRE),
      limpiarTexto(nuevo.PRESENTACION),
      limpiarTexto(nuevo.PRINCIPIO_ACTIVO),
    ].join("|");

    const anterior = baseKeyMap.get(key);

    if (!anterior) {
      resultadoTmp.push({
        ...nuevo,
        ESTADO: "Nuevo",
        DETALLE_CAMBIO: "Registro nuevo",
      });
      baseData.value.push({
        ...nuevo,
        ESTADO: "Nuevo",
        DETALLE_CAMBIO: "Registro nuevo",
      });
    } else {
      const cambios = [];

      if (nuevo.P_FARMACIA !== anterior.P_FARMACIA) cambios.push("P_FARMACIA");
      if (nuevo.PVP !== anterior.PVP) cambios.push("PVP");
      if (nuevo.PROMOCION !== anterior.PROMOCION) cambios.push("PROMOCION");
      if (nuevo.DESCUENTO !== anterior.DESCUENTO) cambios.push("DESCUENTO");
      if (nuevo.IVA !== anterior.IVA) cambios.push("IVA");

      if (cambios.length) {
        Object.assign(anterior, nuevo, {
          ESTADO: "Actualizado",
          DETALLE_CAMBIO: cambios.join(", "),
        });
        resultadoTmp.push({ ...anterior });
      } else {
        Object.assign(anterior, { ESTADO: "Sin cambios", DETALLE_CAMBIO: "" });
        resultadoTmp.push({ ...anterior });
      }

      baseKeyMap.delete(key);
    }
  }

  for (const eliminado of baseKeyMap.values()) {
    eliminado.ESTADO = "Eliminado";
    eliminado.DETALLE_CAMBIO = "Producto eliminado (no está en nuevo Excel)";
    resultadoTmp.push(eliminado);
  }

  resultado.value = resultadoTmp.sort((a, b) => {
    const marcaCmp = a.MARCA.localeCompare(b.MARCA);
    return marcaCmp !== 0 ? marcaCmp : a.NOMBRE.localeCompare(b.NOMBRE);
  });
}

/**
 * Filtrado en la tabla
 */
const resultadoFiltrado = computed(() => {
  if (filtroEstado.value === "Todos") return resultado.value;
  return resultado.value.filter((r) => r.ESTADO === filtroEstado.value);
});

/**
 * Exportar Excel con colores
 */
async function exportarExcel() {
  if (!resultado.value.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos Actualizados");

  const headers = [
    "CODIGO",
    "MARCA",
    "NOMBRE",
    "PRESENTACION",
    "PRINCIPIO_ACTIVO",
    "P_FARMACIA",
    "PVP",
    "PROMOCION",
    "DESCUENTO",
    "IVA",
    "ESTADO",
    "DETALLE_CAMBIO",
  ];

  ws.addRow(headers);
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  for (const p of resultado.value) {
    const row = ws.addRow(Object.values(p));
    let color = "FFFFFFFF";
    if (p.ESTADO === "Nuevo") color = "FFB7E1CD";
    else if (p.ESTADO === "Actualizado") color = "FFFFF3CD";
    else if (p.ESTADO === "Eliminado") color = "FFF8D7DA";

    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
    });
  }

  const fecha = new Date().toISOString().split("T")[0];
  const nombreExport = baseNombre.value
    ? baseNombre.value.replace(/\.xlsx$/i, `_Revisado_${fecha}.xlsx`)
    : `Productos_Revisados_${fecha}.xlsx`;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), nombreExport);
}
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
