function cleanPdfText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[·•]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

const color = (rgb) => rgb.map((channel) => Number(channel).toFixed(3)).join(' ')
const text = (value, x, y, size = 9, font = 'F1', tint = [0.18, 0.16, 0.18]) =>
  `BT /${font} ${size} Tf ${color(tint)} rg 1 0 0 1 ${x} ${y} Tm (${cleanPdfText(value)}) Tj ET`
const rect = (x, y, width, height, fill, stroke = null) => {
  const draw = [`q ${color(fill)} rg`, `${x} ${y} ${width} ${height} re f`]
  if (stroke) draw.push(`${color(stroke)} RG`, `${x} ${y} ${width} ${height} re S`)
  draw.push('Q')
  return draw.join('\n')
}

function wrap(value, max = 104) {
  const words = cleanPdfText(value).split(/\s+/)
  const lines = []
  let current = ''
  words.forEach((word) => {
    if (current && `${current} ${word}`.length > max) { lines.push(current); current = word }
    else current = current ? `${current} ${word}` : word
  })
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function makePdf(report) {
  const pages = []
  let commands = []
  let pageNumber = 0
  let y = 0
  const startPage = (first = false) => {
    pageNumber += 1
    commands = [rect(0, 0, 595, 842, [1, 1, 1]), rect(0, 786, 595, 56, [0.12, 0.07, 0.09]), rect(0, 786, 595, 4, [0.78, 0.12, 0.20])]
    commands.push(text(first ? report.title : 'REPORTE DE CAJA E INVENTARIO', 42, 817, 16, 'F2', [1, 1, 1]))
    commands.push(text(first ? `Generado: ${report.generated}` : report.generated, 42, 799, 8, 'F1', [0.88, 0.84, 0.85]))
    y = first ? 766 : 765
    if (first && report.summary?.length) {
      commands.push(text('RESUMEN GENERAL', 42, y, 10, 'F2', [0.28, 0.22, 0.24]))
      y -= 14
      report.summary.slice(0, 4).forEach((item, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = 42 + col * 260
        const cardY = y - row * 55 - 42
        commands.push(rect(x, cardY, 250, 48, [0.97, 0.95, 0.95], [0.90, 0.86, 0.87]))
        commands.push(rect(x, cardY, 4, 48, item.color || [0.78, 0.12, 0.20]))
        commands.push(text(item.label, x + 14, cardY + 30, 8, 'F1', [0.40, 0.36, 0.37]))
        commands.push(text(item.value, x + 14, cardY + 12, 12, 'F2', item.color || [0.18, 0.16, 0.18]))
      })
      y -= Math.ceil(Math.min(report.summary.length, 4) / 2) * 55 + 8
    }
    pages.push(commands)
  }
  const nextPage = () => { startPage(false) }
  startPage(true)

  report.sections.forEach((section) => {
    if (y < 75) nextPage()
    commands.push(rect(42, y - 18, 511, 22, [0.96, 0.93, 0.94]))
    commands.push(text(section.title, 51, y - 11, 9, 'F2', [0.55, 0.10, 0.16]))
    y -= 30
    if (!section.rows.length) section.rows = ['Sin registros.']
    section.rows.forEach((row) => {
      const rowLines = wrap(row)
      if (y - rowLines.length * 12 < 45) {
        nextPage()
        commands.push(rect(42, y - 18, 511, 22, [0.96, 0.93, 0.94]))
        commands.push(text(`${section.title} (continuacion)`, 51, y - 11, 9, 'F2', [0.55, 0.10, 0.16]))
        y -= 30
      }
      rowLines.forEach((line, index) => {
        commands.push(text(line, 50, y, 8, 'F1', [0.20, 0.18, 0.19]))
        y -= 12
      })
      y -= 3
    })
    y -= 8
  })

  const finalPages = pages.map((pageCommands, index) => {
    pageCommands.push(rect(42, 34, 511, 0.6, [0.88, 0.85, 0.86]))
    pageCommands.push(text('LEGENDS - REPORTE INTERNO', 42, 20, 7, 'F1', [0.48, 0.44, 0.45]))
    pageCommands.push(text(`Pagina ${index + 1} de ${pages.length}`, 492, 20, 7, 'F1', [0.48, 0.44, 0.45]))
    return pageCommands.join('\n')
  })

  const objects = []
  const pageIds = finalPages.map((_, index) => 5 + index * 2)
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${finalPages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  finalPages.forEach((content, index) => {
    const pageId = pageIds[index]
    const contentId = pageId + 1
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  })

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id += 1) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadSalesReportPdf(report) {
  const url = URL.createObjectURL(makePdf(report))
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-caja-${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
