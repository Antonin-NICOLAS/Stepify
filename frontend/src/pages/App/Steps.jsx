import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
//Hooks & context
import { useAuth } from '../../context/AuthContext'
import { useSteps } from '../../hooks/useSteps'
import { useStepsFilters } from '../../hooks/useStepsFilters'
import { useStepsStats } from '../../hooks/useStepsStats'
//Components
import DefaultHeader from '../../components/DefaultHeader'
import GlobalLoader from '../../components/GlobalLoader'
//CHARTS
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
//ICONS
import {
  Globe,
  Watch,
  Bike,
  Calendar,
  Download,
  Upload,
  Plus,
  Filter,
  Edit,
  Trash2,
  X,
  Info,
  Heart,
  Footprints,
  Spline,
  Flame,
  Clock,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
//CSS
import './Steps.css'

// Register Chart.js components
Chart.register(...registerables)

const Steps = () => {
  const { user } = useAuth()

  // State for view options
  const [viewMode, setViewMode] = useState('day')
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date(),
  })
  const [customDateRange, setCustomDateRange] = useState(false)

  // State for modals
  const [showModal, setShowModal] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(null)
  const [selectedHourIndex, setSelectedHourIndex] = useState(0)
  const now = new Date()
  const initialHour = `${now.getHours().toString().padStart(2, '0')}:00`
  const [formValues, setFormValues] = useState({
    date: '',
    time: initialHour,
    steps: '',
    distance: '',
    calories: '',
    mode: 'walk',
    activeTime: '',
  })
  const [showImportModal, setShowImportModal] = useState(false)
  const [importSource, setImportSource] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // State for chart
  const [chartMetric, setChartMetric] = useState('totalSteps')

  // State for filters
  const [showFilters, setShowFilters] = useState(false)
  const [tableFilters, setTableFilters] = useState({
    mode: 'all',
    verified: 'all',
    favorite: 'all',
    dateRange: 'all',
  })

  // Custom hooks
  const {
    stepEntries,
    fetchStepEntries,
    addStepEntry,
    updateStepEntry,
    FavoriteEntry,
    deleteStepEntry,
    importSteps,
  } = useSteps(user?._id)

  const { filteredEntries, filters, setFilters } = useStepsFilters(
    stepEntries,
    viewMode,
    selectedDate,
    dateRange,
  )

  const stats = useStepsStats(filteredEntries)
  const EntryModalRef = useRef(null)
  const ImportModalRef = useRef(null)

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
      setShowImportModal(false)
      setCurrentEntry(null)
    }
  }

  // UseEffect
  useEffect(() => {
    setIsLoading(true)
    if (user?._id) {
      fetchStepEntries()
    }
    setIsLoading(false)
  }, [user?._id, fetchStepEntries])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false)
        setShowImportModal(false)
        setCurrentEntry(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (currentEntry?.mode) {
      const match = ModeOptions.find((opt) => opt.value === currentEntry.mode)
      if (match) setSelectedMode(match)
    }
  }, [currentEntry])

  useEffect(() => {
    if (currentEntry) {
      const hourData = currentEntry.hourlyData[selectedHourIndex]
      setFormValues({
        steps: hourData.steps,
        distance: hourData.distance,
        calories: hourData.calories,
        mode: hourData.mode,
        activeTime: hourData.activeTime,
      })
      setSelectedMode(ModeOptions.find((opt) => opt.value === hourData.mode))
    }
  }, [selectedHourIndex, currentEntry])

  // select Options
  const MetricOptions = [
    { value: 'totalSteps', label: 'Pas', icon: <Footprints size={16} /> },
    { value: 'totalDistance', label: 'Distance', icon: <Spline size={16} /> },
    { value: 'totalCalories', label: 'Calories', icon: <Flame size={16} /> },
    {
      value: 'totalActiveTime',
      label: 'Temps actif',
      icon: <Clock size={16} />,
    },
  ]

  const ModeOptionsChart = [
    { value: 'all', label: 'Tous les modes', icon: <Globe size={16} /> },
    { value: 'walk', label: 'Marche', icon: <Footprints size={16} /> },
    { value: 'run', label: 'Course', icon: <Watch size={16} /> },
    { value: 'bike', label: 'Vélo', icon: <Bike size={16} /> },
  ]

  const ModeOptions = [
    { value: 'walk', label: 'Marche', icon: <Footprints size={20} /> },
    { value: 'run', label: 'Course', icon: <Watch size={16} /> },
    { value: 'bike', label: 'Vélo', icon: <Bike size={16} /> },
  ]

  const FilterModeOptions = [
    { value: 'all', label: 'Tous les modes', icon: <Globe size={16} /> },
    { value: 'walk', label: 'Marche', icon: <Footprints size={16} /> },
    { value: 'run', label: 'Course', icon: <Watch size={16} /> },
    { value: 'bike', label: 'Vélo', icon: <Bike size={16} /> },
  ]

  const VerifiedOptions = [
    { value: 'all', label: 'Tous', icon: <Globe size={16} /> },
    { value: 'verified', label: 'Vérifiés', icon: <Check size={16} /> },
    { value: 'unverified', label: 'Non vérifiés', icon: <X size={16} /> },
  ]

  const FavoriteOptions = [
    { value: 'all', label: 'Tous', icon: <Globe size={16} /> },
    { value: 'favorite', label: 'Favoris', icon: <Heart size={16} /> },
    { value: 'not-favorite', label: 'Non favoris', icon: <X size={16} /> },
  ]

  // State for select
  const [selectedMode, setSelectedMode] = useState(
    ModeOptions.find((opt) => opt.value === (currentEntry?.mode || 'walk')),
  )

  const [selectedFilterMode, setSelectedFilterMode] = useState(
    FilterModeOptions[0],
  )
  const [selectedVerified, setSelectedVerified] = useState(VerifiedOptions[0])
  const [selectedFavorite, setSelectedFavorite] = useState(FavoriteOptions[0])

  // Custom select components
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--body-color)',
      borderColor: state.isFocused ? 'var(--Couleur1)' : 'var(--Couleur2)',
      boxShadow: state.isFocused ? '0 0 0 2px var(--Couleur2)' : 'none',
      '&:hover': {
        borderColor: 'var(--Couleur1)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--body-color)',
      border: '1px solid var(--Couleur2)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--Couleur1)'
        : state.isFocused
        ? 'var(--Couleur2)'
        : 'transparent',
      color: state.isSelected ? 'white' : 'var(--Noir)',
      '&:hover': {
        backgroundColor: 'var(--Couleur2)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--Noir)',
    }),
  }

  const customSingleValue = ({ data }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {data.icon}
      {data.label}
    </div>
  )

  const customOption = (props) => {
    const { data, innerRef, innerProps, isSelected, isFocused } = props
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`metric-select__option ${
          isSelected ? 'custom-select__option--is-selected' : ''
        } ${isFocused ? 'custom-select__option--is-focused' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
        }}
      >
        {data.icon}
        {data.label}
      </div>
    )
  }

  // Filter entries based on table filters
  const getFilteredTableEntries = () => {
    let filtered = [...filteredEntries]

    // Filter by mode
    if (tableFilters.mode !== 'all') {
      filtered = filtered.filter((entry) => entry.mode === tableFilters.mode)
    }

    // Filter by verified status
    if (tableFilters.verified !== 'all') {
      filtered = filtered.filter((entry) =>
        tableFilters.verified === 'verified'
          ? entry.isVerified
          : !entry.isVerified,
      )
    }

    // Filter by favorite status
    if (tableFilters.favorite !== 'all') {
      filtered = filtered.filter((entry) =>
        tableFilters.favorite === 'favorite'
          ? entry.isFavorite
          : !entry.isFavorite,
      )
    }

    return filtered
  }

  // Helper functions
  const formatActiveTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  const formatDate = (date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })} - ${endOfWeek.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`
    } else if (viewMode === 'month') {
      return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    }

    return date.toLocaleDateString('fr-FR')
  }

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'steps':
        return 'Pas'
      case 'distance':
        return 'Distance (km)'
      case 'calories':
        return 'Calories (kcal)'
      case 'activeTime':
        return 'Temps actif'
      default:
        return metric
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'walk':
        return <Footprints size={16} />
      case 'run':
        return <Watch size={16} />
      case 'bike':
        return <Bike size={16} />
      default:
        return <Footprints size={16} />
    }
  }

  // Drag & drop
  const fileInputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setImportFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // CHART DATA
  const prepareChartData = () => {
    if (filteredEntries.length === 0) return null

    let labels = []
    let data = []

    if (viewMode === 'day') {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const targetDay = `${year}-${month}-${day}`

      const dayEntry = filteredEntries.find((entry) => entry.day === targetDay)

      if (dayEntry) {
        const hourlyData = Array(24).fill(0)
        const trimmed = chartMetric.slice(5)
        const daychartmetric =
          trimmed.charAt(0).toLowerCase() + trimmed.slice(1)

        dayEntry.hourlyData.forEach((hourData) => {
          hourlyData[hourData.hour] = hourData[daychartmetric] || 0
        })

        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
        data = hourlyData
      }
    } else if (
      viewMode === 'week' ||
      (viewMode === 'custom' && dateRange.end - dateRange.start < 8 * 86400000)
    ) {
      const dailyData = {}

      filteredEntries.forEach((entry) => {
        const day = entry.day
        if (!dailyData[day]) {
          dailyData[day] = 0
        }
        dailyData[day] += entry[chartMetric] || 0
      })

      const sortedDays = Object.keys(dailyData).sort()

      labels = sortedDays.map((day) => {
        const date = new Date(day)
        return date.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
        })
      })

      data = sortedDays.map((day) => dailyData[day])
    } else if (viewMode === 'month' || viewMode === 'custom') {
      const weeklyData = {}

      filteredEntries.forEach((entry) => {
        const date = new Date(entry.date)
        const weekNumber = getWeekNumber(date)
        const weekKey = `${date.getFullYear()}-W${weekNumber}`

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0
        }

        weeklyData[weekKey] += entry[chartMetric] || 0
      })

      const sortedWeeks = Object.keys(weeklyData).sort()

      labels = sortedWeeks.map((week) => {
        const [year, weekNum] = week.split('-W')
        return `Sem ${weekNum}`
      })

      data = sortedWeeks.map((week) => weeklyData[week])
    }

    return {
      labels,
      datasets: [
        {
          label: getMetricLabel(chartMetric),
          data,
          backgroundColor: 'rgba(74, 145, 158, 0.2)',
          borderColor: 'rgba(74, 145, 158, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  const chartData = prepareChartData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => {
            let label = getMetricLabel(chartMetric) + ': '

            if (chartMetric === 'totalSteps') {
              label += context.raw.toLocaleString('fr-FR')
            } else if (chartMetric === 'totalDistance') {
              label += context.raw.toFixed(1) + ' km'
            } else if (chartMetric === 'totalCalories') {
              label += Math.round(context.raw) + ' kcal'
            } else if (chartMetric === 'totalActiveTime') {
              label += formatActiveTime(context.raw)
            }

            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (chartMetric === 'totalDistance') {
              return value + ' km'
            } else if (chartMetric === 'totalCalories') {
              return value + ' kcal'
            } else if (chartMetric === 'totalActiveTime') {
              return formatActiveTime(value)
            }
            return value
          },
        },
      },
    },
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const hour = Number(formData.get('time').split(':')[0])

    const entryData = {
      date: new Date(formData.get('date')),
      day: formData.get('date'),
      hourlyData: [
        {
          hour: hour,
          steps: Number(formData.get('steps')),
          distance: Number(formData.get('distance')),
          calories: Number(formData.get('calories')),
          mode: String(selectedMode.value),
          activeTime: Number(formData.get('activeTime')),
        },
      ],
    }

    setIsLoading(true)
    try {
      let success
      if (currentEntry) {
        const updatedEntry = {
          ...currentEntry,
          hourlyData: currentEntry.hourlyData.map((hd) =>
            hd.hour === hour ? entryData.hourlyData[0] : hd,
          ),
        }
        success = await updateStepEntry(currentEntry._id, updatedEntry)
      } else {
        success = await addStepEntry(entryData)
      }

      if (success) {
        setShowModal(false)
        setCurrentEntry(null)
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHourNavigation = (direction) => {
    const hours = currentEntry.hourlyData.map((h) => h.hour)
    const currentIndex = hours.indexOf(
      currentEntry.hourlyData[selectedHourIndex].hour,
    )
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < hours.length) {
      setSelectedHourIndex(newIndex)
    }
  }

  const handleFavoriteChange = async (entryId) => {
    setIsLoading(true)
    try {
      await FavoriteEntry(entryId)
    } catch (error) {
      console.error('error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      setIsLoading(true)
      try {
        await deleteStepEntry(entryId)
      } catch (error) {
        console.error('error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileImport = async () => {
    if (!importFile) return
    setIsLoading(true)
    setUploadProgress(0)
    try {
      await importSteps(importFile, setUploadProgress)
      setShowImportModal(false)
      setImportFile(null)
      setImportSource(null)
    } catch (error) {
      console.error('error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (entry) => {
    setCurrentEntry(entry)
    setShowModal(true)
  }

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(0, 0, 0, 0)

    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7)
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    }

    setSelectedDate(newDate)
  }

  const handleExport = (format) => {
    let dataStr

    if (format === 'json') {
      dataStr = JSON.stringify(stepEntries, null, 2)
    } else if (format === 'csv') {
      const headers = [
        'date',
        'totalSteps',
        'totalDistance',
        'totalCalories',
        'mode',
        'totalActiveTime',
        'isVerified',
      ]
      const csvRows = [headers.join(',')]

      stepEntries.forEach((entry) => {
        const values = headers.map((header) => {
          if (header === 'date') {
            return entry.day
          }
          return entry[header]
        })
        csvRows.push(values.join(','))
      })

      dataStr = csvRows.join('\n')
    }

    const blob = new Blob([dataStr], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `steps-data.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getInsights = () => {
    const insights = []

    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)

    const recentEntries = stepEntries?.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= twoDaysAgo && entryDate <= today
    })

    if (recentEntries?.length === 0) {
      insights.push({
        type: 'warning',
        message: "Vous n'avez pas enregistré de pas récemment !",
      })
    }

    if (filteredEntries.length > 0) {
      const averageSteps =
        filteredEntries.reduce((sum, entry) => sum + entry.totalSteps, 0) /
        filteredEntries.length

      if (averageSteps < 5000) {
        insights.push({
          type: 'info',
          message:
            'Votre moyenne de pas est inférieure aux recommandations de santé (5000 pas/jour).',
        })
      } else if (averageSteps > 10000) {
        insights.push({
          type: 'success',
          message:
            'Félicitations ! Votre moyenne de pas dépasse les 10 000 pas recommandés par jour.',
        })
      }
    }

    return insights
  }

  const insights = getInsights()

  if (!user) {
    return (
      <div className="step-container">
        <h1>Vous devez vous connecter pour accéder à cette page</h1>
      </div>
    )
  }

  return (
    <div className="steps-container">
      {isLoading && (
        <>
          <GlobalLoader />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </>
      )}
      <div className="steps-header">
        <DefaultHeader
          title="Mes Pas"
          description="Enregistrez vos activités quotidiennes et suivez vos progrès."
        />

        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-icon">
              <Footprints size={30} />
            </span>
            <div className="stat-content">
              <span className="stat-value">
                {stats.totalSteps.toLocaleString('fr-FR')}
              </span>
              <span className="stat-label">Total de pas</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <Spline size={30} />
            </span>
            <div className="stat-content">
              <span className="stat-value">{stats.totalDistance} km</span>
              <span className="stat-label">Distance parcourue</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <Flame size={30} />
            </span>
            <div className="stat-content">
              <span className="stat-value">{stats.totalCalories} kcal</span>
              <span className="stat-label">Calories brûlées</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <Clock size={30} />
            </span>
            <div className="stat-content">
              <span className="stat-value">{stats.totalActiveTime}</span>
              <span className="stat-label">Temps actif</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <Zap size={30} />
            </span>
            <div className="stat-content">
              <div className="goal-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${stats.goalPercentage}%` }}
                ></div>
                <span className="progress-text">{stats.goalPercentage}%</span>
              </div>
              <span className="stat-label">
                Objectif{' '}
                {stats.goalAchieved ? <Check size={20} /> : <X size={20} />}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="secondary-nav">
        <div className="high-secondary-nav">
          <div className="view-options">
            <span>Vue par :</span>
            <div className="view-buttons">
              <button
                className={viewMode === 'day' ? 'active' : ''}
                onClick={() => {
                  setViewMode('day')
                  setCustomDateRange(false)
                }}
              >
                🔘 Jour
              </button>
              <button
                className={viewMode === 'week' ? 'active' : ''}
                onClick={() => {
                  setViewMode('week')
                  setCustomDateRange(false)
                }}
              >
                🔘 Semaine
              </button>
              <button
                className={viewMode === 'month' ? 'active' : ''}
                onClick={() => {
                  setViewMode('month')
                  setCustomDateRange(false)
                }}
              >
                🔘 Mois
              </button>
              <button
                className={viewMode === 'custom' ? 'active' : ''}
                onClick={() => {
                  setViewMode('custom')
                  setCustomDateRange(true)
                }}
              >
                🔘 Personnalisée
              </button>
            </div>
          </div>

          <div className="date-selector">
            {!customDateRange ? (
              <>
                <button className="nav-button" onClick={() => navigateDate(-1)}>
                  &lt;
                </button>
                <div
                  className="date-display"
                  onClick={() => setCustomDateRange(true)}
                >
                  <Calendar size={16} />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <button className="nav-button" onClick={() => navigateDate(1)}>
                  &gt;
                </button>
              </>
            ) : (
              <div className="date-range-picker">
                <div className="date-inputs">
                  <div className="date-input">
                    <label>Du</label>
                    <input
                      type="date"
                      value={dateRange.start.toISOString().split('T')[0]}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          start: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="date-input">
                    <label>Au</label>
                    <input
                      type="date"
                      value={dateRange.end.toISOString().split('T')[0]}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          end: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  className="apply-button"
                  onClick={() => setCustomDateRange(false)}
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <div className="dropdown">
            <button className="action-button">
              <Download size={16} />
              <span>Exporter</span>
            </button>
            <div className="dropdown-content">
              <button onClick={() => handleExport('csv')}>CSV</button>
              <button onClick={() => handleExport('json')}>JSON</button>
            </div>
          </div>
          <div className="dropdown">
            <button className="action-button">
              <Upload size={16} />
              <span>Importer</span>
            </button>
            <div className="dropdown-content">
              <button
                onClick={() => {
                  setImportSource('Apple Health')
                  setShowImportModal(true)
                }}
              >
                Apple Health (XML)
              </button>
              <button
                onClick={() => {
                  setImportSource('Samsung Health')
                  setShowImportModal(true)
                }}
              >
                Samsung Health (CSV)
              </button>
            </div>
          </div>
          <button
            className="action-button primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="insights-section">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <Info size={20} />
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="chart-section">
        <div className="chart-header">
          <h2>Progression</h2>
          <div className="chart-controls">
            <div className="metric-selector">
              <Select
                value={MetricOptions.find(
                  (option) => option.value === chartMetric,
                )}
                onChange={(selected) => setChartMetric(selected.value)}
                options={MetricOptions}
                components={{
                  SingleValue: customSingleValue,
                  Option: customOption,
                }}
                styles={customSelectStyles}
                classNamePrefix="metric-select"
              />
            </div>
          </div>
        </div>

        <div className="chart-container">
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="no-data">
              Aucune donnée disponible pour cette période
            </div>
          )}
        </div>
      </div>

      <div className="entries-section">
        <div className="entries-header">
          <h2>Historique des entrées</h2>
          <div className="filter-controls">
            <div className="mode-filter">
              <Select
                value={ModeOptionsChart.find(
                  (option) => option.value === filters.mode,
                )}
                onChange={(selected) =>
                  setFilters({ ...filters, mode: selected.value })
                }
                options={ModeOptionsChart}
                components={{
                  SingleValue: customSingleValue,
                  Option: customOption,
                }}
                styles={customSelectStyles}
                classNamePrefix="mode-select"
              />
            </div>
            <button
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filtres</span>
              {showFilters ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3>Mode d'activité</h3>
              <Select
                value={selectedFilterMode}
                onChange={(selected) => {
                  setSelectedFilterMode(selected)
                  setTableFilters({ ...tableFilters, mode: selected.value })
                }}
                options={FilterModeOptions}
                components={{
                  SingleValue: customSingleValue,
                  Option: customOption,
                }}
                styles={customSelectStyles}
                classNamePrefix="filter-select"
              />
            </div>

            <div className="filter-section">
              <h3>Statut de vérification</h3>
              <Select
                value={selectedVerified}
                onChange={(selected) => {
                  setSelectedVerified(selected)
                  setTableFilters({
                    ...tableFilters,
                    verified: selected.value,
                  })
                }}
                options={VerifiedOptions}
                components={{
                  SingleValue: customSingleValue,
                  Option: customOption,
                }}
                styles={customSelectStyles}
                classNamePrefix="filter-select"
              />
            </div>

            <div className="filter-section">
              <h3>Favoris</h3>
              <Select
                value={selectedFavorite}
                onChange={(selected) => {
                  setSelectedFavorite(selected)
                  setTableFilters({
                    ...tableFilters,
                    favorite: selected.value,
                  })
                }}
                options={FavoriteOptions}
                components={{
                  SingleValue: customSingleValue,
                  Option: customOption,
                }}
                styles={customSelectStyles}
                classNamePrefix="filter-select"
              />
            </div>
          </div>
        )}

        <div className="entries-table-container">
          <table className="entries-table">
            <thead>
              <tr>
                <th>
                  <div>
                    <Calendar size={16} /> Date
                  </div>
                </th>
                <th>
                  <div>
                    <Footprints size={16} /> Pas
                  </div>
                </th>
                <th>
                  <div>
                    <Spline size={16} /> Distance
                  </div>
                </th>
                <th>
                  <div>
                    <Flame size={16} /> Calories
                  </div>
                </th>
                <th>
                  <div>
                    <Globe size={16} /> Mode
                  </div>
                </th>
                <th>
                  <div>
                    <Clock size={16} /> Temps actif
                  </div>
                </th>
                <th>
                  <div>
                    <Check size={16} /> Vérifié
                  </div>
                </th>
                <th>
                  <div>
                    <Edit size={16} /> Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredTableEntries().length > 0 ? (
                getFilteredTableEntries().map((entry) => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                    <td>{entry.totalSteps.toLocaleString('fr-FR')}</td>
                    <td>{entry.totalDistance.toFixed(1)} km</td>
                    <td>{Math.round(entry.totalCalories)} kcal</td>
                    <td>
                      {getModeIcon(entry.mode)} {entry.mode}
                    </td>
                    <td>{formatActiveTime(entry.totalActiveTime)}</td>
                    <td>{entry.isVerified ? <Check /> : <X />}</td>
                    <td>
                      <div className="entry-actions">
                        <button
                          className={`favorite-button ${
                            entry.isFavorite && 'favorite'
                          }`}
                          aria-label="Favoris"
                          onClick={() => handleFavoriteChange(entry._id)}
                        >
                          <Heart size={16} />
                        </button>
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(entry)}
                          aria-label="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(entry._id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="no-data" colSpan={8}>
                    Aucune entrée pour cette période
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="privacy-notice">
        <Info size={16} />
        <p>
          Vos données sont visibles par vos amis.{' '}
          <Link to="/settings">Modifier les paramètres de confidentialité</Link>
        </p>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          ref={EntryModalRef}
          onClick={handleOverlayClick}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>
                {currentEntry ? 'Modifier une entrée' : 'Ajouter une entrée'}
              </h3>
              <button
                className="close-button"
                onClick={() => {
                  setShowModal(false)
                  setCurrentEntry(null)
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form className="entry-form" onSubmit={handleSubmit}>
              {currentEntry && (
                <div className="hour-navigation">
                  <button
                    type="button"
                    onClick={() => handleHourNavigation(-1)}
                    disabled={selectedHourIndex === 0}
                  >
                    <ArrowLeft size={25} />
                  </button>
                  <span>
                    Heure:{' '}
                    {currentEntry.hourlyData[selectedHourIndex].hour
                      .toString()
                      .padStart(2, '0')}
                    :00
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHourNavigation(1)}
                    disabled={
                      selectedHourIndex === currentEntry.hourlyData.length - 1
                    }
                  >
                    <ArrowRight size={25} />
                  </button>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  disabled={!!currentEntry}
                  defaultValue={
                    currentEntry?.day || new Date().toISOString().split('T')[0]
                  }
                />
              </div>
              {!currentEntry && (
                <div className="form-group">
                  <label htmlFor="time">Heure</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    step="3600"
                    required
                    defaultValue={
                      currentEntry
                        ? `${currentEntry.hourlyData[selectedHourIndex].hour
                            .toString()
                            .padStart(2, '0')}:00`
                        : new Date().toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                          })
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="mode">Mode d'activité</label>
                <Select
                  value={selectedMode}
                  onChange={(selected) => {
                    setSelectedMode(selected)
                    if (['run', 'bike'].includes(selected.value)) {
                      setFormValues((prev) => ({ ...prev, steps: 0 }))
                    }
                  }}
                  options={ModeOptions}
                  components={{
                    SingleValue: customSingleValue,
                    Option: customOption,
                  }}
                  styles={customSelectStyles}
                  classNamePrefix="mode-select"
                />
              </div>

              <div className="form-group">
                <label htmlFor="steps">Pas</label>
                <input
                  type="number"
                  id="steps"
                  name="steps"
                  min="0"
                  value={formValues.steps}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      steps: e.target.value,
                    }))
                  }
                  disabled={['run', 'bike'].includes(selectedMode?.value)}
                  placeholder="Nombre de pas"
                />
              </div>
              <div className="form-group">
                <label htmlFor="distance">Distance (km)</label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  step="0.01"
                  min="0"
                  value={formValues.distance}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      distance: e.target.value,
                    }))
                  }
                  placeholder="Distance en km"
                />
              </div>

              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  step="0.01"
                  min="0"
                  value={formValues.calories}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      calories: e.target.value,
                    }))
                  }
                  placeholder="Calories brûlées"
                />
              </div>

              <div className="form-group">
                <label htmlFor="activeTime">Temps actif (minutes)</label>
                <input
                  type="number"
                  id="activeTime"
                  name="activeTime"
                  min="0"
                  value={formValues.activeTime}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      activeTime: e.target.value,
                    }))
                  }
                  placeholder="Temps actif en minutes"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowModal(false)
                    setCurrentEntry(null)
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="save-button">
                  {currentEntry ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div
          className="modal-overlay"
          ref={ImportModalRef}
          onClick={handleOverlayClick}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Importer depuis {importSource}</h3>
              <button
                className="close-button"
                onClick={() => setShowImportModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="import-instructions">
              {importSource === 'Apple Health' && (
                <p>
                  1. Ouvrez l'application Santé sur iPhone
                  <br />
                  2. Allez dans votre profil &gt; Exporter les données santé
                  <br />
                  3. Sélectionnez "Exporter" et envoyez-vous le fichier XML
                  <br />
                  4. Uploadez le fichier export.xml ci-dessous
                </p>
              )}
              {importSource === 'Samsung Health' && (
                <p>
                  1. Ouvrez Samsung Health
                  <br />
                  2. Allez dans Paramètres &gt; Télécharger les données
                  personnelles
                  <br />
                  3. Sélectionnez les données à exporter
                  <br />
                  4. Uploadez le fichier CSV reçu ci-dessous
                </p>
              )}
              <div
                className="dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={triggerFileInput}
              >
                <UploadCloud size={40} className="dropzone-icon" />
                <p className="dropzone-text">
                  {importFile
                    ? importFile.name
                    : 'Déposez un fichier ici ou cliquez pour sélectionner'}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden-file-input"
                  accept={importSource === 'Apple Health' ? '.xml' : '.csv'}
                  onChange={(e) => setImportFile(e.target.files[0])}
                />
              </div>

              <button
                className="action-button primary"
                onClick={handleFileImport}
                disabled={!importFile}
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Steps
