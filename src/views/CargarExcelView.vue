<template>
  <div class="cargar-excel">
    <h2>📥 Cargar productos desde Excel</h2>

    <p>📝 El archivo debe tener las siguientes columnas:</p>
    <div class="table-responsive">
      <table class="table table-bordered cargar-excel">
        <thead>
          <tr>
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

    <input type="file" @change="leerExcel" accept=".xlsx, .xls" />
    <button
      @click="enviarDatos"
      v-if="datos.length > 0"
      class="btn btn-success"
    >
      Registrar productos
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import { registrarLote } from "@/servicios/api";

const datos = ref([]);

const leerExcel = (event) => {
  const archivo = event.target.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja);

    datos.value = json.map((fila) => ({
      NombreProducto: fila.NombreProducto ?? "",
      Presentacion: fila.Presentacion ?? "",
      PrincipioActivo: fila.PrincipioActivo ?? "",
      PrecioFarmacia: fila.PrecioFarmacia ?? "",
      PVP: fila.PVP ?? "",
      Promocion: fila.Promocion ?? "",
      Descuento: parseInt(fila.Descuento ?? 0),
      Marca: fila.Marca ?? "",
      IVA: parseInt(fila.IVA ?? 0),
    }));
  };
  reader.readAsArrayBuffer(archivo);
};

const enviarDatos = async () => {
  try {
    await registrarLote(datos.value);
    alert("✅ Productos registrados correctamente");
    datos.value = [];
  } catch (err) {
    alert("❌ Error al registrar productos");
    console.error(err);
  }
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
.formato-tabla {
  width: 99%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.formato-tabla th,
.formato-tabla td {
  border: 1px solid #ddd;
  padding: 2px;
  text-align: center;
}
.formato-tabla th {
  background-color: #f0de8d !important;
}
</style>
