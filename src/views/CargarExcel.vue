<template>
  <div class="cargar-excel container" style="margin-top: 60px">
    <h2>📥 Cargar productos desde Excel</h2>

    <p>📝 El archivo debe tener las siguientes columnas:</p>
    <div class="table-responsive container">
      <table class="table table-bordered formato-tabla">
        <thead>
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
          <tr>
            <td>2343</td>
            <td>Paracetamol 500mg</td>
            <td>Caja x 10</td>
            <td>Paracetamol</td>
            <td>1.50</td>
            <td>2.00</td>
            <td>2x1</td>
            <td>10</td>
            <td>Genfar</td>
            <td>15</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cargar Excel -->
    <div class="mb-4">
      <label for="excelInput" class="form-label fw-semibold text-primary">
        📄 Cargar archivo Excel
      </label>

      <div class="input-group">
        <label
          class="input-group-text bg-success text-white"
          for="excelInput"
          style="cursor: pointer"
        >
          <i class="bi bi-arrow-bar-up me-2"></i> Subir Excel
        </label>
        <input
          type="file"
          class="form-control"
          id="excelInput"
          @change="leerExcel"
          accept=".xlsx, .xls"
        />
      </div>

      <div v-if="archivoNombre" class="form-text text-success mt-2">
        Archivo seleccionado: {{ archivoNombre }}
      </div>
    </div>

    <!-- Contadores -->
    <div v-if="datos.length || repetidos.length" class="alert alert-info">
      <strong>📊 Resumen:</strong>
      <ul class="mb-0">
        <li>
          🟢 Nuevos productos cargados: <b>{{ nuevosCount }}</b>
        </li>
        <li>
          🟡 Productos repetidos detectados: <b>{{ repetidos.length }}</b>
        </li>
        <li>
          📦 Total actual en memoria: <b>{{ datos.length }}</b>
        </li>
      </ul>
    </div>

    <!-- Botones de acción -->
    <div class="mb-4">
      <button
        @click="guardarEnStore"
        v-if="datos.length"
        class="btn btn-success m-2"
      >
        💾 Guardar productos en memoria
      </button>

      <button
        v-if="repetidos.length"
        @click="exportarRepetidos"
        class="btn btn-danger m-2"
      >
        📤 Exportar productos repetidos
      </button>

      <RouterLink class="btn btn-warning px-2 sm m-2" to="/Productos">
        Cancelar
      </RouterLink>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading">
      <LoadingComponent />
    </div>

    <!-- Tabla de errores -->
    <div v-else>
      <div v-if="errores.length" class="mt-3">
        <h5 class="text-danger">❌ Errores detectados:</h5>
        <ul>
          <li v-for="error in errores" :key="`${error.hoja}-${error.fila}`">
            <strong>Hoja {{ error.hoja }}, Fila {{ error.fila }}:</strong>
            {{ error.errores.join(", ") }}
          </li>
        </ul>
      </div>

      <!-- Vista previa -->
      <div v-if="datos.length" class="table-responsive mt-4">
        <h4>👀 Vista previa de productos cargados</h4>
        <table class="table table-bordered table-sm formato-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Codigo</th>
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
            <tr
              v-for="(p, i) in datos"
              :key="i"
              :class="{ 'table-danger': tieneError(i) }"
            >
              <td>{{ i + 1 }}</td>
              <td>{{ p.Codigo }}</td>
              <td>{{ p.NombreProducto }}</td>
              <td>{{ p.Presentacion }}</td>
              <td>{{ p.PrincipioActivo }}</td>
              <td>{{ p.PrecioFarmacia }}</td>
              <td>{{ p.PVP }}</td>
              <td>{{ p.Promocion }}</td>
              <td>{{ p.Descuento }}</td>
              <td>{{ p.Marca }}</td>
              <td>{{ p.IVA }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import alertify from "alertifyjs";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import LoadingComponent from "@/components/LoadingComponent.vue";

const toast = useToast();
const router = useRouter();

const loading = ref(false);
const datos = ref([]);
const errores = ref([]);
const repetidos = ref([]);
const archivoNombre = ref("");
const nuevosCount = ref(0);

onMounted(() => {
  const guardados = localStorage.getItem("ListaProductos");
  if (guardados) {
    datos.value = JSON.parse(guardados);
  }
});

const leerExcel = (event) => {
  loading.value = true;
  const archivo = event.target.files[0];
  if (!archivo) {
    loading.value = false;
    return;
  }

  archivoNombre.value = archivo.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      errores.value = [];
      repetidos.value = [];
      let productosTemp = [];

      workbook.SheetNames.forEach((sheetName, indexH) => {
        const hoja = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(hoja);

        json.forEach((fila, index) => {
          const producto = {
            Codigo: fila.CODIGO,
            ID: `id-${index}-${Math.random().toString(36).substr(2, 5)}`,
            NombreProducto: fila.NombreProducto ?? fila.NOMBRE ?? "",
            Presentacion: fila.Presentacion ?? fila.PRESENTACION ?? "",
            PrincipioActivo:
              fila.PrincipioActivo ?? fila.PRINCIPIO_ACTIVO ?? "",
            PrecioFarmacia:
              parseFloat(fila.PrecioFarmacia ?? fila.P_FARMACIA ?? "") || 0,
            PVP: parseFloat(fila.PVP ?? "") || 0,
            Promocion: fila.Promocion ?? fila.PROMOCION ?? "",
            Descuento:
              parseInt(fila.Descuento ?? fila.DESCUENTO ?? 0) ||
              parseFloat(fila.Descuento ?? fila.DESCUENTO ?? 0) ||
              0,
            Marca: fila.Marca ?? fila.MARCA ?? "",
            IVA: parseInt(fila.IVA ?? 0) || 0,
          };

          productosTemp.push(producto);
        });
      });

      const existentes =
        datos.value.length > 0
          ? [...datos.value]
          : JSON.parse(localStorage.getItem("ListaProductos") || "[]");

      const codigosExistentes = new Set(existentes.map((p) => p.Codigo));

      const nuevos = [];
      const repetidosTemp = [];

      productosTemp.forEach((p) => {
        if (codigosExistentes.has(p.Codigo)) {
          repetidosTemp.push(p);
        } else {
          nuevos.push(p);
        }
      });

      datos.value = [...existentes, ...nuevos];
      repetidos.value = repetidosTemp;
      nuevosCount.value = nuevos.length;

      if (repetidosTemp.length > 0) {
        toast.warning(
          `⚠️ ${repetidosTemp.length} productos repetidos. Puedes exportarlos.`
        );
      } else {
        toast.success(`✅ ${nuevos.length} productos nuevos agregados.`);
      }
    } catch (error) {
      toast.error("❌ Error al procesar el archivo.");
      console.error("Error al leer Excel:", error);
    } finally {
      loading.value = false;
    }
  };

  reader.readAsArrayBuffer(archivo);
};

async function exportarRepetidos() {
  if (!repetidos.value.length) {
    toast.info("No hay productos repetidos para exportar");
    return;
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos Repetidos");

  ws.columns = [
    { header: "CODIGO", key: "Codigo", width: 15 },
    { header: "NombreProducto", key: "NombreProducto", width: 40 },
    { header: "Presentacion", key: "Presentacion", width: 25 },
    { header: "PrincipioActivo", key: "PrincipioActivo", width: 30 },
    { header: "PrecioFarmacia", key: "PrecioFarmacia", width: 15 },
    { header: "PVP", key: "PVP", width: 12 },
    { header: "Promocion", key: "Promocion", width: 15 },
    { header: "Descuento", key: "Descuento", width: 12 },
    { header: "Marca", key: "Marca", width: 20 },
    { header: "IVA", key: "IVA", width: 10 },
  ];

  repetidos.value.forEach((p) => ws.addRow(p));

  const header = ws.getRow(1);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB91D1D" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), "productos_repetidos.xlsx");
  toast.success("📦 Archivo de productos repetidos exportado correctamente");
}

const tieneError = (index) => {
  const producto = datos.value[index];
  return errores.value.some((e) => e.id === producto.ID);
};

const guardarEnStore = () => {
  localStorage.setItem("ListaProductos", JSON.stringify(datos.value));
  toast.success(
    `✅ Se guardaron ${datos.value.length} productos en memoria (sin borrar los anteriores).`
  );

  setTimeout(() => {
    router.push("/Productos");
  }, 1000);
};
</script>

<style scoped>
.cargar-excel {
  width: 100%;
  margin: auto;
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.formato-tabla th {
  background-color: #f0de8d !important;
}
.table-danger {
  background-color: #f8d7da !important;
}
.alert-info ul {
  list-style: none;
  padding-left: 0;
}
</style>
