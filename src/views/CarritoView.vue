<template>
  <div class="container mt-4">
    <h2 style="margin-top: 70px">🛒 Carrito de Compras</h2>

    <!-- Datos del pedido -->
    <div class="row mb-4" v-if="carrito.length">
      <div class="col-md-3">
        <label class="form-label">Nombre</label>
        <input v-model="pedido.Nombre" type="text" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Ciudad</label>
        <input v-model="pedido.Ciudad" type="text" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Fecha</label>
        <input
          v-model="pedido.Fecha"
          type="date"
          readonly
          disabled
          class="form-control"
        />
      </div>
      <div class="col-md-3">
        <label class="form-label">Vendedor</label>
        <select v-model="pedido.Vendedor" class="form-select">
          <option value="" disabled selected>Seleccione</option>
          <option value="Diana Benalcázar">Diana Benalcázar</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Tipo de documento</label>
        <select v-model="pedido.Tipo" class="form-select">
          <option value="" disabled selected>Seleccione</option>
          <option value="Pedido">Pedido</option>
          <option value="Proforma">Proforma</option>
        </select>
      </div>
    </div>
    <!-- Botón para guardar pedido -->
    <div
      class="mt-4 d-flex justify-content-around flex-wrap gap-4"
      v-if="carrito.length"
    >
      <button @click="vaciarCarrito" class="btn btn-warning">
        Vaciar carrito
      </button>

      <button
        class="btn btn-primary"
        @click="descargarExcel"
        :disabled="!carrito.length"
      >
        Exportar Excel
      </button>

      <button
        class="btn btn-success"
        @click="descarTablaConPromocion"
        :disabled="!carrito.length"
      >
        Exportar Imagen promociones
      </button>
    </div>

    <!-- Tabla de productos -->
    <div class="mt-4" v-if="carrito.length">
      <table
        class="table table-bordered table-sm table-striped text-center align-middle tableProductos"
      >
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Presentación</th>
            <th>Principio Activo</th>
            <th>PVP</th>
            <th>Promoción</th>
            <th>Descuento</th>
            <th>Marca</th>
            <th>IVA</th>
            <th>Cantidad</th>
            <th>Cantidad a recibir</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in carrito" :key="item.id">
            <td data-label="Nombre">{{ item.NombreProducto }}</td>
            <td data-label="Presentación">{{ item.Presentacion }}</td>
            <td data-label="Principio Activo">{{ item.PrincipioActivo }}</td>
            <td data-label="Precio Farmacia">$ {{ item.PrecioFarmacia }}</td>
            <td data-label="Promoción">{{ item.Promocion }}</td>
            <td data-label="Descuento">{{ item.Descuento }}</td>
            <td data-label="Marca">{{ item.Marca }}</td>
            <td data-label="IVA">
              {{ item.IVA > 0 ? item.IVA + "%" : "No aplica" }}
            </td>
            <td data-label="Cantidad">
              <input
                type="number"
                min="0"
                v-model.number="item.cantidad"
                @change="actualizarCantidad(index)"
                class="form-control form-control-sm"
                style="width: 80px"
              />
            </td>
            <td data-label="Cantidad a recibir">
              {{ mostarCantidadTotal(item.Promocion, item.cantidad) }}
            </td>
            <td data-label="Acciones">
              <button
                class="btn btn-danger btn-sm"
                @click="eliminarProducto(index)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Totales desglosados -->
      <div class="mt-4" v-if="carrito.length">
        <div class="row justify-content-end">
          <div class="col-md-4">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <strong>Subtotal 15%:</strong>
                <span>$ {{ subtotal15.toFixed(2) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <strong>Subtotal 0%:</strong>
                <span>$ {{ subtotal0.toFixed(2) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <strong>IVA 15%:</strong>
                <span>$ {{ iva15.toFixed(2) }}</span>
              </li>
              <li
                class="list-group-item d-flex justify-content-between bg-light"
              >
                <strong>Total:</strong>
                <span class="fw-bold text-success"
                  >$ {{ totalCarrito.toFixed(2) }}</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info mt-4">El carrito está vacío.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import alertify from "alertifyjs";

const carrito = ref([]);
const totalCarrito = ref(0);

const pedido = ref({
  Nombre: "",
  Ciudad: "",
  Fecha: "",
  Vendedor: "",
});

const subtotal15 = ref(0);
const subtotal0 = ref(0);
const iva15 = ref(0);

const calcularTotalesDesglosados = () => {
  subtotal15.value = 0;
  subtotal0.value = 0;
  iva15.value = 0;

  carrito.value.forEach((item) => {
    const base = item.PrecioFarmacia * item.cantidad;
    console.log("base:", base);
    const iva = Number(item.IVA);

    if (iva > 0) {
      subtotal15.value += base;
      iva15.value += base * (iva / 100);
    } else {
      subtotal0.value += base;
    }
  });
  console.log("subtotal15:", subtotal15);
  console.log("subtotal0:", subtotal0);
  console.log("iva15:", iva15);

  totalCarrito.value = subtotal15.value + subtotal0.value + iva15.value;
};

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.value = datos;
  calcularTotal();
  calcularTotalesDesglosados();
  pedido.value.Fecha = new Date().toISOString().split("T")[0];
});

const calcularTotal = () => {
  totalCarrito.value = carrito.value.reduce((acc, item) => {
    const iva = item.IVA > 0 ? item.IVA : 0; // Si tiene IVA, úsalo; si no, 0
    const precioConIVA = item.PrecioFarmacia * item.cantidad * (1 + iva / 100);
    return acc + precioConIVA;
  }, 0);
};

const actualizarCantidad = (index) => {
  if (carrito.value[index].cantidad < 1) carrito.value[index].cantidad = 1;
  localStorage.setItem("carrito", JSON.stringify(carrito.value));
  calcularTotal();
  calcularTotalesDesglosados();
};

const eliminarProducto = (index) => {
  carrito.value.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito.value));
  calcularTotal();
  calcularTotalesDesglosados();
};

const calcularPromocion = (promocionStr, cantidad) => {
  if (!promocionStr || !promocionStr.includes("+"))
    return { promo: 0, total: cantidad };

  const [baseStr, extraStr] = promocionStr.split("+");
  const base = parseInt(baseStr);
  const extra = parseInt(extraStr);

  if (isNaN(base) || isNaN(extra) || base <= 0)
    return { promo: 0, total: cantidad };

  const veces = Math.floor(cantidad / base);
  const promo = veces * extra;
  const total = cantidad + promo;
  console.log("promo:", promo);
  console.log("total:", total);
  return { promo, total };
};

function mostarCantidadTotal(promocion, cantidad) {
  if (!promocion || !cantidad) return cantidad;

  const lista = promocion.split(",").map((p) => p.trim());
  let mejorExtra = 0;

  for (const promo of lista) {
    const [x, y] = promo.split("+").map((n) => parseInt(n.trim()));
    if (isNaN(x) || isNaN(y) || x <= 0 || y < 0) continue;

    const grupos = Math.floor(cantidad / x);
    const extra = grupos * y;
    if (extra > mejorExtra) mejorExtra = extra;
  }

  return cantidad + mejorExtra;
}

///// descaqrgar excel

const descargarExcel = async () => {
  // Validación de campos obligatorios
  const camposObligatorios = ["Nombre", "Ciudad", "Fecha", "Vendedor", "Tipo"];
  const faltantes = camposObligatorios.filter((campo) => !pedido.value[campo]);

  if (faltantes.length) {
    alertify.error(`❌ Faltan campos obligatorios: ${faltantes.join(", ")}`);
    // alert(`Faltan campos obligatorios: ${faltantes.join(", ")}`);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet(pedido.value.Tipo);

  // Encabezado del pedido
  hoja.addRow([`Datos del ${pedido.value.Tipo}`]);
  hoja.addRow(["Nombre", pedido.value.Nombre]);
  hoja.addRow(["Ciudad", pedido.value.Ciudad]);
  hoja.addRow(["Fecha", pedido.value.Fecha]);
  hoja.addRow(["Vendedor", pedido.value.Vendedor]);
  hoja.addRow(["Tipo", pedido.value.Tipo]);
  hoja.addRow([]);

  // Configuración según tipo
  let encabezados = [];
  let filas = [];

  if (pedido.value.Tipo === "Pedido") {
    encabezados = [
      "Cantidad",
      "Promoción",
      "NombreProducto",
      "Lote",
      "Fecha de Vencimiento",
    ];
    filas = carrito.value.map((item) => {
      const { promo, total } = calcularPromocion(item.Promocion, item.cantidad);
      return [
        item.cantidad,
        promo,
        item.NombreProducto,
        "", // Lote
        "", // Fecha de vencimiento
      ];
    });
  }
  if (pedido.value.Tipo === "Proforma") {
    encabezados = [
      "Cantidad",
      "Promoción",
      "Nombre Producto",
      "Marca",
      "Precio",
      "Total",
    ];
    filas = carrito.value.map((item) => {
      const totalVista = item.PVP * item.cantidad;
      return [
        item.cantidad,
        calcularPromocion(item.Promocion, item.cantidad).promo,
        item.NombreProducto,
        item.Marca,
        item.PrecioFarmacia,
        totalVista.toFixed(2),
      ];
    });
  }

  // Agregar encabezados
  const headerRow = hoja.addRow(encabezados);
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCE5FF" },
    };
    cell.font = {
      bold: true,
      size: 12,
      color: { argb: "FF000000" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Asignar ancho por columna según tipo
  if (pedido.value.Tipo === "Pedido") {
    hoja.getColumn(1).width = 15; // Cantidad
    hoja.getColumn(2).width = 15; // Promoción
    hoja.getColumn(3).width = 35; // NombreProducto
    hoja.getColumn(4).width = 40; // Lote
    hoja.getColumn(5).width = 40; // Fecha de Vencimiento
  }

  if (pedido.value.Tipo === "Proforma") {
    hoja.getColumn(1).width = 15; // Cantidad
    hoja.getColumn(2).width = 15; // Promoción
    hoja.getColumn(3).width = 35; // Nombre Producto
    hoja.getColumn(4).width = 35; // Marca
    hoja.getColumn(5).width = 15; // Precio
    hoja.getColumn(6).width = 20; // Total
  }

  // Agregar filas de productos
  filas.forEach((fila) => {
    const row = hoja.addRow(fila);
    row.height = 55; // 👈 Establece la altura en puntos (aprox. 50px visuales)
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true, // 👈 Esto activa el salto de línea automático
      };
    });
  });

  // Total general para Proforma
  if (pedido.value.Tipo === "Proforma") {
    hoja.addRow([]); // fila vacía
    const resumenRow1 = hoja.addRow([
      "",
      "",
      "",
      "",
      "Subtotal 15%:",
      subtotal15.value.toFixed(2),
    ]);
    const resumenRow2 = hoja.addRow([
      "",
      "",
      "",
      "",
      "Subtotal 0%:",
      subtotal0.value.toFixed(2),
    ]);
    const resumenRow3 = hoja.addRow([
      "",
      "",
      "",
      "",
      "IVA 15%:",
      iva15.value.toFixed(2),
    ]);
    const resumenRow4 = hoja.addRow([
      "",
      "",
      "",
      "",
      "VALOR TOTAL:",
      totalCarrito.value.toFixed(2),
    ]);

    // Aplicar bordes y estilos
    [resumenRow1, resumenRow2, resumenRow3, resumenRow4].forEach((row) => {
      row.eachCell((cell) => {
        const valor = cell.value?.toString().trim();

        if (valor) {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
          cell.font = { bold: true };
        }
      });
    });
  }

  // Ajustar ancho de columnas
  // hoja.columns.forEach((col) => {
  //   let maxLength = 10;
  //   col.eachCell({ includeEmpty: true }, (cell) => {
  //     const value = cell.value ? cell.value.toString() : "";
  //     maxLength = Math.max(maxLength, value.length);
  //   });
  //   col.width = maxLength + 2;
  // });

  // Descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const nombreArchivo = `${pedido.value.Tipo}_Cliente_${pedido.value.Nombre}_ciudad_${pedido.value.Ciudad}_Cliente_${pedido.value.Fecha}.xlsx`;
  saveAs(new Blob([buffer]), nombreArchivo);
};

const vaciarCarrito = async () => {
  // 🔥 Limpiar el carrito después de descargar
  localStorage.removeItem("carrito");
  carrito.value = [];
};

const descarTablaConPromocion = async () => {
  const tabla = document.createElement("table");
  tabla.style.borderCollapse = "collapse";
  tabla.style.width = "100%";
  tabla.style.backgroundColor = "white";
  tabla.style.fontFamily = "Arial, sans-serif";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="background-color: #4CAF50; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd;">Producto</th>
      <th style="padding: 12px; border: 1px solid #ddd;">Precio</th>
      <th style="padding: 12px; border: 1px solid #ddd;">Promoción</th>
      <th style="padding: 12px; border: 1px solid #ddd;">Descuento1</th>
    </tr>
  `;
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  carrito.value.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = index % 2 === 0 ? "#f2f2f2" : "white";
    tr.innerHTML = `
      <td style="padding: 12px; border: 1px solid #ddd;">${
        item.NombreProducto
      }</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${
        item.precioFarmacia
      }</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${
        item.Promocion || "Sin promoción"
      }</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${
        item.Descuento || "Sin descuento"
      }</td>
    `;
    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);

  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.backgroundColor = "white";
  container.style.fontFamily = "Arial, sans-serif";

  const titulo = document.createElement("h2");
  titulo.style.textAlign = "center";
  titulo.style.marginBottom = "20px";
  titulo.style.color = "#333";

  container.appendChild(titulo);
  container.appendChild(tabla);

  // Agregar al DOM temporalmente
  document.body.appendChild(container);

  const html2canvas = (await import("html2canvas")).default;
  html2canvas(container, {
    backgroundColor: "white",
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    const imagen = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `lista_productos_${
      new Date().toISOString().split("T")[0]
    }.png`;
    link.href = imagen;
    link.click();

    // Limpiar el DOM
    document.body.removeChild(container);
  });
};
</script>

<style scoped>
@media (max-width: 768px) {
  .tableProductos thead {
    display: none; /* Oculta encabezados */
  }
  .tableProductos,
  .tableProductos tbody,
  .tableProductos tr,
  .tableProductos td {
    display: block;
    width: 100%;
  }
  .tableProductos tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    padding: 0.5rem;
  }
  .tableProductos td {
    text-align: right;
    position: relative;
    padding-left: 50%;
  }
  .tableProductos td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    width: 50%;
    padding-left: 0.75rem;
    font-weight: bold;
    text-align: left;
  }
}
</style>
