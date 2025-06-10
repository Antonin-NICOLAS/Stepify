import { useState, useEffect, useRef } from "react";
//Context
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "../utils/GlobalLoader";
//Icons
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Icon,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Gift,
  Medal,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Footprints,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Zap,
  Bike,
  Watch,
} from "lucide-react";
import { sneaker } from "@lucide/lab";
import "./Dashboard.css";

const mockDailyStats = {
  steps: 8700,
  distance: 6.7,
  activeTime: 85, // minutes
  calories: 420,
  mode: "walk",
};

const mockWeeklyData = [
  { day: "Lun", steps: 9200, distance: 7.1, calories: 450, goal: 10000 },
  { day: "Mar", steps: 10500, distance: 8.2, calories: 510, goal: 10000 },
  { day: "Mer", steps: 7800, distance: 6.0, calories: 380, goal: 10000 },
  { day: "Jeu", steps: 12300, distance: 9.5, calories: 600, goal: 10000 },
  { day: "Ven", steps: 8700, distance: 6.7, calories: 420, goal: 10000 },
  { day: "Sam", steps: 6500, distance: 5.0, calories: 320, goal: 10000 },
  { day: "Dim", steps: 11200, distance: 8.6, calories: 550, goal: 10000 },
];

const mockMonthlyData = [
  { week: "Sem 1", steps: 65000, distance: 50.2, calories: 3200, goal: 70000 },
  { week: "Sem 2", steps: 72000, distance: 55.6, calories: 3500, goal: 70000 },
  { week: "Sem 3", steps: 68000, distance: 52.5, calories: 3300, goal: 70000 },
  { week: "Sem 4", steps: 74000, distance: 57.1, calories: 3600, goal: 70000 },
];

const mockCustomGoals = [
  {
    id: 1,
    type: "steps",
    target: 50000,
    current: 32500,
    deadline: "2025-05-15",
    createdAt: "2025-05-01",
    isCompleted: false,
  },
  {
    id: 2,
    type: "distance",
    target: 100,
    current: 85,
    deadline: "2025-05-20",
    createdAt: "2025-04-20",
    isCompleted: false,
  },
  {
    id: 3,
    type: "calories",
    target: 10000,
    current: 10000,
    deadline: "2025-05-10",
    createdAt: "2025-04-25",
    isCompleted: true,
  },
];

const mockRewards = [
  {
    id: 1,
    name: "Marcheur Débutant",
    description: "Atteindre 100 000 pas",
    iconUrl: "🥉",
    tier: "bronze",
    unlockedAt: "2025-04-15",
  },
  {
    id: 2,
    name: "Marcheur Intermédiaire",
    description: "Atteindre 500 000 pas",
    iconUrl: "🥈",
    tier: "silver",
    unlockedAt: "2025-04-28",
  },
  {
    id: 3,
    name: "Marcheur Avancé",
    description: "Atteindre 1 000 000 pas",
    iconUrl: "🥇",
    tier: "gold",
    unlockedAt: "2025-05-02",
  },
];

const mockChallenges = [
  {
    id: 1,
    name: "Marathon de Mai",
    description: "Marcher 100 km pendant le mois de mai",
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    goalSteps: 130000,
    currentSteps: 32500,
    status: "active",
  },
  {
    id: 2,
    name: "Défi du Weekend",
    description: "Faire 30 000 pas ce weekend",
    startDate: "2025-05-08",
    endDate: "2025-05-09",
    goalSteps: 30000,
    currentSteps: 12000,
    status: "active",
  },
];

const mockFriends = [
  {
    id: 1,
    username: "sophie_fit",
    firstName: "Sophie",
    lastName: "Martin",
    avatarUrl: "/placeholder.svg?height=50&width=50",
    weeklySteps: 87500,
  },
  {
    id: 2,
    username: "thomas_runner",
    firstName: "Thomas",
    lastName: "Bernard",
    avatarUrl: "/placeholder.svg?height=50&width=50",
    weeklySteps: 75200,
  },
  {
    id: 3,
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    avatarUrl: "/placeholder.svg?height=50&width=50",
    weeklySteps: 68700,
  },
  {
    id: 4,
    username: "emma_walk",
    firstName: "Emma",
    lastName: "Petit",
    avatarUrl: "/placeholder.svg?height=50&width=50",
    weeklySteps: 62300,
  },
  {
    id: 5,
    username: "lucas_step",
    firstName: "Lucas",
    lastName: "Dubois",
    avatarUrl: "/placeholder.svg?height=50&width=50",
    weeklySteps: 58900,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState(mockWeeklyData);
  const [chartType, setChartType] = useState("steps");
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: "steps",
    target: 10000,
    deadline: "",
  });

  // Calculate progress percentage for daily goal
  const dailyProgressPercent =
    (mockDailyStats.steps / user?.dailyGoal) * 100 || 0; //il faut mettre les steps de l'entrée correspondant à aujourd'hui

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Generate motivational message based on progress
  useEffect(() => {
    const progress = dailyProgressPercent;
    let message = "";

    if (progress >= 100) {
      message = "Bravo ! Tu as atteint ton objectif quotidien ! 🎉";
    } else if (progress >= 75) {
      message = `Super ! Tu as atteint ${Math.round(
        progress,
      )}% de ton objectif 👟`;
    } else if (progress >= 50) {
      message = `Continue comme ça ! Tu es à ${Math.round(
        progress,
      )}% de ton objectif 🚶`;
    } else if (progress >= 25) {
      message = `Bon début ! Tu as fait ${Math.round(
        progress,
      )}% de ton objectif 👣`;
    } else {
      message = "C'est parti pour une nouvelle journée active ! 💪";
    }

    setMotivationalMessage(message);
  }, [dailyProgressPercent]);

  // Update chart data when time range changes
  useEffect(() => {
    if (timeRange === "week") {
      setChartData(mockWeeklyData);
    } else if (timeRange === "month") {
      setChartData(mockMonthlyData);
    }
  }, [timeRange]);

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  // Handle new goal form submission
  const handleNewGoalSubmit = (e) => {
    e.preventDefault();
    // Here you would send the new goal to your API
    console.log("New goal:", newGoal);
    setShowNewGoalForm(false);
    // Reset form
    setNewGoal({
      type: "steps",
      target: 10000,
      deadline: "",
    });
  };

  // Get icon for activity mode
  const getActivityModeIcon = (mode) => {
    switch (mode) {
      case "walk":
        return <Icon iconNode={sneaker} size={20} />;
      case "run":
        return <Watch size={20} />;
      case "bike":
        return <Bike size={20} />;
      default:
        return <Icon iconNode={sneaker} size={20} />;
    }
  };

  // Get color for reward tier
  const getRewardColor = (tier) => {
    switch (tier) {
      case "bronze":
        return "#CD7F32";
      case "silver":
        return "#C0C0C0";
      case "gold":
        return "#FFD700";
      case "platinium":
        return "#E5E4E2";
      case "ruby":
        return "#E0115F";
      case "sapphire":
        return "#0F52BA";
      case "diamond":
        return "#B9F2FF";
      default:
        return "#CD7F32";
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <div className="date-display">
          <Calendar size={20} />
          <span>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Daily Summary Section */}
        <section className="dashboard-section daily-summary">
          <h2>Résumé Quotidien</h2>
          <div className="daily-progress-container">
            <div className="daily-progress-info">
              <div className="daily-progress-text">
                <span className="daily-steps">
                  {formatNumber(mockDailyStats.steps)}
                </span>
                <span className="daily-goal">
                  / {formatNumber(user?.dailyGoal ?? 10000)} pas
                </span>
              </div>
              <div className="motivational-message">{motivationalMessage}</div>
            </div>
            <div className="daily-progress-bar-container">
              <div className="daily-progress-bar">
                <div
                  className="daily-progress-fill"
                  style={{ width: `${Math.min(100, dailyProgressPercent)}%` }}
                ></div>
              </div>
              <div className="daily-progress-percentage">
                {Math.round(dailyProgressPercent)}%
              </div>
            </div>
          </div>

          <div className="daily-stats">
            <div className="daily-stat-card">
              <div className="daily-stat-icon">
                <Footprints size={24} />
              </div>
              <div className="daily-stat-content">
                <div className="daily-stat-value">
                  {formatNumber(mockDailyStats.steps)}
                </div>
                <div className="daily-stat-label">Pas</div>
              </div>
            </div>
            <div className="daily-stat-card">
              <div className="daily-stat-icon">
                <MapPin size={24} />
              </div>
              <div className="daily-stat-content">
                <div className="daily-stat-value">
                  {mockDailyStats.distance.toFixed(1)}
                </div>
                <div className="daily-stat-label">Km</div>
              </div>
            </div>
            <div className="daily-stat-card">
              <div className="daily-stat-icon">
                <Clock size={24} />
              </div>
              <div className="daily-stat-content">
                <div className="daily-stat-value">
                  {mockDailyStats.activeTime}
                </div>
                <div className="daily-stat-label">Min</div>
              </div>
            </div>
            <div className="daily-stat-card">
              <div className="daily-stat-icon">
                <Flame size={24} />
              </div>
              <div className="daily-stat-content">
                <div className="daily-stat-value">
                  {mockDailyStats.calories}
                </div>
                <div className="daily-stat-label">Kcal</div>
              </div>
            </div>
          </div>

          <div className="activity-mode-streak">
            <div className="activity-mode">
              <div className="activity-mode-icon">
                {getActivityModeIcon(mockDailyStats.mode)}
              </div>
              <div className="activity-mode-text">
                Mode principal:{" "}
                <span>
                  {mockDailyStats.mode === "walk"
                    ? "Marche"
                    : mockDailyStats.mode === "run"
                      ? "Course"
                      : "Vélo"}
                </span>
              </div>
            </div>
            <div className="streak-display">
              <div className="streak-icon">
                <Zap size={20} />
              </div>
              <div className="streak-text">
                <span className="streak-count">{user?.streak?.current}</span>
                {user?.streak?.current === 0 || user?.streak?.current === 1
                  ? " jour consécutif"
                  : " jours consécutifs"}
              </div>
            </div>
          </div>
        </section>

        {/* Activity History Section */}
        <section className="dashboard-section activity-history">
          <div className="section-header">
            <h2>Historique d'Activité</h2>
            <div className="chart-controls">
              <div className="chart-type-selector">
                <button
                  className={chartType === "steps" ? "active" : ""}
                  onClick={() => setChartType("steps")}
                >
                  Pas
                </button>
                <button
                  className={chartType === "distance" ? "active" : ""}
                  onClick={() => setChartType("distance")}
                >
                  Distance
                </button>
                <button
                  className={chartType === "calories" ? "active" : ""}
                  onClick={() => setChartType("calories")}
                >
                  Calories
                </button>
              </div>
              <div className="time-range-selector">
                <button
                  className={timeRange === "week" ? "active" : ""}
                  onClick={() => setTimeRange("week")}
                >
                  Semaine
                </button>
                <button
                  className={timeRange === "month" ? "active" : ""}
                  onClick={() => setTimeRange("month")}
                >
                  Mois
                </button>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              {timeRange === "week" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey={timeRange === "week" ? "day" : "week"} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey={chartType}
                    name={
                      chartType === "steps"
                        ? "Pas"
                        : chartType === "distance"
                          ? "Distance (km)"
                          : "Calories"
                    }
                    fill="var(--Couleur1)"
                    radius={[4, 4, 0, 0]}
                  />
                  {chartType === "steps" && (
                    <Bar
                      dataKey="goal"
                      name="Objectif"
                      fill="var(--Couleur2)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.5}
                    />
                  )}
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey={timeRange === "week" ? "day" : "week"} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={chartType}
                    name={
                      chartType === "steps"
                        ? "Pas"
                        : chartType === "distance"
                          ? "Distance (km)"
                          : "Calories"
                    }
                    stroke="var(--Couleur1)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {chartType === "steps" && (
                    <Line
                      type="monotone"
                      dataKey="goal"
                      name="Objectif"
                      stroke="var(--Couleur2)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="activity-summary">
            <div className="activity-summary-item">
              <div className="summary-label">Moyenne</div>
              <div className="summary-value">
                {chartType === "steps"
                  ? formatNumber(
                      Math.round(
                        chartData.reduce(
                          (sum, day) => sum + day[chartType],
                          0,
                        ) / chartData.length,
                      ),
                    )
                  : (
                      chartData.reduce((sum, day) => sum + day[chartType], 0) /
                      chartData.length
                    ).toFixed(1)}
                {chartType === "steps"
                  ? " pas"
                  : chartType === "distance"
                    ? " km"
                    : " kcal"}
              </div>
            </div>
            <div className="activity-summary-item">
              <div className="summary-label">Maximum</div>
              <div className="summary-value">
                {chartType === "steps"
                  ? formatNumber(
                      Math.max(...chartData.map((day) => day[chartType])),
                    )
                  : Math.max(...chartData.map((day) => day[chartType])).toFixed(
                      1,
                    )}
                {chartType === "steps"
                  ? " pas"
                  : chartType === "distance"
                    ? " km"
                    : " kcal"}
              </div>
            </div>
            <div className="activity-summary-item">
              <div className="summary-label">Total</div>
              <div className="summary-value">
                {chartType === "steps"
                  ? formatNumber(
                      chartData.reduce((sum, day) => sum + day[chartType], 0),
                    )
                  : chartData
                      .reduce((sum, day) => sum + day[chartType], 0)
                      .toFixed(1)}
                {chartType === "steps"
                  ? " pas"
                  : chartType === "distance"
                    ? " km"
                    : " kcal"}
              </div>
            </div>
          </div>
        </section>

        {/* Custom Goals Section */}
        <section className="dashboard-section custom-goals">
          <div className="section-header">
            <h2>Objectifs Personnalisés</h2>
            <button
              className="add-button"
              onClick={() => setShowNewGoalForm(true)}
            >
              <Plus size={20} />
              <span>Créer un objectif</span>
            </button>
          </div>

          {showNewGoalForm && (
            <div className="new-goal-form-container">
              <form className="new-goal-form" onSubmit={handleNewGoalSubmit}>
                <h3>Nouvel Objectif</h3>
                <div className="form-group">
                  <label htmlFor="goal-type">Type d'objectif</label>
                  <select
                    id="goal-type"
                    value={newGoal.type}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, type: e.target.value })
                    }
                  >
                    <option value="steps">Pas</option>
                    <option value="distance">Distance (km)</option>
                    <option value="calories">Calories</option>
                    <option value="time">Temps actif (min)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="goal-target">Objectif</label>
                  <input
                    type="number"
                    id="goal-target"
                    value={newGoal.target}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        target: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="goal-deadline">Date limite</label>
                  <input
                    type="date"
                    id="goal-deadline"
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, deadline: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowNewGoalForm(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="save-btn">
                    Créer
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="goals-list">
            {mockCustomGoals.map((goal) => (
              <div
                key={goal.id}
                className={`goal-card ${goal.isCompleted ? "completed" : ""}`}
              >
                <div className="goal-icon">
                  {goal.type === "steps" ? (
                    <Zap size={24} />
                  ) : goal.type === "distance" ? (
                    <TrendingUp size={24} />
                  ) : goal.type === "calories" ? (
                    <Flame size={24} />
                  ) : (
                    <Clock size={24} />
                  )}
                </div>
                <div className="goal-content">
                  <div className="goal-header">
                    <div className="goal-title">
                      {goal.type === "steps"
                        ? `${formatNumber(goal.target)} pas`
                        : goal.type === "distance"
                          ? `${goal.target} km`
                          : goal.type === "calories"
                            ? `${formatNumber(goal.target)} calories`
                            : `${goal.target} minutes actives`}
                    </div>
                    <div className="goal-deadline">
                      {goal.isCompleted ? (
                        <span className="completed-label">Terminé</span>
                      ) : (
                        <>
                          <Calendar size={14} />
                          <span>Avant le {formatDate(goal.deadline)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-progress-bar">
                      <div
                        className="goal-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (goal.current / goal.target) * 100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="goal-progress-text">
                      {goal.isCompleted ? (
                        <Check size={16} />
                      ) : (
                        `${Math.round((goal.current / goal.target) * 100)}%`
                      )}
                    </div>
                  </div>
                  <div className="goal-stats">
                    <div className="goal-current">
                      {goal.type === "steps"
                        ? `${formatNumber(goal.current)} / ${formatNumber(
                            goal.target,
                          )} pas`
                        : goal.type === "distance"
                          ? `${goal.current} / ${goal.target} km`
                          : goal.type === "calories"
                            ? `${formatNumber(goal.current)} / ${formatNumber(
                                goal.target,
                              )} calories`
                            : `${goal.current} / ${goal.target} minutes`}
                    </div>
                    <div className="goal-remaining">
                      {!goal.isCompleted && (
                        <>
                          {goal.type === "steps"
                            ? `${formatNumber(
                                goal.target - goal.current,
                              )} pas restants`
                            : goal.type === "distance"
                              ? `${goal.target - goal.current} km restants`
                              : goal.type === "calories"
                                ? `${formatNumber(
                                    goal.target - goal.current,
                                  )} calories restantes`
                                : `${goal.target - goal.current} minutes restantes`}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards & Challenges Section */}
        <section className="dashboard-section rewards-challenges">
          <div className="rewards-section">
            <h2>Récompenses</h2>
            <div className="latest-reward">
              <div className="latest-reward-header">
                <h3>Dernière récompense débloquée</h3>
              </div>
              <div className="reward-card featured">
                <div
                  className="reward-icon"
                  style={{
                    backgroundColor: getRewardColor(mockRewards[2].tier),
                  }}
                >
                  <span>{mockRewards[2].iconUrl}</span>
                </div>
                <div className="reward-content">
                  <div className="reward-title">{mockRewards[2].name}</div>
                  <div className="reward-description">
                    {mockRewards[2].description}
                  </div>
                  <div className="reward-date">
                    Débloqué le {formatDate(mockRewards[2].unlockedAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="rewards-list">
              <h3>Récompenses débloquées</h3>
              <div className="rewards-grid">
                {mockRewards.map((reward) => (
                  <div key={reward.id} className="reward-card small">
                    <div
                      className="reward-icon"
                      style={{ backgroundColor: getRewardColor(reward.tier) }}
                    >
                      <span>{reward.iconUrl}</span>
                    </div>
                    <div className="reward-content">
                      <div className="reward-title">{reward.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-button">
                <span>Voir toutes les récompenses</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="challenges-section">
            <h2>Défis</h2>
            <div className="challenges-list">
              {mockChallenges.map((challenge) => (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-header">
                    <div className="challenge-title">
                      {challenge.name[user?.languagePreference]}
                    </div>
                    <div className="challenge-dates">
                      <Calendar size={14} />
                      <span>
                        {formatDate(challenge.startDate)} -{" "}
                        {formatDate(challenge.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="challenge-description">
                    {challenge.description[user?.languagePreference]}
                  </div>
                  <div className="challenge-progress">
                    <div className="challenge-progress-bar">
                      <div
                        className="challenge-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (challenge.currentSteps / challenge.goalSteps) *
                              100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="challenge-progress-text">
                      {Math.round(
                        (challenge.currentSteps / challenge.goalSteps) * 100,
                      )}
                      %
                    </div>
                  </div>
                  <div className="challenge-stats">
                    <div className="challenge-steps">
                      {formatNumber(challenge.currentSteps)} /{" "}
                      {formatNumber(challenge.goalSteps)} pas
                    </div>
                    <div className="challenge-status">
                      <span className={`status-badge ${challenge.status}`}>
                        {challenge.status === "active"
                          ? "En cours"
                          : challenge.status === "completed"
                            ? "Terminé"
                            : "À venir"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="discover-button">
              <Gift size={16} />
              <span>Découvrir de nouveaux défis</span>
            </button>
          </div>
        </section>

        {/* Friends Leaderboard Section */}
        <section className="dashboard-section friends-leaderboard">
          <div className="section-header">
            <h2>Classement entre amis</h2>
            <div className="leaderboard-period">Cette semaine</div>
          </div>

          <div className="dashboard-leaderboard-container">
            <div className="leaderboard-podium">
              <div className="podium-item second-place">
                <div className="podium-avatar">
                  <img
                    src={mockFriends[1].avatarUrl || "/placeholder.svg"}
                    alt={mockFriends[1].username}
                  />
                  <div className="podium-position">2</div>
                </div>
                <div className="podium-name">{mockFriends[1].firstName}</div>
                <div className="podium-steps">
                  {formatNumber(mockFriends[1].weeklySteps)}
                </div>
              </div>
              <div className="podium-item first-place">
                <div className="podium-avatar">
                  <img
                    src={mockFriends[0].avatarUrl || "/placeholder.svg"}
                    alt={mockFriends[0].username}
                  />
                  <div className="podium-position">1</div>
                </div>
                <div className="podium-name">{mockFriends[0].firstName}</div>
                <div className="podium-steps">
                  {formatNumber(mockFriends[0].weeklySteps)}
                </div>
              </div>
              <div className="podium-item third-place">
                <div className="podium-avatar">
                  <img
                    src={mockFriends[2].avatarUrl || "/placeholder.svg"}
                    alt={mockFriends[2].username}
                  />
                  <div className="podium-position">3</div>
                </div>
                <div className="podium-name">{mockFriends[2].firstName}</div>
                <div className="podium-steps">
                  {formatNumber(mockFriends[2].weeklySteps)}
                </div>
              </div>
            </div>

            <div className="leaderboard-list">
              {mockFriends.slice(3).map((friend, index) => (
                <div key={friend.id} className="leaderboard-item">
                  <div className="leaderboard-rank">{index + 4}</div>
                  <div className="leaderboard-user">
                    <img
                      src={friend.avatarUrl || "/placeholder.svg"}
                      alt={friend.username}
                      className="leaderboard-avatar"
                    />
                    <div className="leaderboard-name">
                      <div>
                        {friend.firstName} {friend.lastName}
                      </div>
                      <div className="leaderboard-username">
                        @{friend.username}
                      </div>
                    </div>
                  </div>
                  <div className="leaderboard-steps">
                    {formatNumber(friend.weeklySteps)}
                  </div>
                </div>
              ))}
            </div>

            <div className="your-position">
              <div className="your-position-label">Votre position</div>
              <div className="your-position-rank">
                3<span>e</span>
              </div>
              <div className="your-position-text">sur 5 amis</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
