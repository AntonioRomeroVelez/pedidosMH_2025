import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Cargar una imagen desde /public/
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// =======================
// 🔹 FUNCIÓN PARA GENERAR PDF
// =======================
// export const generarPDFConPromocion = async (pedido, carrito, toast) => {
//   if (!pedido.Nombre.trim()) {
//     alert("❌ Ingrese el nombre del cliente");
//     return;
//   }

//   try {
//     const fecha = new Date().toISOString().split("T")[0];
//     const nombreCliente = pedido.Nombre.trim().replace(/\s+/g, "_");

//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "pt",
//       format: "a4",
//     });

//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     // 🔸 Configuración de encabezado
//     const logoUrl = "/logo_mh.png";
//     const logo = await loadImage(logoUrl);

//     const logoSize = 40; // ajustar tamaño aquí
//     const headerHeight = 70;

//     const drawHeader = () => {
//       pdf.addImage(logo, "PNG", 20, 10, logoSize, logoSize);

//       pdf.setFontSize(14);
//       pdf.text(`Lista Productos MH`, pageWidth / 2, 20, { align: "center" });

//       pdf.setFontSize(12);
//       pdf.text(`Cliente: ${pedido.Nombre}`, pageWidth / 2, 35, {
//         align: "center",
//       });
//       pdf.setFontSize(10);
//       pdf.text(`Fecha: ${fecha}`, pageWidth / 2, 50, { align: "center" });
//     };

//     drawHeader();

//     // 🔸 Datos tabla
//     const columnas = [
//       "Producto",
//       "Marca",
//       "Presentación",
//       "Precio",
//       "Promoción",
//       "Descuento %",
//     ];

//     const filas = carrito.map((item) => [
//       item.NombreProducto || "",
//       item.Marca || "",
//       item.Presentacion || "",
//       item.PrecioFarmacia != null
//         ? "$" + Number(item.PrecioFarmacia).toFixed(2)
//         : "N/D",
//       item.Promocion || "",
//       item.Descuento && !isNaN(Number(item.Descuento))
//         ? item.Descuento + " %"
//         : "",
//     ]);

//     // 🔸 Tabla multipágina
//     autoTable(pdf, {
//       startY: headerHeight,
//       margin: { top: headerHeight + 15 },

//       head: [columnas],
//       body: filas,

//       theme: "grid",
//       headStyles: {
//         fillColor: [21, 28, 166],
//         textColor: "#fff",
//         fontSize: 12,
//       },
//       bodyStyles: { fontSize: 10 },
//       styles: {
//         cellPadding: 3,
//         halign: "center",
//         valign: "middle",
//       },
//       columnStyles: {
//         0: { halign: "left" }, // Producto
//       },

//       didDrawPage: () => {
//         const page = pdf.internal.getNumberOfPages();

//         pdf.setFontSize(10);
//         pdf.text(`Página ${page}`, pageWidth - 50, pageHeight - 20, {
//           align: "right",
//         });

//         drawHeader();
//       },
//     });

//     pdf.save(`Lista_MH_${nombreCliente}_${fecha}.pdf`);
//     toast.success("PDF generado correctamente");
//   } catch (e) {
//     console.error(e);
//     toast.error("Error al generar PDF");
//   }
// };

export const generarPDFConPromocion = async (pedido, carrito, toast) => {
  if (!pedido.Nombre.trim()) {
    alert("❌ Ingrese el nombre del cliente");
    return;
  }

  try {
    const fecha = new Date().toISOString().split("T")[0];
    const nombreCliente = pedido.Nombre.trim().replace(/\s+/g, "_");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      precision: 16, // 🔹 mejora la nitidez de texto y líneas
    });

    pdf.setFont("helvetica", "normal"); // 🔹 fuente más nítida y clara

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ============================
    // 🔹 CABECERA
    // ============================
    const logoUrl = "/logo_mh.png";
    const logo = await loadImage(logoUrl);

    const logoSize = 40;
    const headerHeight = 50;

    const drawHeader = () => {
      pdf.addImage(logo, "PNG", 20, 10, logoSize, logoSize);

      pdf.setFontSize(14);
      pdf.setTextColor(21, 28, 166);
      pdf.text(`Lista productos MH`, pageWidth / 2, 22, { align: "center" });

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Cliente: ${pedido.Nombre}`, pageWidth / 2, 38, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.text(`Fecha: ${fecha}`, pageWidth / 2, 54, { align: "center" });
    };

    drawHeader();

    // ============================
    // 🔹 DATOS TABLA
    // ============================
    const columnas = [
      "Producto",
      "Marca",
      "Presentación",
      "Precio",
      "Promoción",
      "Descuento %",
    ];

    const filas = carrito.map((item) => [
      item.NombreProducto || "",
      item.Marca || "",
      item.Presentacion || "",
      item.PrecioFarmacia != null
        ? "$" + Number(item.PrecioFarmacia).toFixed(2)
        : "N/D",
      item.Promocion || "",
      item.Descuento && !isNaN(Number(item.Descuento))
        ? item.Descuento + " %"
        : "",
    ]);

    // ============================
    // 🔹 TABLA AUTO-AJUSTADA + NÍTIDA
    // ============================
    autoTable(pdf, {
      startY: headerHeight + 10,

      margin: { top: headerHeight + 15, left: 10, right: 10 },

      head: [columnas],
      body: filas,

      theme: "grid",

      tableWidth: "auto",
      styles: {
        cellPadding: 3,
        overflow: "linebreak",
        fontSize: 10,
        font: "helvetica",
        lineColor: 180,
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
      },

      headStyles: {
        fillColor: [21, 28, 166],
        textColor: "#fff",
        fontSize: 11,
        fontStyle: "bold",
      },

      columnStyles: {
        0: { halign: "left", cellWidth: "auto", minCellWidth: 60 }, // Producto
        1: { cellWidth: "auto", minCellWidth: 40 }, // Marca
        2: { cellWidth: "auto", minCellWidth: 60 }, // Presentación
        3: { cellWidth: 50 }, // Precio
        4: { cellWidth: "auto", minCellWidth: 50 }, // Promoción
        5: { cellWidth: 50 }, // Descuento
      },

      didDrawPage: () => {
        const page = pdf.internal.getNumberOfPages();

        pdf.setFontSize(10);
        pdf.text(`Página ${page}`, pageWidth - 40, pageHeight - 20);

        drawHeader();
      },
    });

    pdf.save(`Lista_MH_${nombreCliente}_${fecha}.pdf`);
    toast.success("PDF generado correctamente");
  } catch (e) {
    console.error(e);
    toast.error("Error al generar PDF");
  }
};
