// export const calcularPromocionYTotales = (cantidad, promocion) => {
//   if (!promocion || !promocion.includes("+")) {
//     return { promo: 0, total: cantidad, detalle: [] };
//   }

//   const promociones = promocion
//     .split(",")
//     .map((p) => p.trim())
//     .map((p) => {
//       const [baseStr, extraStr] = p.split("+");
//       const base = parseInt(baseStr);
//       const extra = parseInt(extraStr);
//       return { base, extra, promo: p };
//     })
//     .filter(
//       ({ base, extra }) =>
//         !isNaN(base) && !isNaN(extra) && base > 0 && extra >= 0
//     )
//     .sort((a, b) => b.extra / b.base - a.extra / a.base); // eficiencia descendente

//   let restante = cantidad;
//   let totalPromo = 0;
//   const detalle = [];

//   for (const { base, extra, promo } of promociones) {
//     const veces = Math.floor(restante / base);
//     if (veces > 0) {
//       const unidadesPromo = veces * extra;
//       totalPromo += unidadesPromo;
//       restante -= veces * base;
//       detalle.push({ promo, veces, unidadesPromo });
//     }
//   }
//   console.log("totalPromo:", totalPromo);
//   console.log("total:", cantidad + totalPromo);
//   console.log("detalle:", detalle);
//   console.log("cantidad:", cantidad);

//   return {
//     promo: totalPromo,
//     total: cantidad + totalPromo,
//     detalle,
//     cantidad,
//   };
// };

export const calcularPromocionYTotales = (cantidad, promocionStr) => {
  if (!promocionStr || !promocionStr.includes("+")) {
    return { promo: 0, total: cantidad, detalle: [], combinacion: [] };
  }

  // Convertir el string de promociones a objetos { base, extra }
  const promociones = promocionStr
    .split(/[, ]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [base, extra] = p.split("+").map(Number);
      return { base, extra, promo: p };
    })
    .filter(({ base, extra }) => !isNaN(base) && !isNaN(extra) && base > 0);

  let mejor = { promo: 0, total: cantidad, detalle: [], combinacion: [] };

  // 🔁 Recursivo para probar todas las combinaciones posibles
  function probar(restante, index, detalleActual, promoTotal) {
    if (index >= promociones.length || restante <= 0) {
      if (promoTotal > mejor.promo) {
        mejor = {
          promo: promoTotal,
          total: cantidad + promoTotal,
          detalle: [...detalleActual],
        };
      }
      return;
    }

    const { base, extra, promo } = promociones[index];
    const maxVeces = Math.floor(restante / base);

    // probar usar la promoción 0, 1, 2... veces
    for (let veces = maxVeces; veces >= 0; veces--) {
      const nuevoDetalle = [...detalleActual];
      const nuevasGratis = veces * extra;
      const nuevoRestante = restante - veces * base;

      if (veces > 0) {
        nuevoDetalle.push({
          promo,
          veces,
          unidadesPromo: nuevasGratis,
          unidadesPagadas: veces * base,
        });
      }

      probar(nuevoRestante, index + 1, nuevoDetalle, promoTotal + nuevasGratis);
    }
  }

  probar(cantidad, 0, [], 0);
  console.log("mejor:", mejor);
  return mejor;
};

export const calcularPrecioProductoCantidad = (cantidad, PrecioFarmacia) => {
  console.log("cantidad:", cantidad);
  console.log("PrecioFarmacia:", PrecioFarmacia);

  let precioTotal = cantidad * PrecioFarmacia;
  return precioTotal;
};

