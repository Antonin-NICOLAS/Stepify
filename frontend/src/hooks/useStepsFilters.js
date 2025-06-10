import { useState, useEffect, useMemo } from 'react'

export const useStepsFilters = (
  stepEntries,
  viewMode,
  selectedDate,
  dateRange
) => {
  const [filters, setFilters] = useState({
    mode: 'all',
    minSteps: 0,
    maxSteps: Number.POSITIVE_INFINITY,
  })

  const filteredEntries = useMemo(() => {
    let filtered = [...(stepEntries || [])]

    // Filter by date range
    if (viewMode === 'day') {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dayString = `${year}-${month}-${day}`

      filtered = filtered.filter((entry) => entry.day === dayString)
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate >= startOfWeek && entryDate <= endOfWeek
      })
    } else if (viewMode === 'month') {
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date)
        return (
          entryDate.getFullYear() === year && entryDate.getMonth() === month
        )
      })
    } else if (viewMode === 'custom') {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate >= dateRange.start && entryDate <= dateRange.end
      })
    }

    // Apply additional filters
    if (filters.mode !== 'all') {
      filtered = filtered.filter((entry) => entry.dominantMode === filters.mode)
    }

    filtered = filtered.filter(
      (entry) =>
        entry.totalSteps >= filters.minSteps &&
        entry.totalSteps <= filters.maxSteps
    )

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [stepEntries, viewMode, selectedDate, dateRange, filters])

  return { filteredEntries, filters, setFilters }
}
