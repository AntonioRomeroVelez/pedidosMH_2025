<template>
  <div class="container py-4" style="margin-top: 60px">
    <h2 class="text-center mb-4">
      Formato productos - Extraer MARCA y normalizar
    </h2>

    <div class="card mb-4">
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
            <small class="text-muted"
              >Estructura esperada:CODIGO, NOMBRE COMERCIAL, PRESENTACION,
              PRINCIPIO, ACTIVO P_FARMACIA, PVP, PROMOCION, DESCUENTO, IVA. El
              componente detecta bloques por encabezado.</small
            >
          </div>
        </div>
      </div>
    </div>

    <div v-if="rawProducts.length" class="card">
      <div class="card-body">
        <h5 class="card-title">
          Vista previa ({{ rawProducts.length }} filas)
        </h5>
        <div class="table-responsive" style="max-height: 400px; overflow: auto">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>CODIGO</th>
                <th>NombreProducto</th>
                <th>Presentacion</th>
                <th>PrincipioActivo</th>
                <th>PrecioFarmacia</th>
                <th>PVP</th>
                <th>Promocion</th>
                <th>Descuento</th>
                <th>Marca</th>
                <th>IVA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in rawProducts" :key="i">
                <td>{{ p.CODIGO }}</td>
                <td>{{ p.NOMBRE }}</td>
                <td>{{ p.PRESENTACION }}</td>
                <td>{{ p.PRINCIPIO_ACTIVO }}</td>
                <td>{{ p.P_FARMACIA }}</td>
                <td>{{ p.PVP }}</td>
                <td>{{ p.PROMOCION }}</td>
                <td>{{ p.DESCUENTO }}</td>
                <td>{{ p.MARCA }}</td>
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

/**
 * Handler archivo
 */
function onFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  readFileAllSheets(file);
}

/**
 * Lee todas las hojas y detecta bloques de marca + encabezado + productos
 *
 * Estrategia:
 * - Para cada hoja usamos sheet_to_json con header:1 para obtener filas como arrays
 * - Recorremos filas:
 *    - Si la fila contiene las palabras clave del encabezado (ej. 'NOMBRE' y 'P.V.P' o 'P.Q.1'),
 *      marcamos esta fila como la fila de encabezado y buscamos hacia arriba la marca (última fila no vacía antes del encabezado)
 *    - Las filas siguientes (hasta hallar fila vacía o nueva cabecera) se procesan como productos usando el mapeo de columnas detectadas
 * - Se concatenan productos de todas las hojas
 */
function readFileAllSheets(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    let productos = [];

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws || !ws["!ref"]) continue;

      // obtener filas como arrays
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (!rows || !rows.length) continue;

      // recorrer filas
      let headerRowIndex = -1;
      let headerMap = null;
      let marcaActual = "";
      for (let r = 0; r < rows.length; r++) {
        const fila = rows[r].map((cell) =>
          cell === null || cell === undefined ? "" : String(cell).trim()
        );

        // Detectar si esta fila es un encabezado de tabla: contiene al menos 'NOMBRE' y 'P.V.P' o 'P.Q.1' o 'PROMOCION'
        const filaConcat = fila.join(" ").toUpperCase();
        const isHeader =
          (filaConcat.includes("NOMBRE") &&
            (filaConcat.includes("PVP") ||
              filaConcat.includes("P_FARMACIA") ||
              filaConcat.includes("PROMOCION"))) ||
          (fila.some((c) => /^COD/i.test(c)) &&
            fila.some((c) => /NOMBRE/i.test(c)));

        if (isHeader) {
          // buscamos marca arriba: la última fila no vacía (en columnas A/B) entre header-1 y header-6
          marcaActual = findMarcaAbove(rows, r);
          // crear mapa columna índice -> nombre estandar
          headerRowIndex = r;
          headerMap = buildHeaderMap(fila);
          continue;
        }

        // Si ya tenemos headerMap, intentar interpretar fila como producto
        if (headerMap && headerRowIndex >= 0) {
          // si fila vacía o primera columna vacía -> considerar fin de bloque
          const isEmptyRow = fila.every((c) => c === "");
          if (isEmptyRow) {
            // finalizar bloque: reset headerMap y esperar próximo header
            headerMap = null;
            headerRowIndex = -1;
            marcaActual = "";
            continue;
          }

          // A veces después de los productos hay subtítulos/encabezados nuevos: detectarlos si vuelven a aparecer 'NOMBRE' etc
          const upper = fila.join(" ").toUpperCase();
          if (
            upper.includes("NOMBRE") &&
            (upper.includes("PVP") ||
              upper.includes("P_FARMACIA") ||
              upper.includes("PROMOCION"))
          ) {
            // nuevo encabezado -> actualizar headerMap y marca
            marcaActual = findMarcaAbove(rows, r);
            headerRowIndex = r;
            headerMap = buildHeaderMap(fila);
            continue;
          }

          // Construir objeto producto usando headerMap
          const prod = mapFilaAProducto(fila, headerMap, marcaActual);
          // Solo añadir si hay nombre
          if (prod && prod.NOMBRE) productos.push(prod);
        } else {
          // No hay headerMap aún: podría haber una marca sola (título). Si detectamos fila que parece titulo (mayúsculas y palabras clave 'LABORATORIO' u otro)
          // no hacemos nada, simplemente seguimos
        }
      } // end for rows
    } // end for sheets

    rawProducts.value = productos;
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Busca la marca hacia arriba desde la fila indexHeader - devuelve string
 */
function findMarcaAbove(rows, indexHeader) {
  // buscamos hasta 8 filas arriba por si hay líneas en blanco
  for (let r = indexHeader - 1; r >= Math.max(0, indexHeader - 8); r--) {
    const fila = rows[r];
    if (!fila) continue;
    // buscar la primera celda no vacía (preferible columna B o A)
    const candB = (fila[1] || "").toString().trim();
    const candA = (fila[0] || "").toString().trim();
    const candidate = candB || candA;
    if (candidate) {
      // limpiar ruído (líneas de separación, guiones) - si tiene palabras como 'LABORATORIO' o si está en mayúsculas, lo consideramos marca
      const up = candidate.toString().toUpperCase();
      // Aceptar si tiene al menos 3 letras y no parece un encabezado de columnas
      if (
        up.length > 2 &&
        !/COD|NOMBRE|PVP|P_FARMACIA|PRESENTACION/i.test(up)
      ) {
        return candidate;
      }
    }
  }
  return ""; // si no encontró
}

/**
 * Construye un mapa de índices de columnas a nombres estandarizados
 * headerFila es array de celdas (strings)
 * Retorna objeto { idxNombre: "NOMBRE", idxPvp: "PVP", ... }
 */
function buildHeaderMap(headerFila) {
  const map = {};
  for (let c = 0; c < headerFila.length; c++) {
    const raw = (headerFila[c] || "").toString().trim();
    const up = raw.toUpperCase();

    if (
      /NOMBRE/.test(up) ||
      up === "NOMBRE COMERCIAL" ||
      up.includes("NOMBRE")
    ) {
      map.idxNombre = c;
      continue;
    }
    if (/PRESENTACIÓN/i.test(up) || up === "PRESENTACION") {
      map.idxPresent = c;
      continue;
    }
    if (/PRINCIPIO ACTIVO/i.test(up) || up.includes("PRINCIPIO ACTIVO")) {
      map.idxPrin = c;
      continue;
    }
    if (/P_FARMACIA/i.test(up) || up.includes("P_FARMACIA")) {
      map.idxPfarm = c;
      continue;
    }
    if (/PVP/i.test(up) || up.includes("PVP") || up === "PVP") {
      map.idxPvp = c;
      continue;
    }
    if (/PROMOCION/i.test(up)) {
      map.idxPromo = c;
      continue;
    }
    if (/DESCUENTO/i.test(up)) {
      map.idxDesc = c;
      continue;
    }
    if (/IVA/i.test(up)) {
      map.idxIva = c;
      continue;
    }
    if (/COD|CODIGO/i.test(up)) {
      map.idxCod = c;
      continue;
    }
  }
  return map;
}

/**
 * Dados fila (array), headerMap y marca, devuelve objeto normalizado
 */
function mapFilaAProducto(fila, headerMap, marca) {
  const get = (i) =>
    typeof i === "number"
      ? fila[i] === undefined
        ? ""
        : String(fila[i]).trim()
      : "";

  const nombre = get(headerMap.idxNombre) || "";
  if (!nombre) return null; // sin nombre no añadimos

  const codigo = get(headerMap.idxCod) || "";
  const presentacion = get(headerMap.idxPresent) || "";
  const principio = get(headerMap.idxPrin) || "";
  const p_farm_raw = get(headerMap.idxPfarm) || "";
  const pvp_raw = get(headerMap.idxPvp) || "";
  const promo = get(headerMap.idxPromo) || "";
  const desc_raw = get(headerMap.idxDesc) || "";
  const iva_raw = get(headerMap.idxIva) || "";

  // Normalizaciones
  const toNumber = (s) => {
    if (!s && s !== 0) return null;
    const str = String(s)
      .replace(",", ".")
      .replace(/[^0-9.\-]/g, "");
    const n = parseFloat(str);
    return isNaN(n) ? null : n;
  };

  const P_FARMACIA = toNumber(p_farm_raw) ?? 0;
  const PVP = toNumber(pvp_raw) ?? 0;

  // descuento: queremos solo número + '%' . Si viene "4%" o "4 %", limpiar y usar "4%". Si viene "4", convertir "4%"
  let descuento = "";
  if (desc_raw) {
    const n = toNumber(desc_raw);
    descuento = n !== null ? `${Number(n) * 100}%` : String(desc_raw).trim();
  } else {
    descuento = "";
  }

  // IVA: si vacío -> 0
  const ivaNum = toNumber(iva_raw);
  const IVA = ivaNum === null ? 0 : ivaNum + " %";

  return {
    CODIGO: codigo,
    MARCA: marca || "",
    NOMBRE: nombre,
    PRESENTACION: presentacion,
    PRINCIPIO_ACTIVO: principio,
    P_FARMACIA: P_FARMACIA,
    PVP: PVP,
    PROMOCION: promo,
    DESCUENTO: descuento,
    IVA: IVA,
  };
}

/**
 * Exportar con ExcelJS (encabezado estilizado)
 */
async function exportar() {
  if (!rawProducts.value.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos");

  ws.columns = [
    { header: "CODIGO", key: "CODIGO", width: 30 },
    { header: "MARCA", key: "MARCA", width: 30 },
    { header: "NOMBRE", key: "NOMBRE", width: 40 },
    { header: "PRESENTACION", key: "PRESENTACION", width: 20 },
    { header: "PRINCIPIO_ACTIVO", key: "PRINCIPIO_ACTIVO", width: 30 },
    { header: "P_FARMACIA", key: "P_FARMACIA", width: 12 },
    { header: "PVP", key: "PVP", width: 12 },
    { header: "PROMOCION", key: "PROMOCION", width: 18 },
    { header: "DESCUENTO", key: "DESCUENTO", width: 12 },
    { header: "IVA", key: "IVA", width: 8 },
  ];

  // estilo encabezado
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

  // agregar filas
  rawProducts.value.forEach((p) => {
    ws.addRow(p);
  });

  // dar formato numérico a columnas P_FARMACIA, PVP e IVA
  ws.getColumn("P_FARMACIA").numFmt = "#,##0.00";
  ws.getColumn("PVP").numFmt = "#,##0.00";
  ws.getColumn("IVA").numFmt = "0.00";

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), "productos_formateados.xlsx");
}
</script>

<style scoped>
/* opcional: ajustar tabla */
.table td,
.table th {
  vertical-align: middle;
}
</style>
