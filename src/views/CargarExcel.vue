<template>
  <div class="cargar-excel container" style="margin-top: 60px">
    <h2>📥 Cargar productos desde Excel</h2>
    <p>📝 El archivo debe tener las siguientes columnas:</p>

    <!-- Tabla de formato esperado -->
    <div class="table-responsive container">
      <table class="table table-bordered formato-tabla">
        <thead>
          <tr>
            <th>CODIGO</th>
            <th>Marca</th>
            <th>Nombre</th>
            <th>Presentacion</th>
            <th>Principio_Activo</th>
            <th>P_Farmacia</th>
            <th>PVP</th>
            <th>Promocion</th>
            <th>Descuento</th>
            <th>IVA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2343</td>
            <td>Genfar</td>
            <td>Paracetamol 500mg</td>
            <td>Caja x 10</td>
            <td>Paracetamol</td>
            <td>1.50</td>
            <td>2.00</td>
            <td>2x1</td>
            <td>10</td>
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

    <!-- Botones -->
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

    <!-- Vista previa -->
    <div v-else>
      <!-- Filtro de repetidos -->
      <div v-if="datos.length" class="mb-3 text-end">
        <label class="me-2 fw-semibold text-primary">🔍 Mostrar:</label>
        <select v-model="filtro" class="form-select d-inline w-auto">
          <option value="todos">Todos</option>
          <option value="repetidos">Solo repetidos</option>
          <option value="noRepetidos">Solo no repetidos</option>
        </select>
      </div>

      <!-- Vista previa responsiva -->
      <div v-if="datos.length" class="vista-previa mt-4">
        <h4 class="fw-bold text-primary mb-3 text-center text-md-start">
          👀 Vista previa de productos cargados
        </h4>

        <div
          class="table-responsive shadow-sm rounded-4 border position-relative"
          style="max-height: 70vh; overflow-y: auto"
        >
          <table
            class="table table-hover align-middle text-center table-striped"
            style="min-width: 950px; word-wrap: break-word; table-layout: fixed"
          >
            <thead class="table-primary sticky-header">
              <tr>
                <th scope="col" style="min-width: 40px">Código</th>
                <th scope="col" style="width: 20px">#</th>
                <th scope="col" style="min-width: 140px">Marca</th>
                <th scope="col" style="min-width: 200px">Nombre Producto</th>
                <th scope="col" style="min-width: 140px">Presentación</th>
                <th scope="col" style="min-width: 160px">Principio Activo</th>
                <th scope="col" style="min-width: 100px">P. Farmacia</th>
                <th scope="col" style="min-width: 90px">PVP</th>
                <th scope="col" style="min-width: 120px">Promoción</th>
                <th scope="col" style="min-width: 120px">Descuento</th>
                <th scope="col" style="min-width: 70px">IVA</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, i) in productosFiltrados"
                :key="i"
                :class="{ 'table-danger': p.duplicado }"
              >
                <td class="text-break">{{ p.Codigo }}</td>
                <td>{{ i + 1 }}</td>
                <td class="text-break">{{ p.Marca }}</td>
                <td class="text-break">{{ p.NombreProducto }}</td>
                <td class="text-break">{{ p.Presentacion }}</td>
                <td class="text-break">{{ p.PrincipioActivo }}</td>
                <td>{{ p.PrecioFarmacia.toFixed(2) }}</td>
                <td>{{ p.PVP.toFixed(2) }}</td>
                <td class="text-break">{{ p.Promocion }}</td>
                <td>{{ p.Descuento }}</td>
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
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
const hayDuplicadosInternos = ref(false);
const filtro = ref("todos");

onMounted(() => {
  const guardados = localStorage.getItem("ListaProductos");
  if (guardados) {
    datos.value = JSON.parse(guardados);
  }
});

// Computed para aplicar filtro
const productosFiltrados = computed(() => {
  if (filtro.value === "repetidos") {
    return datos.value.filter((p) => p.duplicado);
  } else if (filtro.value === "noRepetidos") {
    return datos.value.filter((p) => !p.duplicado);
  }
  return datos.value;
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
      hayDuplicadosInternos.value = false;
      let productosTemp = [];

      workbook.SheetNames.forEach((sheetName) => {
        const hoja = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(hoja);

        json.forEach((fila) => {
          const filaNormalizada = {};
          Object.keys(fila).forEach((k) => {
            const keyLimpia = k
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase();
            filaNormalizada[keyLimpia] = fila[k];
          });

          const codigo = filaNormalizada["CODIGO"]?.toString().trim() || "";

          const producto = {
            ID: codigo || `id-${Math.random().toString(36).substr(2, 5)}`,
            Codigo: codigo,
            Marca: filaNormalizada["MARCA"]?.toString().trim() || "",
            NombreProducto: filaNormalizada["NOMBRE"]?.toString().trim() || "",
            Presentacion:
              filaNormalizada["PRESENTACION"]?.toString().trim() || "",
            PrincipioActivo:
              filaNormalizada["PRINCIPIO_ACTIVO"]?.toString().trim() || "",
            PrecioFarmacia:
              parseFloat(
                (filaNormalizada["P_FARMACIA"] || "0")
                  .toString()
                  .replace(",", ".")
              ) || 0,
            PVP:
              parseFloat(
                (filaNormalizada["PVP"] || "0").toString().replace(",", ".")
              ) || 0,
            Promocion: filaNormalizada["PROMOCION"] || "",
            Descuento:
              parseFloat((filaNormalizada["DESCUENTO"] || "0").toString()) || 0,
            IVA:
              parseFloat(
                (filaNormalizada["IVA"] || "0").toString().replace(",", ".")
              ) || 0,
            duplicado: false,
          };

          productosTemp.push(producto);
        });
      });

      // Limpiar texto (sin espacios, sin tildes, en minúsculas)
      const limpiarTexto = (txt) =>
        (txt || "")
          .toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "")
          .toLowerCase();

      // Detectar duplicados
      const mapaFirmas = new Map();
      productosTemp.forEach((p) => {
        const firma = `${limpiarTexto(p.Marca)}|${limpiarTexto(
          p.NombreProducto
        )}|${limpiarTexto(p.Presentacion)}|${limpiarTexto(p.PrincipioActivo)}`;

        if (mapaFirmas.has(firma)) {
          p.duplicado = true;
          mapaFirmas.get(firma).duplicado = true;
          hayDuplicadosInternos.value = true;
        } else {
          mapaFirmas.set(firma, p);
        }
      });

      datos.value = productosTemp;
      repetidos.value = productosTemp.filter((p) => p.duplicado);

      if (hayDuplicadosInternos.value) {
        toast.error(
          "⚠️ Se detectaron productos duplicados en el archivo. Revisa los resaltados en rojo."
        );
      } else {
        toast.success(
          "✅ Archivo cargado correctamente, sin duplicados internos."
        );
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

// Guardar
const guardarEnStore = () => {
  if (hayDuplicadosInternos.value) {
    toast.error("❌ No se puede guardar. Elimina los productos duplicados.");
    return;
  }
  localStorage.setItem("ListaProductos", JSON.stringify(datos.value));
  toast.success(
    `✅ Se guardaron ${datos.value.length} productos correctamente.`
  );
  setTimeout(() => {
    router.push("/Productos");
  }, 1000);
};

// Exportar duplicados
async function exportarRepetidos() {
  if (!repetidos.value.length) {
    toast.info("No hay productos repetidos para exportar");
    return;
  }
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos Repetidos");
  ws.columns = [
    { header: "CODIGO", key: "Codigo", width: 15 },
    { header: "Marca", key: "Marca", width: 20 },
    { header: "NombreProducto", key: "NombreProducto", width: 40 },
    { header: "Presentacion", key: "Presentacion", width: 25 },
    { header: "PrincipioActivo", key: "PrincipioActivo", width: 30 },
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

const tieneError = (index) => datos.value[index]?.duplicado;
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

/* Contenedor de la tabla */
.vista-previa .table-responsive {
  overflow-y: auto;
  overflow-x: auto;
  max-height: 70vh;
  border-radius: 12px;
}

/* Encabezado fijo */
.sticky-header th {
  position: sticky;
  top: 0;
  background-color: #0d6efd !important;
  color: white;
  z-index: 2;
  text-align: center;
  vertical-align: middle;
}

/* Texto adaptable */
.text-break {
  white-space: normal !important;
  word-break: break-word !important;
}

/* Vista móvil */
@media (max-width: 768px) {
  .vista-previa h4 {
    font-size: 1rem;
    text-align: center;
  }
  .table {
    font-size: 0.75rem;
  }
  .sticky-header th {
    font-size: 0.8rem;
  }
}
</style>
