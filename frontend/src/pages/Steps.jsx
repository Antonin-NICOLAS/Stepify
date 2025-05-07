import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
//Hooks & context
import { useAuth } from "../context/AuthContext"
import GlobalLoader from "../utils/GlobalLoader"
import { useSteps } from "../hooks/useSteps"
import { useStepsFilters } from "../hooks/useStepsFilters"
import { useStepsStats } from "../hooks/useStepsStats"
//CHARTS
import { Line } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
//ICONS
import { Calendar, Download, Upload, Plus, Filter, Edit, Trash2, X, Info } from "lucide-react"
//CSS
import "./Steps.css"

// Register Chart.js components
Chart.register(...registerables)

const Steps = () => {
    const { user } = useAuth();

    // State for view options
    const [viewMode, setViewMode] = useState("day");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date(),
    });
    const [customDateRange, setCustomDateRange] = useState(false);

    // State for modals
    const [showModal, setShowModal] = useState(false);
    const [currentEntry, setCurrentEntry] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSource, setImportSource] = useState(null);
    const [importFile, setImportFile] = useState(null);

    // State for chart
    const [chartMetric, setChartMetric] = useState("steps");

    // Custom hooks
    const {
        stepEntries,
        isLoading,
        addStepEntry,
        updateStepEntry,
        deleteStepEntry,
        importSteps
    } = useSteps(user?._id);

    const { filteredEntries, filters, setFilters } = useStepsFilters(
        stepEntries,
        viewMode,
        selectedDate,
        dateRange
    );

    const stats = useStepsStats(filteredEntries);

    // Helper functions
    const formatActiveTime = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h${mins.toString().padStart(2, "0")}`
    }

    const formatDate = (date) => {
        if (viewMode === "day") {
            return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        } else if (viewMode === "week") {
            const startOfWeek = new Date(date)
            startOfWeek.setDate(date.getDate() - date.getDay())
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)

            return `${startOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${endOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
        } else if (viewMode === "month") {
            return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        }

        return date.toLocaleDateString("fr-FR")
    }

    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    }

    const getMetricLabel = (metric) => {
        switch (metric) {
            case "steps":
                return "Pas"
            case "distance":
                return "Distance (km)"
            case "calories":
                return "Calories (kcal)"
            case "activeTime":
                return "Temps actif"
            default:
                return metric
        }
    }

    const getModeIcon = (mode) => {
        switch (mode) {
            case "walk":
                return "🚶"
            case "run":
                return "🏃"
            case "bike":
                return "🚴"
            default:
                return "👣"
        }
    }

    // CHART DATA

    // Prepare chart data
    const prepareChartData = () => {
        if (filteredEntries.length === 0) return null

        let labels = []
        let data = []

        // Group data by day, week, or month
        if (viewMode === "day") {
            // For day view, show hourly breakdown
            const hourlyData = Array(24).fill(0)

            filteredEntries.forEach((entry) => {
                const hour = new Date(entry.date).getHours()
                hourlyData[hour] += entry[chartMetric] || 0
            })

            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
            data = hourlyData
        } else if (viewMode === "week" || (viewMode === "custom" && dateRange.end - dateRange.start < 8 * 86400000)) {
            // For week view, show daily breakdown
            const dailyData = {}

            filteredEntries.forEach((entry) => {
                const day = entry.day
                if (!dailyData[day]) {
                    dailyData[day] = 0
                }
                dailyData[day] += entry[chartMetric] || 0
            })

            // Sort by date
            const sortedDays = Object.keys(dailyData).sort()

            labels = sortedDays.map((day) => {
                const date = new Date(day)
                return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
            })

            data = sortedDays.map((day) => dailyData[day])
        } else if (viewMode === "month" || viewMode === "custom") {
            // For month view, group by week
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

            // Sort by week
            const sortedWeeks = Object.keys(weeklyData).sort()

            labels = sortedWeeks.map((week) => {
                const [year, weekNum] = week.split("-W")
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
                    backgroundColor: "rgba(74, 145, 158, 0.2)",
                    borderColor: "rgba(74, 145, 158, 1)",
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
                        let label = getMetricLabel(chartMetric) + ": "

                        if (chartMetric === "steps") {
                            label += context.raw.toLocaleString("fr-FR")
                        } else if (chartMetric === "distance") {
                            label += context.raw.toFixed(1) + " km"
                        } else if (chartMetric === "calories") {
                            label += Math.round(context.raw) + " kcal"
                        } else if (chartMetric === "activeTime") {
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
                        if (chartMetric === "distance") {
                            return value + " km"
                        } else if (chartMetric === "calories") {
                            return value + " kcal"
                        } else if (chartMetric === "activeTime") {
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
        e.preventDefault();

        const formData = new FormData(e.target);
        const entryData = {
            date: formData.get("date"),
            steps: Number.parseInt(formData.get("steps")),
            distance: Number.parseFloat(formData.get("distance")),
            calories: Number.parseInt(formData.get("calories")),
            mode: formData.get("mode"),
            activeTime: Number.parseInt(formData.get("activeTime")),
            isVerified: false,
            day: new Date(formData.get("date")).toISOString().split("T")[0],
        };

        try {
            let success;
            if (currentEntry) {
                success = await updateStepEntry(currentEntry._id, entryData);
            } else {
                success = await addStepEntry(entryData);
            }

            if (success) {
                setShowModal(false);
                setCurrentEntry(null);
            }
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    // Handle entry deletion
    const handleDelete = async (entryId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
            await deleteStepEntry(entryId);
        }
    };

    // Handle import data
    const handleFileImport = async () => {
        if (!importFile) return;
        await importSteps(importFile);
        setShowImportModal(false);
        setImportFile(null);
        setImportSource(null);
    };


    // Handle entry edit
    const handleEdit = (entry) => {
        setCurrentEntry(entry)
        setShowModal(true)
    }

    // Handle date navigation
    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate)

        if (viewMode === "day") {
            newDate.setDate(newDate.getDate() + direction)
        } else if (viewMode === "week") {
            newDate.setDate(newDate.getDate() + direction * 7)
        } else if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() + direction)
        }

        setSelectedDate(newDate)
    }

    // Handle export data
    const handleExport = (format) => {
        let dataStr

        if (format === "json") {
            dataStr = JSON.stringify(stepEntries, null, 2) //TODO: je ne sais pas si je mets stepentries ou filteredentries
        } else if (format === "csv") {
            const headers = ["date", "steps", "distance", "calories", "mode", "activeTime", "isVerified"]
            const csvRows = [headers.join(",")]

            stepEntries.forEach((entry) => {
                const values = headers.map((header) => {
                    if (header === "date") {
                        return entry.day
                    }
                    return entry[header]
                })
                csvRows.push(values.join(","))
            })

            dataStr = csvRows.join("\n")
        }

        const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `steps-data.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Check if there are any insights to show
    const getInsights = () => {
        const insights = []

        // Check for missing entries
        const today = new Date()
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)

        const recentEntries = stepEntries?.filter((entry) => {
            const entryDate = new Date(entry.date)
            return entryDate >= twoDaysAgo && entryDate <= today
        })

        if (recentEntries?.length === 0) {
            insights.push({
                type: "warning",
                message: "Vous n'avez pas enregistré de pas récemment !",
            })
        }

        // Check progress against goals
        if (filteredEntries.length > 0) {
            const averageSteps = filteredEntries.reduce((sum, entry) => sum + entry.steps, 0) / filteredEntries.length

            if (averageSteps < 5000) {
                insights.push({
                    type: "info",
                    message: "Votre moyenne de pas est inférieure aux recommandations de santé (5000 pas/jour).",
                })
            } else if (averageSteps > 10000) {
                insights.push({
                    type: "success",
                    message: "Félicitations ! Votre moyenne de pas dépasse les 10 000 pas recommandés par jour.",
                })
            }
        }

        return insights
    }

    const insights = getInsights()

    return (
        <div className="steps-container">
            {isLoading && <GlobalLoader/>}
            <div className="steps-header">
                <h1>Mes Pas</h1>

                {/* Stats Summary */}
                <div className="stats-summary">
                    <div className="stat-item">
                        <span className="stat-icon">👣</span>
                        <div className="stat-content">
                            <span className="stat-value">{stats.totalSteps.toLocaleString("fr-FR")}</span>
                            <span className="stat-label">Total de pas</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">📏</span>
                        <div className="stat-content">
                            <span className="stat-value">{stats.totalDistance} km</span>
                            <span className="stat-label">Distance parcourue</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">🔥</span>
                        <div className="stat-content">
                            <span className="stat-value">{stats.totalCalories} kcal</span>
                            <span className="stat-label">Calories brûlées</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">⏱️</span>
                        <div className="stat-content">
                            <span className="stat-value">{stats.totalActiveTime}</span>
                            <span className="stat-label">Temps actif</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">🏅</span>
                        <div className="stat-content">
                            <div className="goal-progress">
                                <div className="progress-bar" style={{ width: `${stats.goalPercentage}%` }}></div>
                                <span className="progress-text">{stats.goalPercentage}%</span>
                            </div>
                            <span className="stat-label">Objectif {stats.goalAchieved ? "✅" : "❌"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Navigation */}
            <div className="secondary-nav">
                <div className="high-secondary-nav">
                    <div className="view-options">
                        <span>Vue par :</span>
                        <div className="view-buttons">
                            <button
                                className={viewMode === "day" ? "active" : ""}
                                onClick={() => {
                                    setViewMode("day")
                                    setCustomDateRange(false)
                                }}
                            >
                                🔘 Jour
                            </button>
                            <button
                                className={viewMode === "week" ? "active" : ""}
                                onClick={() => {
                                    setViewMode("week")
                                    setCustomDateRange(false)
                                }}
                            >
                                🔘 Semaine
                            </button>
                            <button
                                className={viewMode === "month" ? "active" : ""}
                                onClick={() => {
                                    setViewMode("month")
                                    setCustomDateRange(false)
                                }}
                            >
                                🔘 Mois
                            </button>
                            <button
                                className={viewMode === "custom" ? "active" : ""}
                                onClick={() => {
                                    setViewMode("custom")
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
                                <div className="date-display" onClick={() => setCustomDateRange(true)}>
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
                                            value={dateRange.start.toISOString().split("T")[0]}
                                            onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                                        />
                                    </div>
                                    <div className="date-input">
                                        <label>Au</label>
                                        <input
                                            type="date"
                                            value={dateRange.end.toISOString().split("T")[0]}
                                            onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <button className="apply-button" onClick={() => setCustomDateRange(false)}>
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
                            <button onClick={() => handleExport("csv")}>CSV</button>
                            <button onClick={() => handleExport("json")}>JSON</button>
                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="action-button">
                            <Upload size={16} />
                            <span>Importer</span>
                        </button>
                        <div className="dropdown-content">
                            <button onClick={() => {
                                setImportSource('Apple Health');
                                setShowImportModal(true);
                            }}>Apple Health (XML)</button>
                            <button onClick={() => {
                                setImportSource('Samsung Health');
                                setShowImportModal(true);
                            }}>Samsung Health (CSV)</button>
                        </div>
                    </div>
                    <button className="action-button primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Insights Section */}
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

            {/* Chart Section */}
            <div className="chart-section">
                <div className="chart-header">
                    <h2>Progression</h2>
                    <div className="chart-controls">
                        <div className="metric-selector">
                            <select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)}>
                                <option value="steps">Pas</option>
                                <option value="distance">Distance</option>
                                <option value="calories">Calories</option>
                                <option value="activeTime">Temps actif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="chart-container">
                    {chartData ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="no-data">Aucune donnée disponible pour cette période</div>
                    )}
                </div>
            </div>

            {/* Entries Table */}
            <div className="entries-section">
                <div className="entries-header">
                    <h2>Historique des entrées</h2>
                    <div className="filter-controls">
                        <div className="mode-filter">
                            <select value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })}>
                                <option value="all">Tous les modes</option>
                                <option value="walk">🚶 Marche</option>
                                <option value="run">🏃 Course</option>
                                <option value="bike">🚴 Vélo</option>
                            </select>
                        </div>
                        <button className="filter-button">
                            <Filter size={16} />
                            <span>Filtres</span>
                        </button>
                    </div>
                </div>

                <div className="entries-table-container">
                    <table className="entries-table">
                        <thead>
                            <tr>
                                <th>📅 Date</th>
                                <th>👣 Pas</th>
                                <th>📏 Distance</th>
                                <th>🔥 Calories</th>
                                <th>🚶 Mode</th>
                                <th>⏱️ Temps actif</th>
                                <th>✅ Vérifié</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <tr key={entry._id}>
                                        <td>{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                                        <td>{entry.steps.toLocaleString("fr-FR")}</td>
                                        <td>{entry.distance.toFixed(1)} km</td>
                                        <td>{Math.round(entry.calories)} kcal</td>
                                        <td>
                                            {getModeIcon(entry.mode)} {entry.mode}
                                        </td>
                                        <td>{formatActiveTime(entry.activeTime)}</td>
                                        <td>{entry.isVerified ? "✅" : "❌"}</td>
                                        <td>
                                            <div className="entry-actions">
                                                <button className="edit-button" onClick={() => handleEdit(entry)} aria-label="Modifier">
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
                                    <td colSpan="8" className="no-data">
                                        Aucune entrée pour cette période
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="privacy-notice">
                <Info size={16} />
                <p>
                    Vos données sont visibles par vos amis. <Link to="/settings">Modifier les paramètres de confidentialité</Link>
                </p>
            </div>

            {/* Add/Edit Entry Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{currentEntry ? "Modifier une entrée" : "Ajouter une entrée"}</h3>
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
                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    required
                                    defaultValue={currentEntry ? currentEntry.day : new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="steps">Pas</label>
                                <input
                                    type="number"
                                    id="steps"
                                    name="steps"
                                    required
                                    min="0"
                                    defaultValue={currentEntry ? currentEntry.steps : ""}
                                    placeholder="Nombre de pas"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="distance">Distance (km)</label>
                                <input
                                    type="number"
                                    id="distance"
                                    name="distance"
                                    step="0.1"
                                    min="0"
                                    defaultValue={currentEntry ? currentEntry.distance : ""}
                                    placeholder="Distance en km"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="calories">Calories</label>
                                <input
                                    type="number"
                                    id="calories"
                                    name="calories"
                                    min="0"
                                    defaultValue={currentEntry ? currentEntry.calories : ""}
                                    placeholder="Calories brûlées"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="mode">Mode</label>
                                <select id="mode" name="mode" defaultValue={currentEntry ? currentEntry.mode : "walk"}>
                                    <option value="walk">🚶 Marche</option>
                                    <option value="run">🏃 Course</option>
                                    <option value="bike">🚴 Vélo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="activeTime">Temps actif (minutes)</label>
                                <input
                                    type="number"
                                    id="activeTime"
                                    name="activeTime"
                                    min="0"
                                    defaultValue={currentEntry ? currentEntry.activeTime : ""}
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
                                    {currentEntry ? "Mettre à jour" : "Ajouter"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Data import Modal */}
            {showImportModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Importer depuis {importSource}</h3>
                            <button className="close-button" onClick={() => setShowImportModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="import-instructions">
                            {importSource === 'Apple Health' && (
                                <p>
                                    1. Ouvrez l'application Santé sur iPhone<br />
                                    2. Allez dans votre profil &gt; Exporter les données santé<br />
                                    3. Sélectionnez "Exporter" et envoyez-vous le fichier XML<br />
                                    4. Uploadez le fichier export.xml ci-dessous
                                </p>
                            )}
                            {importSource === 'Samsung Health' && (
                                <p>
                                    1. Ouvrez Samsung Health<br />
                                    2. Allez dans Paramètres &gt; Télécharger les données personnelles<br />
                                    3. Sélectionnez les données à exporter<br />
                                    4. Uploadez le fichier CSV reçu ci-dessous
                                </p>
                            )}

                            <input
                                type="file"
                                accept={importSource === 'Apple Health' ? '.xml' : '.csv'}
                                onChange={(e) => setImportFile(e.target.files[0])}
                            />

                            <button
                                className="import-button"
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