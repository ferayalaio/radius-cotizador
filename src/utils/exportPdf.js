import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmtUSD, fmtPct } from './pricing'
import logoUrl from '../assets/radius_logo.jpeg'

function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg'))
    }
    img.src = url
  })
}

export async function exportPdf(rows, params) {
  const logoBase64 = await loadImageAsBase64(logoUrl)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const dark = [28, 28, 28]
  const red = [255, 27, 55]
  const lightGray = [245, 243, 240]

  // Header bar
  doc.setFillColor(...dark)
  doc.rect(0, 0, 297, 26, 'F')

  // Red accent strip
  doc.setFillColor(...red)
  doc.rect(0, 26, 297, 2, 'F')

  // Logo (square, fits inside header)
  doc.addImage(logoBase64, 'JPEG', 14, 3, 20, 20)

  // Company name + subtitle
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('Radius Tech', 38, 12)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  doc.text('US Nearshore Staffing  ·  Technology Consulting', 38, 18)

  // Date top-right
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.text(date, 283, 12, { align: 'right' })

  // Section title
  doc.setTextColor(...dark)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Rate Card', 14, 36)

  // Params line
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Exchange rate: MXN ${params.tipoCambio}  |  Discount vs. market: ${(params.descuento * 100).toFixed(0)}%  |  Hours/month: ${params.horasMes}`,
    14, 42,
  )

  const hasEstimated = rows.some(r => r.es_estimado)
  if (hasEstimated) {
    doc.setTextColor(180, 90, 0)
    doc.text('⚠  Rows marked with ⚠ have estimated market rates — confirm before sending.', 14, 47)
  }

  const tableTop = hasEstimated ? 51 : 47
  const grandTotal = rows.reduce((sum, r) => sum + r.precioVentaMes * (r.qty ?? 1), 0)

  autoTable(doc, {
    startY: tableTop,
    head: [[
      'Role', 'Level',
      'Qty', 'Sell USD/hr', 'Sell USD/mo', 'Total USD/mo', 'Margin %',
    ]],
    body: [
      ...rows.map(r => [
        r.es_estimado ? `${r.rol_comercial_us} ⚠` : r.rol_comercial_us,
        r.nivel,
        r.qty ?? 1,
        fmtUSD(r.precioVentaHr),
        fmtUSD(r.precioVentaMes, 0),
        fmtUSD(r.precioVentaMes * (r.qty ?? 1), 0),
        fmtPct(r.margen),
      ]),
      [
        { content: 'TOTAL / MONTH', colSpan: 5, styles: { fontStyle: 'bold', fillColor: dark, textColor: [255, 255, 255] } },
        { content: fmtUSD(grandTotal, 0), styles: { fontStyle: 'bold', halign: 'right', fillColor: dark, textColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: dark } },
      ],
    ],
    headStyles: {
      fillColor: dark,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: [28, 28, 28] },
    alternateRowStyles: { fillColor: lightGray },
    didParseCell(data) {
      if (data.section === 'body' && data.row.index < rows.length) {
        const row = rows[data.row.index]
        if (row?.ajustadoPorPiso) {
          if (data.column.index === 3 || data.column.index === 4 || data.column.index === 5) {
            data.cell.styles.textColor = red
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    },
    margin: { left: 14, right: 14 },
    styles: { overflow: 'linebreak', cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 18 },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
    },
  })

  // Footer with logo tint on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Radius Technology Consulting — Confidential  |  Page ${i} of ${pageCount}`,
      148, 205, { align: 'center' },
    )
  }

  doc.save(`Radius_RateCard_${Date.now()}.pdf`)
}
