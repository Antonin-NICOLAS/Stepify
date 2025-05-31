import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
// Context
import { useChallenge } from "../hooks/useChallenges"
import { useNotifications } from "../hooks/useNotifications"
import { useLeaderboard } from "../hooks/useLeaderboard"
import { useAuth } from "../context/AuthContext"
import { useUser } from "../context/UserContext"
import GlobalLoader from "../utils/GlobalLoader"
// Icons
import {
  Trophy, Users, Filter, ChevronDown, ChevronUp, Calendar, Search, MessageSquare, UserPlus, Award, BarChart2, Target,
  X, Info, Zap, Smile, Star, Medal, Crown, Share2, Settings, Footprints, Spline
} from "lucide-react"
//Charts
import { Line, Pie } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
// CSS
import "./Leaderboard.css"

// Register Chart.js components
Chart.register(...registerables)

const Leaderboard = () => {
  const { user } = useAuth()
  const { getUserProfile } = useUser()
  const {
    users,
    friendsData,
    challengesData,
    rewardsData,
    fetchLeaderboardData,
    fetchFriendsLeaderboard,
    fetchChallengesLeaderboard,
    fetchRewardsLeaderboard,
  } = useLeaderboard(user?._id)

  const { joinChallenge } = useChallenge(user?.id)
  const { sendFriendRequest, searchUsers, addComment, sendMessage } = useNotifications(user?.id)

  // State for leaderboard type
  const [leaderboardType, setLeaderboardType] = useState("xp")
  const [timeFrame, setTimeFrame] = useState("all-time")
  const [activityMode, setActivityMode] = useState("all")

  // State for filters
  const [filterFriends, setFilterFriends] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // State for search
  const [searchQuery, setSearchQuery] = useState("")

  // State for user profile modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  // State for active tab
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(true)

  // Handle filter changes
  useEffect(() => {
    if (user?._id) {
      const filters = {
        type: leaderboardType,
        timeFrame,
        activityMode,
        filterFriends,
        searchQuery,
      }
      fetchLeaderboardData(filters)
    }
  }, [leaderboardType, timeFrame, activityMode, filterFriends, searchQuery, user?._id, fetchLeaderboardData])

  // Handle tab changes
  useEffect(() => {
    const fetchAll = async () => {
      if (user?._id) {
        switch (activeTab) {
          case "friends":
            await fetchFriendsLeaderboard({ type: leaderboardType, timeFrame })
            break
          case "challenges":
            await fetchChallengesLeaderboard()
            break
          case "rewards":
            await fetchRewardsLeaderboard()
            break
        }
      }
      setIsLoading(false)
    }
    fetchAll();
  }, [
    activeTab,
    leaderboardType,
    timeFrame,
    user?._id,
    fetchFriendsLeaderboard,
    fetchChallengesLeaderboard,
    fetchRewardsLeaderboard,
  ])

  // Filter users based on current filters and search
  const filteredUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply friends filter
    if (filterFriends && user) {
      filtered = filtered.filter(
        (user) => user?.friends.some((friend) => friend.userId === user._id) || user._id === user?._id,
      )
    }

    // Apply activity mode filter
    if (activityMode !== "all") {
      filtered = filtered.filter((user) => user.preferredMode === activityMode)
    }

    // Sort based on leaderboard type and time frame
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (leaderboardType) {
        case "xp":
          aValue =
            timeFrame === "today"
              ? a.dailyXP
              : timeFrame === "week"
                ? a.weeklyXP
                : timeFrame === "month"
                  ? a.monthlyXP
                  : a.totalXP
          bValue =
            timeFrame === "today"
              ? b.dailyXP
              : timeFrame === "week"
                ? b.weeklyXP
                : timeFrame === "month"
                  ? b.monthlyXP
                  : b.totalXP
          break
        case "steps":
          aValue =
            timeFrame === "today"
              ? a.dailySteps
              : timeFrame === "week"
                ? a.weeklySteps
                : timeFrame === "month"
                  ? a.monthlySteps
                  : a.totalSteps
          bValue =
            timeFrame === "today"
              ? b.dailySteps
              : timeFrame === "week"
                ? b.weeklySteps
                : timeFrame === "month"
                  ? b.monthlySteps
                  : b.totalSteps
          break
        case "distance":
          aValue =
            timeFrame === "today"
              ? a.dailyDistance
              : timeFrame === "week"
                ? a.weeklyDistance
                : timeFrame === "month"
                  ? a.monthlyDistance
                  : a.totalDistance
          bValue =
            timeFrame === "today"
              ? b.dailyDistance
              : timeFrame === "week"
                ? b.weeklyDistance
                : timeFrame === "month"
                  ? b.monthlyDistance
                  : b.totalDistance
          break
        case "challenges":
          aValue = a.totalChallengesCompleted
          bValue = b.totalChallengesCompleted
          break
        case "streak":
          aValue = a.streak.max
          bValue = b.streak.max
          break
        case "goal-completion":
          aValue = a.goalCompletionRate
          bValue = b.goalCompletionRate
          break
        default:
          aValue = a.totalXP
          bValue = b.totalXP
      }

      return bValue - aValue // Descending order
    })

    return filtered
  }

  const getLeaderboardTitle = () => {
    let title = ""

    // Type
    switch (leaderboardType) {
      case "xp":
        title = "Classement XP"
        break
      case "steps":
        title = "Classement Pas"
        break
      case "distance":
        title = "Classement Distance"
        break
      case "challenges":
        title = "Défis Complétés"
        break
      case "streak":
        title = "Meilleures Streaks"
        break
      case "goal-completion":
        title = "Complétion d'Objectifs"
        break
      default:
        title = "Classement"
    }

    // Time frame
    if (["xp", "steps", "distance"].includes(leaderboardType)) {
      switch (timeFrame) {
        case "today":
          title += " (Aujourd'hui)"
          break
        case "week":
          title += " (Cette Semaine)"
          break
        case "month":
          title += " (Ce Mois)"
          break
        case "all-time":
          title += " (Tous les Temps)"
          break
      }
    }

    // Activity mode
    if (activityMode !== "all") {
      switch (activityMode) {
        case "walk":
          title += " - Marcheurs"
          break
        case "run":
          title += " - Coureurs"
          break
        case "bike":
          title += " - Cyclistes"
          break
      }
    }

    return title
  }

  const getMetricValue = (user) => {
    switch (leaderboardType) {
      case "xp":
        return timeFrame === "today"
          ? user.dailyXP
          : timeFrame === "week"
            ? user.weeklyXP
            : timeFrame === "month"
              ? user.monthlyXP
              : user.totalXP
      case "steps":
        return timeFrame === "today"
          ? user.dailySteps
          : timeFrame === "week"
            ? user.weeklySteps
            : timeFrame === "month"
              ? user.monthlySteps
              : user.totalSteps
      case "distance":
        return timeFrame === "today"
          ? user.dailyDistance
          : timeFrame === "week"
            ? user.weeklyDistance
            : timeFrame === "month"
              ? user.monthlyDistance
              : user.totalDistance
      case "challenges":
        return user.totalChallengesCompleted
      case "streak":
        return user.streak.max
      case "goal-completion":
        return user.goalCompletionRate
      default:
        return user.totalXP
    }
  }

  const formatMetricValue = (value, type) => {
    switch (type) {
      case "distance":
        return `${value.toFixed(1)} km`
      case "goal-completion":
        return `${value}%`
      default:
        return value.toLocaleString("fr-FR")
    }
  }

  const getMetricIcon = (type) => {
    switch (type) {
      case "xp":
        return <Trophy size={16} />
      case "steps":
        return <Footprints size={16} />
      case "distance":
        return <Spline size={16} />
      case "challenges":
        return <Target size={16} />
      case "streak":
        return <Zap size={16} />
      case "goal-completion":
        return <BarChart2 size={16} />
      default:
        return <Star size={16} />
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

  const handleUserClick = async (user) => {
    const userProfile = await getUserProfile(user._id)
    if (userProfile) {
      setSelectedUser(userProfile)
      setShowUserModal(true)
    }
  }

  const handleSendFriendRequest = async (userId) => {
    await sendFriendRequest(userId)
  }

  const handleSendMessage = async (userId) => {
    // In a real app, this would open a message modal
    await sendMessage(userId, "Hello!")
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    const comment = e.target.comment.value
    if (selectedUser && comment.trim()) {
      const success = await addComment(selectedUser._id, comment)
      if (success) {
        e.target.reset()
      }
    }
  }

  // Generate activity chart data for user profile
  const generateActivityChartData = (user) => {
    // Last 7 days data
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString("fr-FR", { weekday: "short" })
    })

    // Generate random data based on user's average activity
    const stepsData = labels.map(() => Math.floor(user.dailySteps * (0.7 + Math.random() * 0.6)))

    return {
      labels,
      datasets: [
        {
          label: "Pas",
          data: stepsData,
          backgroundColor: "rgba(74, 145, 158, 0.2)",
          borderColor: "rgba(74, 145, 158, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  // Generate activity distribution chart data for user profile
  const generateActivityDistributionData = (user) => {
    // Calculate percentages based on user's preferred mode
    let walkPercentage, runPercentage, bikePercentage

    switch (user.preferredMode) {
      case "walk":
        walkPercentage = 60 + Math.floor(Math.random() * 20)
        runPercentage = Math.floor((100 - walkPercentage) * Math.random())
        bikePercentage = 100 - walkPercentage - runPercentage
        break
      case "run":
        runPercentage = 60 + Math.floor(Math.random() * 20)
        walkPercentage = Math.floor((100 - runPercentage) * Math.random())
        bikePercentage = 100 - walkPercentage - runPercentage
        break
      case "bike":
        bikePercentage = 60 + Math.floor(Math.random() * 20)
        walkPercentage = Math.floor((100 - bikePercentage) * Math.random())
        runPercentage = 100 - walkPercentage - bikePercentage
        break
      default:
        walkPercentage = 40 + Math.floor(Math.random() * 20)
        runPercentage = 30 + Math.floor(Math.random() * 20)
        bikePercentage = 100 - walkPercentage - runPercentage
    }

    return {
      labels: ["Marche", "Course", "Vélo"],
      datasets: [
        {
          data: [walkPercentage, runPercentage, bikePercentage],
          backgroundColor: ["rgba(74, 145, 158, 0.7)", "rgba(33, 46, 83, 0.7)", "rgba(74, 201, 190, 0.7)"],
          borderColor: ["rgba(74, 145, 158, 1)", "rgba(33, 46, 83, 1)", "rgba(74, 201, 190, 1)"],
          borderWidth: 1,
        },
      ],
    }
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
  }

  // Get top 3 users
  const getTopUsers = () => {
    return filteredUsers().slice(0, 3)
  }

  // Get remaining users (after top 3)
  const getRemainingUsers = () => {
    return filteredUsers().slice(3)
  }

  // Get user rank
  const getUserRank = (userId) => {
    return filteredUsers().findIndex((user) => user._id === userId) + 1
  }

  // Get tab content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="leaderboard-general-tab">
            {/* Top 3 Podium */}
            <div className="leaderboard-podium">
              {getTopUsers().map((user3, index) => (
                <div
                  key={user3._id}
                  className={`podium-position podium-${index + 1} ${user3._id === user?._id ? "current-user" : ""
                    }`}
                  onClick={() => handleUserClick(user3)}
                >
                  <div className="podium-medal">
                    {index === 0 ? (
                      <Crown size={24} className="medal-gold" />
                    ) : index === 1 ? (
                      <Medal size={24} className="medal-silver" />
                    ) : (
                      <Award size={24} className="medal-bronze" />
                    )}
                  </div>
                  <div className="podium-avatar">
                    <img src={user3.avatarUrl || "/placeholder.svg"} alt={user3.username} />
                    <span className="user-preferred-mode">{getModeIcon(user3.preferredMode)}</span>
                  </div>
                  <div className="podium-info">
                    <h3 className="podium-name">
                      {user3.firstName} {user3.lastName}
                    </h3>
                    <p className="podium-username">@{user3.username}</p>
                    <div className="podium-score">
                      {getMetricIcon(leaderboardType)}
                      <span>{formatMetricValue(getMetricValue(user3), leaderboardType)}</span>
                    </div>
                    <div className="podium-progress">
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${user3.dailyProgress}%` }}></div>
                        <span className="progress-text">{user3.dailyProgress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="podium-actions">
                    {user && user3._id !== user._id && (
                      <>
                        {user.friends.some(f => f.userId._id !== user3._id) && (
                          <button
                            className="action-icon-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendFriendRequest(user3._id)
                            }}
                            title="Ajouter en ami"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        <button
                          className="action-icon-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendMessage(user3._id)
                          }}
                          title="Envoyer un message"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Remaining Users */}
            <div className="leaderboard-cards">
              {getRemainingUsers().map((users, index) => (
                <div
                  key={users._id}
                  className={`leaderboard-card ${users._id === user?._id ? "current-user" : ""}`}
                  onClick={() => handleUserClick(users)}
                >
                  <div className="card-rank">{index + 4}</div>
                  <div className="card-avatar">
                    <img src={users.avatarUrl || "/placeholder.svg"} alt={users.username} />
                    <span className="user-preferred-mode">{getModeIcon(users.preferredMode)}</span>
                  </div>
                  <div className="card-info">
                    <h3 className="card-name">
                      {users.fullName}
                    </h3>
                    <p className="card-username">@{users.username}</p>
                    <div className="card-score">
                      {getMetricIcon(leaderboardType)}
                      <span>{formatMetricValue(getMetricValue(users), leaderboardType)}</span>
                    </div>
                    <div className="card-progress">
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${users.dailyProgress}%` }}></div>
                        <span className="progress-text">{users.dailyProgress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    {user && users._id !== user?._id && (
                      <>
                        {user.friends.some(f => f.userId._id !== users._id) && (
                          <button
                            className="action-icon-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendFriendRequest(users._id)
                            }}
                            title="Ajouter en ami"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        <button
                          className="action-icon-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendMessage(users._id)
                          }}
                          title="Envoyer un message"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case "friends":
        return (
          <div className="leaderboard-friends-tab">
            {friendsData && friendsData.length > 0 ? (
              <div className="friends-leaderboard">
                <div className="friends-header">
                  <h3>Classement entre amis</h3>
                  <p>Comparez vos performances avec vos amis</p>
                </div>
                <div className="friends-list">
                  {friendsData.map((users, index) => (
                    <div
                      key={users._id}
                      className={`friend-card ${users._id === user?._id ? "current-user" : ""}`}
                      onClick={() => handleUserClick(users)}
                    >
                      <div className="friend-rank">{index + 1}</div>
                      <div className="friend-avatar">
                        <img src={users.avatarUrl || "/placeholder.svg"} alt={users.username} />
                        <span className="user-preferred-mode">{getModeIcon(users.preferredMode)}</span>
                      </div>
                      <div className="friend-info">
                        <h3 className="friend-name">
                          {users.fullName}
                        </h3>
                        <p className="friend-username">@{users.username}</p>
                        <div className="friend-score">
                          {getMetricIcon(leaderboardType)}
                          <span>{formatMetricValue(getMetricValue(users), leaderboardType)}</span>
                        </div>
                      </div>
                      <div className="friend-progress">
                        <div className="progress-container">
                          <div className="progress-bar" style={{ width: `${users.dailyProgress}%` }}></div>
                          <span className="progress-text">{users.dailyProgress}%</span>
                        </div>
                      </div>
                      <div className="friend-actions">
                        {users._id !== user?._id && (
                          <button
                            className="action-icon-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendMessage(users._id)
                            }}
                            title="Envoyer un message"
                          >
                            <MessageSquare size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-friends">
                <p>Vous n'avez pas encore d'amis dans votre liste.</p>
                <button className="action-button">Trouver des amis</button>
              </div>
            )}
          </div>
        )
      case "challenges":
        return (
          <div className="leaderboard-challenges-tab">
            <div className="challenges-header">
              <h3>Défis en cours</h3>
              <p>Classement des utilisateurs participant aux défis actifs</p>
            </div>
            <div className="challenges-grid">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="challenge-card">
                  <div className="challenge-header">
                    <h4>
                      {["Défi 10K", "Marathon Hebdo", "Tour de Ville"][i]}{" "}
                      {i === 0 && <span className="hot-badge">🔥 Populaire</span>}
                    </h4>
                    <p>
                      {
                        [
                          "Atteignez 10 000 pas par jour pendant 7 jours",
                          "Parcourez 42km en une semaine",
                          "Explorez 5 nouveaux lieux",
                        ][i]
                      }
                    </p>
                  </div>
                  <div className="challenge-participants">
                    {filteredUsers()
                      .slice(0, 5)
                      .map((users, index) => (
                        <div key={users._id} className="challenge-participant" onClick={() => handleUserClick(users)}>
                          <div className="participant-rank">{index + 1}</div>
                          <div className="participant-avatar">
                            <img src={users.avatarUrl || "/placeholder.svg"} alt={users.username} />
                          </div>
                          <div className="participant-info">
                            <span className="participant-name">
                              {users.fullName}
                            </span>
                            <div className="participant-progress">
                              <div className="progress-container">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <button className="join-challenge-button" onClick={() => joinChallenge(challenge.id)}>
                    Rejoindre ce défi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      case "rewards":
        return (
          <div className="leaderboard-rewards-tab">
            <div className="rewards-header">
              <h3>Tableau des récompenses</h3>
              <p>Découvrez qui a débloqué les récompenses les plus prestigieuses</p>
            </div>
            <div className="rewards-grid">
              {[
                "Marcheur d'Or",
                "Marathonien",
                "Explorateur Urbain",
                "Roi de la Régularité",
                "Champion de Pas",
                "Légende de la Distance",
              ].map((reward, i) => (
                <div key={i} className="reward-card">
                  <div className="reward-icon">{["🥇", "🏆", "🌍", "👑", "👣", "🌟"][i]}</div>
                  <h4>{reward}</h4>
                  <div className="reward-holders">
                    {filteredUsers()
                      .slice(0, 3)
                      .map((users, index) => (
                        <div key={users._id} className="reward-holder" onClick={() => handleUserClick(users)}>
                          <div className="holder-avatar">
                            <img src={users.avatarUrl || "/placeholder.svg"} alt={users.username} />
                          </div>
                          <div className="holder-info">
                            <span className="holder-name">
                              {users.fullName}
                            </span>
                            <span className="holder-date">
                              Obtenu le{" "}
                              {new Date(
                                Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="leaderboard-container">
      {isLoading && <GlobalLoader />}
      <div className="leaderboard-header">
        <h1>Classements</h1>
        <p>Découvrez où vous vous situez par rapport aux autres utilisateurs</p>
      </div>

      {/* Your Position Card */}
      {user && (
        <div className="your-position-card">
          <div className="position-header">
            <div className="position-title">
              <Crown size={24} />
              <h2>Votre position</h2>
            </div>
            <div className="position-rank">
              <span className="rank-number">{getUserRank(user._id)}</span>
              <span className="rank-label">sur {filteredUsers().length}</span>
            </div>
          </div>
          <div className="position-stats">
            <div className="position-stat">
              <div className="stat-icon">
                <Trophy size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{user.totalXP.toLocaleString("fr-FR")}</span>
                <span className="stat-label">XP total</span>
              </div>
            </div>
            <div className="position-stat">
              <div className="stat-icon">
                <Footprints size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{user.totalSteps.toLocaleString("fr-FR")}</span>
                <span className="stat-label">Pas totaux</span>
              </div>
            </div>
            <div className="position-stat">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{user.streak.current}</span>
                <span className="stat-label">Streak actuelle</span>
              </div>
            </div>
          </div>
          <div className="position-progress">
            <div className="progress-label">
              <span>Objectif du jour</span>
              <span>{user.dailyProgress}%</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${user.dailyProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Controls */}
      <div className="leaderboard-controls-container">
        <div className="leaderboard-tabs">
          <button className={activeTab === "general" ? "active" : ""} onClick={() => setActiveTab("general")}>
            <Trophy size={16} />
            <span>Général</span>
          </button>
          <button className={activeTab === "friends" ? "active" : ""} onClick={() => setActiveTab("friends")}>
            <Users size={16} />
            <span>Amis</span>
          </button>
          <button className={activeTab === "challenges" ? "active" : ""} onClick={() => setActiveTab("challenges")}>
            <Target size={16} />
            <span>Défis</span>
          </button>
          <button className={activeTab === "rewards" ? "active" : ""} onClick={() => setActiveTab("rewards")}>
            <Award size={16} />
            <span>Récompenses</span>
          </button>
        </div>

        <div className="leaderboard-filters">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            <span>Filtres</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3>Type de classement</h3>
              <div className="filter-options">
                <button className={leaderboardType === "xp" ? "active" : ""} onClick={() => setLeaderboardType("xp")}>
                  <Trophy size={16} />
                  <span>XP</span>
                </button>
                <button
                  className={leaderboardType === "steps" ? "active" : ""}
                  onClick={() => setLeaderboardType("steps")}
                >
                  <Footprints size={16} />
                  <span>Pas</span>
                </button>
                <button
                  className={leaderboardType === "distance" ? "active" : ""}
                  onClick={() => setLeaderboardType("distance")}
                >
                  <Spline size={16} />
                  <span>Distance</span>
                </button>
                <button
                  className={leaderboardType === "challenges" ? "active" : ""}
                  onClick={() => setLeaderboardType("challenges")}
                >
                  <Target size={16} />
                  <span>Défis</span>
                </button>
                <button
                  className={leaderboardType === "streak" ? "active" : ""}
                  onClick={() => setLeaderboardType("streak")}
                >
                  <Zap size={16} />
                  <span>Streak</span>
                </button>
                <button
                  className={leaderboardType === "goal-completion" ? "active" : ""}
                  onClick={() => setLeaderboardType("goal-completion")}
                >
                  <BarChart2 size={16} />
                  <span>Objectifs</span>
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Période</h3>
              <div className="filter-options">
                <button
                  className={timeFrame === "today" ? "active" : ""}
                  onClick={() => setTimeFrame("today")}
                  disabled={!["xp", "steps", "distance"].includes(leaderboardType)}
                >
                  <Calendar size={16} />
                  <span>Aujourd'hui</span>
                </button>
                <button
                  className={timeFrame === "week" ? "active" : ""}
                  onClick={() => setTimeFrame("week")}
                  disabled={!["xp", "steps", "distance"].includes(leaderboardType)}
                >
                  <Calendar size={16} />
                  <span>Semaine</span>
                </button>
                <button
                  className={timeFrame === "month" ? "active" : ""}
                  onClick={() => setTimeFrame("month")}
                  disabled={!["xp", "steps", "distance"].includes(leaderboardType)}
                >
                  <Calendar size={16} />
                  <span>Mois</span>
                </button>
                <button className={timeFrame === "all-time" ? "active" : ""} onClick={() => setTimeFrame("all-time")}>
                  <Calendar size={16} />
                  <span>Tous les temps</span>
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Mode d'activité</h3>
              <div className="filter-options">
                <button className={activityMode === "all" ? "active" : ""} onClick={() => setActivityMode("all")}>
                  <span>Tous</span>
                </button>
                <button className={activityMode === "walk" ? "active" : ""} onClick={() => setActivityMode("walk")}>
                  <span>🚶 Marche</span>
                </button>
                <button>
                  <span>Tous</span>
                </button>
                <button className={activityMode === "walk" ? "active" : ""} onClick={() => setActivityMode("walk")}>
                  <span>🚶 Marche</span>
                </button>
                <button className={activityMode === "run" ? "active" : ""} onClick={() => setActivityMode("run")}>
                  <span>🏃 Course</span>
                </button>
                <button className={activityMode === "bike" ? "active" : ""} onClick={() => setActivityMode("bike")}>
                  <span>🚴 Vélo</span>
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Filtres supplémentaires</h3>
              <div className="filter-options">
                <button
                  className={`filter-button ${filterFriends ? "active" : ""}`}
                  onClick={() => setFilterFriends(!filterFriends)}
                  disabled={!["challenges", "rewards"].includes(activeTab)}
                >
                  <Users size={16} />
                  <span>Amis uniquement</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Title */}
      <div className="leaderboard-title-bar">
        <h2>{getLeaderboardTitle()}</h2>
        <div className="title-actions">
          <button className="title-action-button">
            <Share2 size={16} />
            <span>Partager</span>
          </button>
          <button className="title-action-button">
            <Settings size={16} />
            <span>Paramètres</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="leaderboard-content">{getTabContent()}</div>

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal user-profile-modal">
            <div className="modal-header">
              <h3>
                Profil de {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button
                className="close-button"
                onClick={() => {
                  setShowUserModal(false)
                  setSelectedUser(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="user-profile-content">
              <div className="user-profile-header">
                <div className="user-profile-avatar">
                  <img src={selectedUser.avatarUrl || "/placeholder.svg"} alt={selectedUser.username} />
                  <span className="user-preferred-mode">{getModeIcon(selectedUser.preferredMode)}</span>
                </div>

                <div className="user-profile-info">
                  <h4>
                    {selectedUser.fullName}
                  </h4>
                  <p className="user-username">@{selectedUser.username}</p>
                  <p className="user-status">{selectedUser.status[user?.languagePreference]}</p>
                  <p className="user-meta">
                    <span>{selectedUser.age} ans</span>
                    <span>{selectedUser.region}</span>
                    <span>
                      Membre depuis{" "}
                      {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                    </span>
                  </p>
                </div>

                <div className="user-profile-actions">
                  {user && selectedUser._id !== user._id && (
                    <>
                      {user.friends.some(f => f.userId._id !== selectedUser._id) && (
                        <button className="action-button" onClick={() => handleSendFriendRequest(selectedUser._id)}>
                          <UserPlus size={16} />
                          <span>Ajouter en ami</span>
                        </button>
                      )}
                      <button className="action-button" onClick={() => handleSendMessage(selectedUser._id)}>
                        <MessageSquare size={16} />
                        <span>Message</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="user-profile-stats">
                <div className="stat-card">
                  <div className="stat-icon">👣</div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.totalSteps.toLocaleString("fr-FR")}</span>
                    <span className="stat-label">Pas totaux</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📏</div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.totalDistance.toFixed(1)} km</span>
                    <span className="stat-label">Distance totale</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.totalXP.toLocaleString("fr-FR")}</span>
                    <span className="stat-label">XP total</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-content">
                    <span className="stat-value">{selectedUser.streak.max}</span>
                    <span className="stat-label">Meilleure streak</span>
                  </div>
                </div>
              </div>

              <div className="user-profile-charts">
                <div className="chart-section">
                  <h4>Activité des 7 derniers jours</h4>
                  <div className="chart-container" style={{ height: "200px" }}>
                    <Line data={generateActivityChartData(selectedUser)} options={chartOptions} />
                  </div>
                </div>

                <div className="chart-section">
                  <h4>Répartition des activités</h4>
                  <div className="chart-container" style={{ height: "200px" }}>
                    <Pie data={generateActivityDistributionData(selectedUser)} options={pieChartOptions} />
                  </div>
                </div>
              </div>

              <div className="user-profile-sections">
                <div className="profile-section">
                  <h4>Défis actifs</h4>
                  {selectedUser.activeChallenges.length > 0 ? (
                    <div className="challenges-list">
                      {selectedUser.activeChallenges.map((challenge) => (
                        <div className="challenge-item" key={challenge.id}>
                          <div className="challenge-info">
                            <span className="challenge-name">{challenge.name[user?.languagePreference]}</span>
                            <span className="challenge-deadline">
                              Expire le {new Date(challenge.deadline).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <div className="challenge-progress">
                            <div className="progress-container">
                              <div className="progress-bar" style={{ width: `${challenge.progress}%` }}></div>
                              <span className="progress-text">{challenge.progress}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">Aucun défi actif</p>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Récompenses récentes</h4>
                  {selectedUser.rewards.length > 0 ? (
                    <div className="rewards-list">
                      {selectedUser.rewards.slice(0, 5).map((reward) => (
                        <div className="reward-item" key={reward.id}>
                          <span className="reward-icon">{reward.icon}</span>
                          <div className="reward-info">
                            <span className="reward-name">{reward.name}</span>
                            <span className="reward-date">
                              Obtenu le {new Date(reward.unlockedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">Aucune récompense</p>
                  )}
                </div>
              </div>

              <div className="user-profile-social">
                <h4>Commentaires</h4>
                <div className="comments-section">
                  <form className="comment-form" onSubmit={handleAddComment}>
                    <input type="text" name="comment" placeholder="Ajouter un commentaire..." required />
                    <button type="submit" className="comment-button">
                      <Smile size={16} />
                      <span>Commenter</span>
                    </button>
                  </form>

                  <div className="comments-list">
                    <p className="no-data">Aucun commentaire pour le moment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <Info size={16} />
        <p>
          Les classements sont visibles par tous les utilisateurs.{" "}
          <Link to="/settings">Modifier les paramètres de confidentialité</Link>
        </p>
      </div>
    </div>
  )
}

export default Leaderboard
