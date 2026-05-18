export function calcRow(perfil, { tipoCambio, descuento, horasMes }) {
  const costoUsdHr = perfil.costo_mxn_mes / tipoCambio / horasMes
  const tarifaMercado = perfil.tarifa_mercado_usd_hr
  const precioBase = tarifaMercado * (1 - descuento)
  const pisoCosto = costoUsdHr / 0.60
  const ajustadoPorPiso = pisoCosto > precioBase
  const precioVentaHr = Math.max(precioBase, pisoCosto)
  const precioVentaMes = precioVentaHr * horasMes
  const margen = (precioVentaHr - costoUsdHr) / precioVentaHr

  return {
    ...perfil,
    costoUsdHr,
    precioVentaHr,
    precioVentaMes,
    margen,
    ajustadoPorPiso,
  }
}

export function fmtUSD(n, decimals = 2) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtPct(n) {
  return (n * 100).toFixed(1) + '%'
}
