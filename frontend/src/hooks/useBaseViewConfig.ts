import { useState, useCallback } from "react"

export interface BaseViewConfig {
  columns: string[]
}

const STORAGE_PREFIX = "cc_base_view_"

function loadConfig(baseId: string): BaseViewConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + baseId)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveConfig(baseId: string, config: BaseViewConfig) {
  localStorage.setItem(STORAGE_PREFIX + baseId, JSON.stringify(config))
}

export function useBaseViewConfig(baseId: string, allColumns: string[]) {
  const [config, setConfigState] = useState<BaseViewConfig>(() => {
    const saved = loadConfig(baseId)
    if (saved && saved.columns.length > 0) return saved
    return { columns: allColumns }
  })

  // Sync when allColumns changes (e.g. fields loaded after mount)
  const visibleColumns = config.columns.filter((c) => allColumns.includes(c))
  // If saved config is empty or all columns got removed, show all
  const effectiveColumns = visibleColumns.length > 0 ? visibleColumns : allColumns

  const setColumns = useCallback(
    (columns: string[]) => {
      const newConfig = { columns }
      setConfigState(newConfig)
      saveConfig(baseId, newConfig)
    },
    [baseId]
  )

  const toggleColumn = useCallback(
    (col: string) => {
      const current = effectiveColumns
      const next = current.includes(col)
        ? current.filter((c) => c !== col)
        : [...current, col]
      // Don't allow removing all columns
      if (next.length === 0) return
      setColumns(next)
    },
    [effectiveColumns, setColumns]
  )

  return {
    visibleColumns: effectiveColumns,
    allColumns,
    setColumns,
    toggleColumn,
  }
}
