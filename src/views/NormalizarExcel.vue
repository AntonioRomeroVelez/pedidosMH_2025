<template>
  <div class="container py-4">
    <h2 class="text-center mb-4">
      🧾 Formato productos - Extraer MARCA y normalizar
    </h2>

    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-8">
            <input
              type="file"
              accept=".xlsx,.xls"
              class="form-control"
              @change="onFile"
            />
          </div>
          <div class="col-auto">
            <button
              class="btn btn-primary"
              :disabled="!rawProducts.length"
              @click="exportar"
            >
              <i class="bi bi-file-earmark-arrow-down"></i> Exportar formateado
            </button>
          </div>
          <div class="col-12">
            <small class="text-muted">
              Estructura esperada: CODIGO, NOMBRE COMERCIAL, PRESENTACION,
              PRINCIPIO ACTIVO, P_FARMACIA, PVP, PROMOCION, DESCUENTO, IVA.
            </small>
          </div>
        </div>
      </div>
    </div>

    <div v-if="rawProducts.length" class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title">
          Vista previa ({{ rawProducts.length }} productos)
        </h5>
        <div class="table-responsive" style="max-height: 400px; overflow: auto">
          <table class="table table-sm table-bordered align-middle">
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in rawProducts" :key="i">
                <td>{{ p.CODIGO }}</td>
                <td>{{ p.MARCA }}</td>
                <td>{{ p.NOMBRE }}</td>
                <td>{{ p.PRESENTACION }}</td>
                <td>{{ p.PRINCIPIO_ACTIVO }}</td>
                <td>{{ formatNumber(p.P_FARMACIA) }}</td>
                <td>{{ formatNumber(p.PVP) }}</td>
                <td>{{ p.PROMOCION }}</td>
                <td>{{ p.DESCUENTO }}</td>
                <td>{{ p.IVA }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ref } from "vue";

const rawProducts = ref([]);
const fileName = ref(""); // 🔹 Guardará el nombre original del archivo

function formatNumber(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function onFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  fileName.value = file.name.replace(/\.[^/.]+$/, ""); // 🔹 Guarda nombre sin extensión
  readFileAllSheets(file);
}

function readFileAllSheets(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    let productos = [];

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws || !ws["!ref"]) continue;

      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (!rows.length) continue;

      let headerRowIndex = -1;
      let headerMap = null;
      let marcaActual = "";

      for (let r = 0; r < rows.length; r++) {
        const fila = rows[r].map((c) =>
          c === null || c === undefined ? "" : String(c).trim()
        );

        const filaConcat = fila.join(" ").toUpperCase();
        const isHeader =
          (filaConcat.includes("NOMBRE") &&
            (filaConcat.includes("PVP") ||
              filaConcat.includes("P_FARMACIA") ||
              filaConcat.includes("PROMOCION"))) ||
          (fila.some((c) => /^COD/i.test(c)) &&
            fila.some((c) => /NOMBRE/i.test(c)));

        if (isHeader) {
          marcaActual = findMarcaAbove(rows, r);
          headerRowIndex = r;
          headerMap = buildHeaderMap(fila);
          continue;
        }

        if (headerMap && headerRowIndex >= 0) {
          const isEmptyRow = fila.every((c) => c === "");
          if (isEmptyRow) {
            headerMap = null;
            headerRowIndex = -1;
            marcaActual = "";
            continue;
          }

          const upper = fila.join(" ").toUpperCase();
          if (
            upper.includes("NOMBRE") &&
            (upper.includes("PVP") ||
              upper.includes("P_FARMACIA") ||
              upper.includes("PROMOCION"))
          ) {
            marcaActual = findMarcaAbove(rows, r);
            headerRowIndex = r;
            headerMap = buildHeaderMap(fila);
            continue;
          }

          const prod = mapFilaAProducto(fila, headerMap, marcaActual);
          if (prod && prod.NOMBRE) productos.push(prod);
        }
      }
    }

    // 🔹 Ordena por MARCA
    productos.sort((a, b) => a.MARCA.localeCompare(b.MARCA));

    rawProducts.value = productos;
  };
  reader.readAsArrayBuffer(file);
}

function findMarcaAbove(rows, indexHeader) {
  for (let r = indexHeader - 1; r >= Math.max(0, indexHeader - 8); r--) {
    const fila = rows[r];
    if (!fila) continue;
    const candB = (fila[1] || "").toString().trim();
    const candA = (fila[0] || "").toString().trim();
    const candidate = candB || candA;
    if (candidate) {
      const up = candidate.toUpperCase();
      if (
        up.length > 2 &&
        !/COD|NOMBRE|PVP|P_FARMACIA|PRESENTACION/i.test(up)
      ) {
        return candidate;
      }
    }
  }
  return "";
}

function buildHeaderMap(headerFila) {
  const map = {};
  for (let c = 0; c < headerFila.length; c++) {
    const up = (headerFila[c] || "").toUpperCase();
    if (/COD|CODIGO/.test(up)) map.idxCod = c;
    if (/NOMBRE/.test(up)) map.idxNombre = c;
    if (/PRESENT/.test(up)) map.idxPresent = c;
    if (/PRINCIPIO/.test(up)) map.idxPrin = c;
    if (/P_FARMACIA|P\.Q\.1/.test(up)) map.idxPfarm = c;
    if (/PVP|P\.V\.P/.test(up)) map.idxPvp = c;
    if (/PROMOCION/.test(up)) map.idxPromo = c;
    if (/DESCUENTO/.test(up)) map.idxDesc = c;
    if (/IVA/.test(up)) map.idxIva = c;
  }
  return map;
}

function mapFilaAProducto(fila, map, marca) {
  const get = (i) =>
    typeof i === "number" ? String(fila[i] || "").trim() : "";
  const parseNum = (v) => {
    if (!v) return 0;
    const n = parseFloat(
      String(v)
        .replace(",", ".")
        .replace(/[^0-9.\-]/g, "")
    );
    return isNaN(n) ? 0 : n;
  };

  const nombre = get(map.idxNombre);
  if (!nombre) return null;

  return {
    CODIGO: get(map.idxCod),
    MARCA: marca.trim(),
    NOMBRE: get(map.idxNombre).trim(),
    PRESENTACION: get(map.idxPresent).trim(),
    PRINCIPIO_ACTIVO: get(map.idxPrin).trim(),
    P_FARMACIA: parseNum(get(map.idxPfarm)).toFixed(2),
    PVP: parseNum(get(map.idxPvp)).toFixed(2),
    PROMOCION: get(map.idxPromo),
    DESCUENTO: get(map.idxDesc) * 100,
    IVA: get(map.idxIva) || "0",
  };
}

async function exportar() {
  if (!rawProducts.value.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos");

  ws.columns = [
    { header: "CODIGO", key: "CODIGO", width: 15 },
    { header: "MARCA", key: "MARCA", width: 25 },
    { header: "NOMBRE", key: "NOMBRE", width: 40 },
    { header: "PRESENTACION", key: "PRESENTACION", width: 25 },
    { header: "PRINCIPIO_ACTIVO", key: "PRINCIPIO_ACTIVO", width: 25 },
    { header: "P_FARMACIA", key: "P_FARMACIA", width: 15 },
    { header: "PVP", key: "PVP", width: 15 },
    { header: "PROMOCION", key: "PROMOCION", width: 20 },
    { header: "DESCUENTO", key: "DESCUENTO", width: 15 },
    { header: "IVA", key: "IVA", width: 10 },
  ];

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

  rawProducts.value.forEach((p) => {
    ws.addRow({
      ...p,
      P_FARMACIA: parseFloat(p.P_FARMACIA),
      PVP: parseFloat(p.PVP),
    });
  });

  ws.getColumn("P_FARMACIA").numFmt = "#,##0.00";
  ws.getColumn("PVP").numFmt = "#,##0.00";

  const buf = await wb.xlsx.writeBuffer();

  // 🔹 Usa el nombre original + "_formateado.xlsx"
  const exportName = `${fileName.value || "productos"}_formateado.xlsx`;
  saveAs(new Blob([buf]), exportName);
}
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
  font-size: 0.9rem;
}
</style>
