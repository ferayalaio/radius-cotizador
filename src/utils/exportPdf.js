import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmtUSD, fmtPct } from './pricing'

export function exportPdf(rows, params) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const blue = [15, 40, 80]
  const orange = [255, 140, 0]
  const lightBlue = [235, 240, 250]

  // Header bar
  doc.setFillColor(...blue)
  doc.rect(0, 0, 297, 22, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RADIUS  |  US Nearshore Staffing', 14, 10)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Technology Consulting — Staff Augmentation', 14, 16)

  // Quotation title
  doc.setTextColor(...blue)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Rate Card', 14, 30)

  // Params box
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.text(`Generated: ${date}`, 14, 36)
  doc.text(
    `Exchange rate: MXN ${params.tipoCambio}  |  Discount vs. market: ${(params.descuento * 100).toFixed(0)}%  |  Hours/month: ${params.horasMes}`,
    14, 41,
  )

  const hasEstimated = rows.some(r => r.es_estimado)
  if (hasEstimated) {
    doc.setTextColor(180, 90, 0)
    doc.text('⚠  Rows marked with ⚠ have estimated market rates — confirm before sending.', 14, 46)
  }

  const tableTop = hasEstimated ? 50 : 46

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
      // Grand total row
      [
        { content: 'TOTAL / MONTH', colSpan: 5, styles: { fontStyle: 'bold', fillColor: blue, textColor: [255, 255, 255] } },
        { content: fmtUSD(grandTotal, 0), styles: { fontStyle: 'bold', halign: 'right', fillColor: blue, textColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: blue } },
      ],
    ],
    headStyles: {
      fillColor: blue,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: lightBlue },
    didParseCell(data) {
      if (data.section === 'body' && data.row.index < rows.length) {
        const row = rows[data.row.index]
        if (row?.ajustadoPorPiso) {
          if (data.column.index === 3 || data.column.index === 4 || data.column.index === 5) {
            data.cell.styles.textColor = orange
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

  // Footer
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
