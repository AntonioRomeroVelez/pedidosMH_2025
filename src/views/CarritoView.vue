<template>
  <div class="container mt-5">
    <h2>🛒 Carrito de Compras</h2>

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
        <input v-model="pedido.Fecha" type="date" class="form-control" />
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

    <!-- Tabla de productos -->
    <table class="table table-bordered table-striped" v-if="carrito.length">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Presentación</th>
          <th>Principio Activo</th>
          <th>Precio Farmacia</th>
          <th>Promoción</th>
          <th>Descuento</th>
          <th>Marca</th>
          <th>IVA</th>
          <th>Cantidad</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in carrito" :key="item.id">
          <td>{{ item.NombreProducto }}</td>
          <td>{{ item.Presentacion }}</td>
          <td>{{ item.PrincipioActivo }}</td>
          <td>$ {{ item.PrecioFarmacia }}</td>
          <td>{{ item.Promocion }}</td>
          <td>{{ item.Descuento }}</td>
          <td>{{ item.Marca }}</td>
          <td>{{ item.IVA > 0 ? item.IVA + "%" : "No aplica" }}</td>
          <td>
            <input
              type="number"
              min="1"
              v-model.number="item.cantidad"
              @change="actualizarCantidad(index)"
              class="form-control"
              style="width: 80px"
            />
          </td>
          <td>
            $
            {{ (item.PrecioFarmacia * item.cantidad).toFixed(2) }}
          </td>
          <td>
            <button
              class="btn btn-danger btn-sm"
              @click="eliminarProducto(index)"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="9" class="text-end">Subtotal 15%:</th>
          <th colspan="2">$ {{ subtotal15.toFixed(2) }}</th>
        </tr>
        <tr>
          <th colspan="9" class="text-end">Subtotal 0%:</th>
          <th colspan="2">$ {{ subtotal0.toFixed(2) }}</th>
        </tr>
        <tr>
          <th colspan="9" class="text-end">IVA 15%:</th>
          <th colspan="2">$ {{ iva15.toFixed(2) }}</th>
        </tr>
        <tr>
          <th colspan="9" class="text-end">VALOR TOTAL:</th>
          <th colspan="2">$ {{ totalCarrito.toFixed(2) }}</th>
        </tr>
      </tfoot>
    </table>

    <div v-else class="alert alert-info mt-4">El carrito está vacío.</div>

    <!-- Botón para guardar pedido -->
    <div class="mt-4 d-flex justify-content-around" v-if="carrito.length">
      <button @click="vaciarCarrito" class="btn btn-warning">
        Vaciar carrito
      </button>

      <button
        class="btn btn-primary"
        @click="descargarExcel"
        :disabled="!carrito.length"
      >
        Guardar Pedido
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

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
  // Establecer fecha actual en formato YYYY-MM-DD
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

  return { promo, total };
};

///// descaqrgar excel
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const descargarExcel = async () => {
  // Validación de campos obligatorios
  const camposObligatorios = ["Nombre", "Ciudad", "Fecha", "Vendedor", "Tipo"];
  const faltantes = camposObligatorios.filter((campo) => !pedido.value[campo]);

  if (faltantes.length) {
    alert(`Faltan campos obligatorios: ${faltantes.join(", ")}`);
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
  hoja.addRow(["Productos"]);

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
      const totalVista = item.PrecioFarmacia * item.cantidad;
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

  // Agregar encabezado con estilo
  const headerRow = hoja.addRow(encabezados);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCE5FF" },
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Agregar filas de productos
  filas.forEach((fila) => {
    const row = hoja.addRow(fila);
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
    const totalGeneral = carrito.value.reduce((acc, item) => {
      const totalVista =
        item.PrecioFarmacia *
        item.cantidad *
        (1 + (item.IVA > 0 ? item.IVA / 100 : 0));
      return acc + totalVista;
    }, 0);
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
  hoja.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    col.width = maxLength + 2;
  });

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
</script>
