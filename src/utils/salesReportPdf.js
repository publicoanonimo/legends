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

function makePdf(lines) {
  const wrapped = lines.flatMap((line) => {
    const value = String(line)
    if (value.length <= 92) return [value]
    const chunks = []
    for (let i = 0; i < value.length; i += 88) chunks.push(value.slice(i, i + 88))
    return chunks
  })
  const pages = []
  for (let i = 0; i < wrapped.length; i += 52) pages.push(wrapped.slice(i, i + 52))
  if (!pages.length) pages.push(['Reporte de caja'])

  const objects = []
  const pageIds = pages.map((_, index) => 4 + index * 2)
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'

  pages.forEach((page, index) => {
    const pageId = pageIds[index]
    const contentId = pageId + 1
    const commands = ['BT', '/F1 10 Tf', '50 790 Td', '14 TL']
    page.forEach((line) => commands.push(`(${cleanPdfText(line)}) Tj`, 'T*'))
    commands.push('ET')
    const content = commands.join('\n')
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
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

export function downloadSalesReportPdf(lines) {
  const blob = makePdf(lines)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-caja-${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
