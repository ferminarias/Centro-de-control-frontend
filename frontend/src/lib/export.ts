/**
 * Utilidades para exportar datos a Excel
 */
import * as XLSX from "xlsx"

interface ExportColumn {
  key: string
  header: string
  format?: (value: any) => string
}

interface ExportOptions {
  filename: string
  sheetName?: string
}

/**
 * Exporta datos a archivo Excel (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  // Transformar datos según las columnas definidas
  const formattedData = data.map((row) => {
    const formattedRow: Record<string, string> = {}
    columns.forEach((col) => {
      const value = row[col.key]
      formattedRow[col.header] = col.format ? col.format(value) : String(value ?? "")
    })
    return formattedRow
  })

  // Crear worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData)

  // Ajustar anchos de columna
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.header.length, 15),
  }))
  worksheet["!cols"] = colWidths

  // Crear workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || "Datos")

  // Generar archivo
  const fileName = `${options.filename}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

/**
 * Exporta reporte de bases a Excel
 */
export function exportReporteBasesToExcel(
  data: {
    lead_nombre: string
    lead_telefono: string
    base_nombre: string
    campania_nombre: string
    estado: string
    agente_nombre: string | null
    tipificacion: string | null
    subtipificacion: string | null
    intentos: number
    completed_at: string | null
  }[],
  fileName: string
) {
  const columns: ExportColumn[] = [
    { key: "lead_nombre", header: "Nombre Lead" },
    { key: "lead_telefono", header: "Teléfono" },
    { key: "base_nombre", header: "Base de Datos" },
    { key: "campania_nombre", header: "Campaña" },
    { key: "estado", header: "Estado" },
    { key: "agente_nombre", header: "Agente" },
    { key: "tipificacion", header: "Tipificación" },
    { key: "subtipificacion", header: "Subtipificación" },
    { key: "intentos", header: "Intentos" },
    {
      key: "completed_at",
      header: "Fecha Gestión",
      format: (value) => (value ? new Date(value).toLocaleString("es-ES") : "-"),
    },
  ]

  exportToExcel(data, columns, {
    filename: fileName,
    sheetName: "Gestión de Bases",
  })
}

/**
 * Exporta métricas de agentes a Excel
 */
export function exportMetricasAgentesToExcel(
  data: {
    nombre: string
    email: string
    tiempo: { conectado_horas: number; pausado_minutos: number }
    productividad: { fichas_gestionadas: number; fichas_por_hora: number }
  }[],
  fileName: string
) {
  const columns: ExportColumn[] = [
    { key: "nombre", header: "Agente" },
    { key: "email", header: "Email" },
    {
      key: "tiempo",
      header: "Horas Conectado",
      format: (value) => String(value?.conectado_horas?.toFixed(1) ?? "0"),
    },
    {
      key: "tiempo",
      header: "Minutos Pausado",
      format: (value) => String(value?.pausado_minutos?.toFixed(0) ?? "0"),
    },
    {
      key: "productividad",
      header: "Fichas Gestionadas",
      format: (value) => String(value?.fichas_gestionadas ?? "0"),
    },
    {
      key: "productividad",
      header: "Fichas/Hora",
      format: (value) => String(value?.fichas_por_hora?.toFixed(2) ?? "0"),
    },
  ]

  // Transformar datos para exportación
  const exportData = data.map((agente) => ({
    ...agente,
    tiempo: agente.tiempo,
    productividad: agente.productividad,
  }))

  exportToExcel(exportData, columns, {
    filename: fileName,
    sheetName: "Métricas Agentes",
  })
}
