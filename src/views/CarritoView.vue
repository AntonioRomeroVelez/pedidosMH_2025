<template>
  <div class="container px-0">
    <h2 class="text-center mb-4" style="margin-top: 60px">
      🛒 Carrito de Compras
    </h2>

    <!-- Datos del pedido -->
    <div class="row mb-4" v-if="carrito.length">
      <div class="col-md-3">
        <label class="form-label">Nombre cliente</label>
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

    <!-- Lista de productos: tabla en desktop, tarjetas en móvil -->
    <div class="mt-4" v-if="carrito.length">
      <!-- Overlay spinner durante exportaciones -->
      <div v-if="isExporting" class="export-overlay">
        <div class="export-spinner" aria-hidden="true"></div>
        <div class="export-text">Generando archivo, por favor espere...</div>
      </div>

      <div v-if="!isMobile" class="table-container">
        <table
          class="table table-bordered table-sm table-striped text-center align-middle tableProductos mx-auto"
        >
          <thead>
            <tr>
              <th class="text-wrap fs-6 text">Nombre</th>
              <th class="text-wrap fs-6 text">Presentación</th>
              <th class="text-wrap fs-6 text">Principio Activo</th>
              <th class="text-wrap fs-6 text">PVP</th>
              <th class="text-wrap fs-6 text">Promoción</th>
              <th class="text-wrap fs-6 text">Descuento</th>
              <th class="text-wrap fs-6 text">Marca</th>
              <th class="text-wrap fs-6 text">IVA</th>
              <th class="text-wrap fs-6 text">Cantidad</th>
              <th class="text-wrap fs-6 text">A recibir</th>
              <th class="text-wrap fs-6 text">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in carrito" :key="item.id">
              <td data-label="Nombre">{{ item.NombreProducto }}</td>
              <td data-label="Presentación">{{ item.Presentacion }}</td>
              <td data-label="Principio Activo">{{ item.PrincipioActivo }}</td>
              <td data-label="Precio Farmacia">$ {{ item.PrecioFarmacia }}</td>
              <td data-label="Promoción">{{ item.Promocion }}</td>
              <td data-label="Descuento">
                {{
                  item.Descuento !== undefined &&
                  item.Descuento !== null &&
                  Number(item.Descuento) !== 0
                    ? item.Descuento
                    : ""
                }}
              </td>
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
      </div>

      <!-- Tarjetas para móvil -->
      <div v-else class="mobile-cards">
        <div
          v-for="(item, index) in carrito"
          :key="item.id"
          class="card mb-3 mobile-card"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="product-info">
                <h5 class="card-title mb-1">{{ item.NombreProducto }}</h5>
                <div class="text-muted small">
                  <div><strong>Marca:</strong> {{ item.Marca }}</div>
                  <div>
                    <strong>Presentación:</strong> {{ item.Presentacion }}
                  </div>
                  <div>
                    <strong>P. Activo:</strong>
                    {{ item.PrincipioActivo || "-" }}
                  </div>
                </div>
              </div>
              <div class="price-info">
                <div class="fw-bold text-success fs-5">
                  $ {{ Number(item.PrecioFarmacia).toFixed(2) }}
                </div>
                <div class="text-muted small">
                  IVA: {{ item.IVA > 0 ? item.IVA + "%" : "No aplica" }}
                </div>
              </div>
            </div>

            <div
              class="promo-info p-2 mb-2 rounded"
              :class="item.Promocion ? 'bg-light' : ''"
            >
              <div class="mb-1">
                <strong class="text-primary">Promoción:</strong>
                <span class="badge bg-info text-dark ms-1">{{
                  item.Promocion || "Sin promoción"
                }}</span>
              </div>
              <div v-if="item.Descuento && Number(item.Descuento) !== 0">
                <strong class="text-primary">Descuento:</strong>
                <span class="badge bg-warning text-dark ms-1"
                  >{{ item.Descuento }}%</span
                >
              </div>
            </div>

            <div class="quantity-controls p-2 rounded bg-light">
              <div
                class="d-flex align-items-center justify-content-between flex-wrap gap-2"
              >
                <div class="d-flex align-items-center">
                  <label class="me-2 fw-bold mb-0">Cantidad:</label>
                  <input
                    type="number"
                    min="0"
                    v-model.number="item.cantidad"
                    @change="actualizarCantidad(index)"
                    class="form-control"
                    style="width: 80px"
                  />
                </div>
                <div class="ms-2">
                  <strong>A recibir:</strong>
                  <span class="badge bg-success">{{
                    mostarCantidadTotal(item.Promocion, item.cantidad)
                  }}</span>
                </div>
              </div>
            </div>

            <div class="d-grid mt-3">
              <button
                class="btn btn-outline-danger"
                @click="eliminarProducto(index)"
              >
                <i class="fas fa-trash-alt me-2"></i>Eliminar producto
              </button>
            </div>
          </div>
        </div>
      </div>

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
import { ref, onMounted, onUnmounted } from "vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import alertify from "alertifyjs";

import { useToast } from "vue-toastification";
const toast = useToast();

const carrito = ref([]);
const totalCarrito = ref(0);
const isMobile = ref(false);
const isExporting = ref(false);

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
  // Configuración global de alertify para mejorar visibilidad en móviles
  try {
    // Configuración del notificador
    alertify.set("notifier", {
      position: "top-center",
      delay: 3,
      closeButton: true,
      clickToClose: true,
      movable: false,
    });

    // Configuración de diálogos
    alertify.set("dialogs", {
      modal: true,
      movable: false,
      resizable: false,
      maximizable: false,
      pinnable: false,
      closable: true,
      closableByDimmer: true,
      preventBodyShift: true,
      transition: "pulse",
      autoReset: true,
    });

    // Personalizar botones
    alertify.defaults.glossary.ok = "Aceptar";
    alertify.defaults.glossary.cancel = "Cancelar";
  } catch (e) {
    console.warn("alertify configuración no aplicada:", e);
  }

  // detectar móvil por media query para renderizar tarjetas
  const mq = window.matchMedia("(max-width: 767px)");
  const setMobile = (ev) => {
    isMobile.value = ev.matches !== undefined ? ev.matches : mq.matches;
  };
  setMobile(mq);
  try {
    mq.addEventListener("change", setMobile);
  } catch (e) {
    // fallback para navegadores antiguos
    mq.addListener(setMobile);
  }
  // limpiar listener al desmontar
  onUnmounted(() => {
    try {
      mq.removeEventListener("change", setMobile);
    } catch (e) {
      mq.removeListener(setMobile);
    }
  });
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
  // Confirmar antes de eliminar
  try {
    alertify.confirm(
      "Confirmar eliminación",
      "¿Desea eliminar este producto del carrito?",
      function () {
        carrito.value.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito.value));
        calcularTotal();
        calcularTotalesDesglosados();
        toast.success("Producto eliminado");
      },
      function () {
        /* cancelado */
      }
    );
  } catch (e) {
    // si alertify no está disponible, proceder directamente
    carrito.value.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito.value));
    calcularTotal();
    calcularTotalesDesglosados();
  }
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
    alertify.alert(`❌ Faltan campos obligatorios: ${faltantes.join(", ")}`);

    return;
  }

  isExporting.value = true;
  try {
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet(pedido.value.Tipo);

    // Encabezado del pedido
    hoja.addRow([`Datos ${pedido.value.Tipo}`]);
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
        const { promo, total } = calcularPromocion(
          item.Promocion,
          item.cantidad
        );
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

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const nombreArchivo = `${pedido.value.Tipo}_Cliente_${pedido.value.Nombre}_ciudad_${pedido.value.Ciudad}_Cliente_${pedido.value.Fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
    toast.success("Excel generado correctamente");
  } catch (err) {
    console.error("Error generando Excel:", err);
    toast.error("Ocurrió un error al generar el Excel");
  } finally {
    isExporting.value = false;
  }
};

const vaciarCarrito = async () => {
  try {
    alertify.confirm(
      "Vaciar carrito",
      "¿Está seguro que desea vaciar todo el carrito? Esta acción no se puede deshacer.",
      function () {
        localStorage.removeItem("carrito");
        carrito.value = [];
        calcularTotal();
        calcularTotalesDesglosados();
        toast.success("Carrito vaciado");
      },
      function () {
        /* cancelado */
      }
    );
  } catch (e) {
    localStorage.removeItem("carrito");
    carrito.value = [];
  }
};

const descarTablaConPromocion = async () => {
  if (!pedido.value.Nombre.trim()) {
    alertify.alert(
      "Campo obligatorio",
      "❌ Por favor, ingrese el nombre del cliente antes de exportar"
    );
    return;
  }

  isExporting.value = true;
  let container = null;

  try {
    const fecha = new Date().toISOString().split("T")[0];
    const nombreCliente = pedido.value.Nombre.trim().replace(/\s+/g, "_");
    const finalWidth = 500;

    container = document.createElement("div");
    container.style.width = finalWidth + "px";
    container.style.padding = "5px";
    container.style.backgroundColor = "white";
    container.style.boxSizing = "border-box";
    container.style.fontFamily = "'Segoe UI', Roboto, Arial, sans-serif";
    container.style.margin = "0 auto";
    container.style.color = "#222";
    container.style.border = "1px solid #e6e6e6";
    container.style.fontSize = "14px";
    container.style.lineHeight = "1.25";
    container.style.setProperty("-webkit-font-smoothing", "antialiased");
    container.style.setProperty("text-rendering", "optimizeLegibility");

    const titulo = document.createElement("h2");
    titulo.textContent = `Lista productos MH - ${pedido.value.Nombre} - ${fecha}`;
    titulo.style.textAlign = "center";
    titulo.style.margin = "10px 0 12px 0";
    titulo.style.fontSize = "14px";
    titulo.style.color = "#333";
    container.appendChild(titulo);

    const tabla = document.createElement("table");
    tabla.style.borderCollapse = "collapse";
    tabla.style.width = "100%";
    tabla.style.tableLayout = "fixed";

    const colgroup = document.createElement("colgroup");
    [40, 15, 25, 20].forEach((pct) => {
      const col = document.createElement("col");
      col.style.width = pct + "%";
      colgroup.appendChild(col);
    });
    tabla.appendChild(colgroup);

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr style="background-color: #4CAF50; color: white;">
        <th style="padding: 6px; border: 1px solid #ddd; font-size:12px; text-align:center;">Producto</th>
        <th style="padding: 6px; border: 1px solid #ddd; font-size:12px; text-align:center;">Precio</th>
        <th style="padding: 6px; border: 1px solid #ddd; font-size:12px; text-align:center;">Promoción</th>
        <th style="padding: 6px; border: 1px solid #ddd; font-size:12px; text-align:center;">Descuento %</th>
      </tr>
    `;
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    carrito.value.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "white";

      const nombre = item.NombreProducto || "";
      const precio =
        item.PrecioFarmacia !== undefined && item.PrecioFarmacia !== null
          ? "$" + Number(item.PrecioFarmacia).toFixed(2)
          : "N/D";
      const promo = item.Promocion || "";
      let descuento = "";
      if (item.Descuento !== undefined && item.Descuento !== null) {
        const dnum = Number(item.Descuento);
        if (!isNaN(dnum) && dnum !== 0) {
          descuento = String(dnum) + " %";
        }
      }

      tr.innerHTML = `
        <td style="padding: 3px; border: 1px solid #ddd; font-size:12px; text-align:left; word-break:break-word;">${nombre}</td>
        <td style="padding: 3px; border: 1px solid #ddd; font-size:12px; text-align:center;">${precio}</td>
        <td style="padding: 3px; border: 1px solid #ddd; font-size:12px; text-align:center; word-break:break-word;">${promo}</td>
        <td style="padding: 3px; border: 1px solid #ddd; font-size:12px; text-align:center;">${descuento}</td>
      `;
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    container.appendChild(tabla);

    container.style.position = "fixed";
    container.style.left = "50%";
    container.style.top = "-9999px";
    container.style.transform = "translateX(-50%)";
    document.body.appendChild(container);

    await new Promise((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, 80))
    );
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }

    const html2canvas = (await import("html2canvas")).default;
    const scaleCapture = Math.min(3, window.devicePixelRatio || 1);
    const canvas = await html2canvas(container, {
      backgroundColor: "white",
      scale: scaleCapture,
      useCORS: true,
      logging: false,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const filename = `lista_precios_MH_cliente_${nombreCliente}_${fecha}.png`;
        saveAs(blob, filename);
        toast.success("Imagen descargada correctamente");
      } else {
        toast.error("No se pudo generar la imagen");
      }
    }, "image/png");
  } catch (err) {
    console.error("Error generando imagen:", err);
    toast.error(
      "No se pudo generar la imagen. Intente nuevamente o use Exportar Excel."
    );
  } finally {
    try {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    } catch (e) {}
    isExporting.value = false;
  }
};
</script>

<style scoped>
.alertify-notifier {
  z-index: 9999 !important;
}

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
    /* position: relative; */
    padding-left: 0%;
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

/* Spinner overlay durante export */
.export-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  z-index: 2147483646;
}
.export-spinner {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(0, 0, 0, 0.08);
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.export-text {
  color: #333;
  font-weight: 600;
}

/* Estilos de la tabla */
.table-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.tableProductos {
  width: 100% !important;
  margin: 0 !important;
  border-collapse: collapse;
}

.tableProductos th,
.tableProductos td {
  padding: 0.5rem !important;
}

/* Mobile card styles */
.mobile-cards {
  padding: 0.5rem;
}

.mobile-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mobile-card:active {
  transform: scale(0.98);
}

.mobile-card .card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.mobile-card .card-body {
  padding: 1rem;
}

.mobile-card .product-info {
  flex: 1;
  min-width: 0;
}

.mobile-card .price-info {
  text-align: right;
  margin-left: 1rem;
}

.mobile-card .promo-info {
  border-left: 4px solid #0d6efd;
}

.mobile-card .quantity-controls {
  border-radius: 8px;
}

.mobile-card input[type="number"] {
  border-radius: 6px;
  border: 2px solid #dee2e6;
  transition: border-color 0.2s;
}

.mobile-card input[type="number"]:focus {
  border-color: #0d6efd;
  box-shadow: none;
}

.mobile-card .badge {
  font-weight: 500;
  padding: 0.5em 0.8em;
}

/* Mejoras responsivas */
@media (max-width: 360px) {
  .mobile-card .price-info {
    margin-left: 0.5rem;
  }

  .mobile-card .card-body {
    padding: 0.75rem;
  }

  .mobile-card .quantity-controls .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
}
</style>
