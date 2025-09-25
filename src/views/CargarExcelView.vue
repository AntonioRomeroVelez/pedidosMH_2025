<template>
  <div class="cargar-excel">
    <h2>📥 Cargar productos desde Excel</h2>

    <p>📝 El archivo debe tener las siguientes columnas:</p>
    <div class="table-responsive">
      <table class="table table-bordered formato-tabla">
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

    <input
      type="file"
      @change="leerExcel"
      accept=".xlsx, .xls"
      class="form-control my-3"
    />

    <div v-if="datos.length" class="table-responsive mt-4">
      <h4>👀 Vista previa de productos cargados</h4>
      <table class="table table-bordered table-sm formato-tabla">
        <thead>
          <tr>
            <th>#</th>
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

    <div v-if="errores.length" class="mt-3">
      <h5 class="text-danger">❌ Errores detectados:</h5>
      <ul>
        <li v-for="error in errores" :key="error.fila">
          <strong>Fila {{ error.fila }}:</strong> {{ error.errores.join(", ") }}
        </li>
      </ul>
    </div>

    <button
      @click="enviarDatos"
      v-if="datos.length"
      class="btn btn-success mt-3"
    >
      Registrar productos
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import { registrarLote } from "@/servicios/api";
import alertify from "alertifyjs";

const datos = ref([]);
const errores = ref([]);

const leerExcel = (event) => {
  const archivo = event.target.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja);

    errores.value = [];
    datos.value = json.map((fila, index) => {
      const producto = {
        NombreProducto: fila.NombreProducto ?? "",
        Presentacion: fila.Presentacion ?? "",
        PrincipioActivo: fila.PrincipioActivo ?? "",
        PrecioFarmacia: parseFloat(fila.PrecioFarmacia ?? ""),
        PVP: parseFloat(fila.PVP ?? ""),
        Promocion: fila.Promocion ?? "",
        Descuento: parseInt(fila.Descuento ?? 0),
        Marca: fila.Marca ?? "",
        IVA: parseInt(fila.IVA ?? 0),
      };

      const erroresFila = [];
      if (!producto.NombreProducto) erroresFila.push("Nombre vacío");
      if (!producto.Presentacion) erroresFila.push("Presentación vacía");
      if (!producto.PrincipioActivo) erroresFila.push("Principio activo vacío");
      if (isNaN(producto.PrecioFarmacia))
        erroresFila.push("Precio farmacia inválido");
      if (isNaN(producto.PVP)) erroresFila.push("PVP inválido");
      if (!producto.Marca) erroresFila.push("Marca vacía");
      if (isNaN(producto.IVA)) erroresFila.push("IVA inválido");

      if (erroresFila.length > 0) {
        errores.value.push({ fila: index + 2, errores: erroresFila });
      }

      return producto;
    });

    if (errores.value.length > 0) {
      alertify.error(
        "❌ Hay errores en el archivo. Revisa las filas marcadas."
      );
    } else {
      alertify.success("✅ Archivo cargado correctamente");
    }
  };

  reader.readAsArrayBuffer(archivo);
};

const tieneError = (index) => {
  return errores.value.some((e) => e.fila === index + 2);
};

const enviarDatos = async () => {
  if (errores.value.length > 0) {
    alertify.error("❌ No se puede registrar. Corrige los errores primero.");
    return;
  }

  try {
    await registrarLote(datos.value);
    alertify.success("✅ Productos registrados correctamente");
    datos.value = [];
  } catch (err) {
    alertify.error("❌ Error al registrar productos");
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
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.formato-tabla th,
.formato-tabla td {
  border: 1px solid #ddd;
  padding: 4px;
  text-align: center;
}
.formato-tabla th {
  background-color: #f0de8d !important;
}
</style>
