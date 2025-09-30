<template>
  <div class="container py-5">
    <h2 class="text-primary fw-bold mb-4 text-center">
      📥 Descargar Excel de productos
    </h2>

    <div class="text-center">
      <button class="btn btn-success px-4 py-2" @click="descargarExcel">
        📁 Descargar Excel
      </button>

      <RouterLink class="btn btn-outline-warning" to="/gestionar"
        >Regresar</RouterLink
      >
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import alertify from "alertifyjs";

const descargarExcel = () => {
  const productos = JSON.parse(localStorage.getItem("ListaProductos") || "[]");

  if (!productos.length) {
    alertify.error("❌ No hay productos para exportar");
    return;
  }

  // Formatea los datos para Excel
  const hoja = XLSX.utils.json_to_sheet(productos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Productos");

  // Genera nombre con fecha
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const nombreArchivo = `productos_${yyyy}-${mm}-${dd}.xlsx`;

  // Convierte a archivo y lo descarga
  const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, nombreArchivo);

  alertify.success(`✅ Excel descargado como ${nombreArchivo}`);
};
</script>
