import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
// Context & Hooks
import { useAuth } from "../context/AuthContext"
import { useFriends } from "../hooks/useFriends"
import { useNotifications } from '../hooks/useNotifications'
import { useUser } from "../context/UserContext"
import GlobalLoader from "../utils/GlobalLoader"
// Icons
import {
    Users,
    UserPlus,
    UserMinus,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Calendar,
    Clock,
    MessageSquare,
    X,
    Info,
    Settings,
    Footprints,
    Spline,
    Trophy,
    Zap,
    Mail,
    Check,
    AlertTriangle,
    Star,
} from "lucide-react"
// Charts
import { Line } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
// CSS
import "./Friends.css"

// Register Chart.js components
Chart.register(...registerables)

const Friends = () => {
    const { user } = useAuth()
    const { getUserProfile } = useUser()
    const {
        friends,
        friendRequests,
        sentRequests,
        searchResults,
        isSearching,
        fetchFriends,
        fetchFriendRequests,
        searchUsers,
        removeFriend,
    } = useFriends(user?._id)
    const {
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
    }
        = useNotifications(user?._id)
    // State
    const [activeTab, setActiveTab] = useState("friends")
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState("name")
    const [filterActivity, setFilterActivity] = useState("all")
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [showFriendModal, setShowFriendModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Settings state
    const [settings, setSettings] = useState({
        showOnlineStatus: true,
        allowFriendRequests: true,
        showActivityToFriends: true,
        showStatsToFriends: true,
    })

    const modalRef = useRef(null)

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowFriendModal(false)
            setSelectedFriend(null)
        }
    }

    useEffect(() => {
        const fetchAll = async () => {
            if (user?._id) {
                await fetchFriends()
                await fetchFriendRequests()
            }
            setIsLoading(false)
        }
        fetchAll()
    }, [user?._id, fetchFriends, fetchFriendRequests])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowFriendModal(false)
                setSelectedFriend(null)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, searchUsers])

    // Helper functions
    const getActivityStatus = (friend) => {
        const lastActivity = new Date(friend.lastActivity)
        const now = new Date()
        const diffHours = (now - lastActivity) / (1000 * 60 * 60)

        if (diffHours < 1) return { status: "online", text: "En ligne" }
        if (diffHours < 24) return { status: "today", text: "Actif aujourd'hui" }
        if (diffHours < 168) return { status: "week", text: "Actif cette semaine" }
        return { status: "inactive", text: "Inactif" }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const sortFriends = (friendsList) => {
        const sorted = [...friendsList]

        switch (sortBy) {
            case "name":
                return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName))
            case "activity":
                return sorted.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
            case "added":
                return sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            case "steps":
                return sorted.sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0))
            default:
                return sorted
        }
    }

    const filterFriends = (friendsList) => {
        if (filterActivity === "all") return friendsList

        return friendsList.filter((friend) => {
            const activity = getActivityStatus(friend)
            return activity.status === filterActivity
        })
    }

    const handleFriendClick = async (friend) => {
        const friendProfile = await getUserProfile(friend.userId._id)
        if (friendProfile) {
            setSelectedFriend(friendProfile)
            setShowFriendModal(true)
        }
    }

    const handleSendFriendRequest = async (userId) => {
        await sendFriendRequest(userId)
    }

    const handleAcceptRequest = async (requestId, inviteId) => {
        await acceptFriendRequest(requestId, inviteId)
    }

    const handleDeclineRequest = async (inviteId) => {
        await declineFriendRequest(inviteId)
    }

    const handleRemoveFriend = async (friendId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet ami ?")) {
            await removeFriend(friendId)
        }
    }

    const handleCancelRequest = async (requestId) => {
        await cancelFriendRequest(requestId)
    }

    // Generate activity chart data for friend profile
    const generateActivityChartData = (friend) => {
        const labels = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return date.toLocaleDateString("fr-FR", { weekday: "short" })
        })

        const stepsData = labels.map(() => Math.floor((friend.dailySteps || 5000) * (0.7 + Math.random() * 0.6)))

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

    // Get tab content
    const getTabContent = () => {
        switch (activeTab) {
            case "friends":
                return (
                    <div className="friends-content">
                        <div className="friends-header">
                            <div className="friends-stats">
                                <div className="stat-item">
                                    <Users size={16} />
                                    <span>{friends.length} amis</span>
                                </div>
                                <div className="stat-item">
                                    <Star size={16} />
                                    <span>{friends.filter((f) => getActivityStatus(f.userId).status === "online").length} en ligne</span>
                                </div>
                            </div>

                            <div className="friends-controls">
                                <div className="sort-controls">
                                    <label>Trier par:</label>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="name">Nom</option>
                                        <option value="activity">Activité</option>
                                        <option value="added">Date d'ajout</option>
                                        <option value="steps">Pas</option>
                                    </select>
                                </div>

                                <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                                    <Filter size={16} />
                                    <span>Filtres</span>
                                    {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="filters-panel">
                                <div className="filter-group">
                                    <label>Activité</label>
                                    <select value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
                                        <option value="all">Tous</option>
                                        <option value="online">En ligne</option>
                                        <option value="today">Actif aujourd'hui</option>
                                        <option value="week">Actif cette semaine</option>
                                        <option value="inactive">Inactif</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {friends.length > 0 ? (
                            <div className="friends-grid">
                                {filterFriends(sortFriends(friends)).map((friend) => {
                                    const activity = getActivityStatus(friend.userId)
                                    return (
                                        <div key={friend._id} className="friend-card" onClick={() => handleFriendClick(friend)}>
                                            <div className="friend-avatar">
                                                <img src={friend.userId.avatarUrl || "/placeholder.svg"} alt={friend.userId.username} />
                                                <div className={`activity-indicator status-${activity.status}`}></div>
                                            </div>

                                            <div className="friend-info">
                                                <h3 className="friend-name">{friend.userId.fullName}</h3>
                                                <p className="friend-username">@{friend.userId.username}</p>
                                                <p className="friend-status">
                                                    {friend.userId.status?.[user?.languagePreference] || "Pas de statut"}
                                                </p>

                                                <div className="friend-stats">
                                                    <div className="stat">
                                                        <Footprints size={12} />
                                                        <span>{(friend.userId.totalSteps || 0).toLocaleString("fr-FR")}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <Spline size={12} />
                                                        <span>{(friend.userId.totalDistance || 0).toFixed(1)} km</span>
                                                    </div>
                                                    <div className="stat">
                                                        <Trophy size={12} />
                                                        <span>{friend.userId.totalXP || 0} XP</span>
                                                    </div>
                                                </div>

                                                <div className="friend-meta">
                                                    <div className={`activity-status status-${activity.status}`}>{activity.text}</div>
                                                    <div className="added-date">Ami depuis le {formatDate(friend.addedAt)}</div>
                                                </div>
                                            </div>

                                            <div className="friend-actions">
                                                <button
                                                    className="action-icon-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        // Handle message
                                                    }}
                                                    title="Envoyer un message"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button
                                                    className="action-icon-button danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveFriend(friend.userId._id)
                                                    }}
                                                    title="Supprimer l'ami"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="empty-friends">
                                <div className="empty-icon">
                                    <Users size={48} />
                                </div>
                                <h3>Aucun ami pour le moment</h3>
                                <p>Commencez à ajouter des amis pour voir leurs activités et vous motiver mutuellement !</p>
                                <div className="empty-actions">
                                    <button className="action-button primary" onClick={() => setActiveTab("search")}>
                                        <Search size={16} />
                                        <span>Rechercher des amis</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case "requests":
                return (
                    <div className="requests-content">
                        <div className="requests-section">
                            <h3>
                                Demandes reçues
                                {friendRequests.length > 0 && <span className="tab-badge">{friendRequests.length}</span>}
                            </h3>
                            {friendRequests.length > 0 ? (
                                <div className="requests-list">
                                    {friendRequests.map((request) => (
                                        <div key={request._id} className="request-card received">
                                            <div className="request-avatar">
                                                <img src={request.sender.avatarUrl || "/placeholder.svg"} alt={request.sender.username} />
                                            </div>
                                            <div className="request-info">
                                                <h4>{request.sender.fullName}</h4>
                                                <p>@{request.sender.username}</p>
                                                <div className="request-date">
                                                    <Calendar size={12} />
                                                    <span>Reçu le {formatDate(request.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="request-actions">
                                                <button
                                                    className="action-button primary"
                                                    onClick={() => handleAcceptRequest(request.sender._id, request._id)}
                                                >
                                                    <Check size={16} />
                                                    <span>Accepter</span>
                                                </button>
                                                <button
                                                    className="action-button secondary"
                                                    onClick={() => handleDeclineRequest(request._id)}
                                                >
                                                    <X size={16} />
                                                    <span>Refuser</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-requests">
                                    <div className="empty-icon">
                                        <Mail size={48} />
                                    </div>
                                    <h3>Aucune demande reçue</h3>
                                    <p>Vous n'avez pas de nouvelles demandes d'amis.</p>
                                </div>
                            )}
                        </div>

                        <div className="requests-section">
                            <h3>Demandes envoyées</h3>
                            {sentRequests.length > 0 ? (
                                <div className="requests-list">
                                    {sentRequests.map((request) => (
                                        <div key={request._id} className="request-card sent">
                                            <div className="request-avatar">
                                                <img src={request.recipient.avatarUrl || "/placeholder.svg"} alt={request.recipient.username} />
                                            </div>
                                            <div className="request-info">
                                                <h4>{request.recipient.fullName}</h4>
                                                <p>@{request.recipient.username}</p>
                                                <div className="request-date">
                                                    <Calendar size={12} />
                                                    <span>Envoyé le {formatDate(request.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="request-actions">
                                                <button className="action-button danger" onClick={() => handleCancelRequest(request._id)}>
                                                    <X size={16} />
                                                    <span>Annuler</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-requests">
                                    <div className="empty-icon">
                                        <UserPlus size={48} />
                                    </div>
                                    <h3>Aucune demande envoyée</h3>
                                    <p>Vous n'avez pas envoyé de demandes d'amis récemment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )

            case "search":
                return (
                    <div className="search-content">
                        <div className="search-header">
                            <div className="search-bar">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher des utilisateurs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && <div className="search-loading">Recherche...</div>}
                            </div>
                        </div>

                        <div className="search-results">
                            {searchQuery.trim() === "" ? (
                                <div className="empty-search">
                                    <div className="empty-icon">
                                        <Search size={48} />
                                    </div>
                                    <h3>Rechercher des amis</h3>
                                    <p>Tapez un nom d'utilisateur ou un nom pour commencer votre recherche.</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="results-grid">
                                    {searchResults.map((searchUser) => (
                                        <div key={searchUser._id} className="search-result-card">
                                            <div className="result-avatar">
                                                <img src={searchUser.avatarUrl || "/placeholder.svg"} alt={searchUser.username} />
                                            </div>
                                            <div className="result-info">
                                                <h4>{searchUser.fullName}</h4>
                                                <p>@{searchUser.username}</p>
                                                <div className="result-stats">
                                                    <div className="stat">
                                                        <Footprints size={12} />
                                                        <span>{(searchUser.totalSteps || 0).toLocaleString("fr-FR")}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <Trophy size={12} />
                                                        <span>{searchUser.totalXP || 0} XP</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="result-actions">
                                                {friends.some((f) => f.userId._id === searchUser._id) ? (
                                                    <button className="action-button disabled">
                                                        <Check size={16} />
                                                        <span>Déjà ami</span>
                                                    </button>
                                                ) : sentRequests.some((r) => r.recipient._id === searchUser._id) ? (
                                                    <button className="action-button disabled">
                                                        <Clock size={16} />
                                                        <span>Demande envoyée</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-button primary"
                                                        onClick={() => handleSendFriendRequest(searchUser._id)}
                                                    >
                                                        <UserPlus size={16} />
                                                        <span>Ajouter</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !isSearching ? (
                                <div className="no-results">
                                    <div className="empty-icon">
                                        <AlertTriangle size={48} />
                                    </div>
                                    <h3>Aucun résultat</h3>
                                    <p>Aucun utilisateur trouvé pour "{searchQuery}".</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )

            case "settings":
                return (
                    <div className="settings-content">
                        <div className="settings-header">
                            <h2>Paramètres des amis</h2>
                            <p>Gérez vos préférences de confidentialité et d'interaction avec vos amis</p>
                        </div>

                        <div className="settings-sections">
                            <div className="settings-section">
                                <h3>Confidentialité</h3>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Afficher le statut en ligne</h4>
                                        <p>Permettre à vos amis de voir quand vous êtes en ligne</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.showOnlineStatus}
                                            onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Autoriser les demandes d'amis</h4>
                                        <p>Permettre aux autres utilisateurs de vous envoyer des demandes d'amis</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowFriendRequests}
                                            onChange={(e) => setSettings({ ...settings, allowFriendRequests: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Partager l'activité avec les amis</h4>
                                        <p>Permettre à vos amis de voir vos activités récentes</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.showActivityToFriends}
                                            onChange={(e) => setSettings({ ...settings, showActivityToFriends: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Partager les statistiques avec les amis</h4>
                                        <p>Permettre à vos amis de voir vos statistiques détaillées</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.showStatsToFriends}
                                            onChange={(e) => setSettings({ ...settings, showStatsToFriends: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (!user) {
        return (
            <div className="friends-container">
                <div className="auth-required">
                    <div className="auth-icon">
                        <Users size={48} />
                    </div>
                    <h2>Connexion requise</h2>
                    <p>Vous devez vous connecter pour accéder à vos amis.</p>
                    <Link to="/login" className="action-button primary">
                        Se connecter
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="friends-container">
            {isLoading && <GlobalLoader />}
            <div className="friends-header">
                <h1>Mes Amis</h1>
                <p>Connectez-vous avec d'autres utilisateurs et partagez vos progrès</p>
            </div>

            <div className="friends-tabs">
                <button className={activeTab === "friends" ? "active" : ""} onClick={() => setActiveTab("friends")}>
                    <Users size={16} />
                    <span>Amis</span>
                </button>
                <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}>
                    <UserPlus size={16} />
                    <span>Demandes</span>
                    {friendRequests.length + sentRequests.length > 0 && (
                        <span className="tab-badge">{friendRequests.length + sentRequests.length}</span>
                    )}
                </button>
                <button className={activeTab === "search" ? "active" : ""} onClick={() => setActiveTab("search")}>
                    <Search size={16} />
                    <span>Rechercher</span>
                </button>
                <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
                    <Settings size={16} />
                    <span>Paramètres</span>
                </button>
            </div>

            <div className="friends-content">{getTabContent()}</div>

            {/* Friend Detail Modal */}
            {showFriendModal && selectedFriend && (
                <div className="modal-overlay" onClick={handleOverlayClick} ref={modalRef}>
                    <div className="modal friend-detail-modal">
                        <div className="modal-header">
                            <h3>Profil de {selectedFriend.fullName}</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowFriendModal(false)
                                    setSelectedFriend(null)
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="friend-detail-content">
                            <div className="friend-detail-header">
                                <div className="friend-detail-avatar">
                                    <img src={selectedFriend.avatarUrl || "/placeholder.svg"} alt={selectedFriend.username} />
                                    <div className={`activity-indicator status-${getActivityStatus(selectedFriend).status}`}></div>
                                </div>

                                <div className="friend-detail-info">
                                    <h2>{selectedFriend.fullName}</h2>
                                    <p className="username">@{selectedFriend.username}</p>
                                    <p className="status">{selectedFriend.status?.[user?.languagePreference] || "Pas de statut"}</p>
                                </div>

                                <div className="user-profile-actions">
                                    <button className="action-button">
                                        <MessageSquare size={16} />
                                        <span>Message</span>
                                    </button>
                                </div>
                            </div>

                            <div className="friend-detail-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Footprints size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{(selectedFriend.totalSteps || 0).toLocaleString("fr-FR")}</span>
                                        <span className="stat-label">Pas totaux</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Spline size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{(selectedFriend.totalDistance || 0).toFixed(1)} km</span>
                                        <span className="stat-label">Distance totale</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{(selectedFriend.totalXP || 0).toLocaleString("fr-FR")}</span>
                                        <span className="stat-label">XP total</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{selectedFriend.streak?.current || 0}</span>
                                        <span className="stat-label">Streak actuelle</span>
                                    </div>
                                </div>
                            </div>

                            {settings.showActivityToFriends && (
                                <div className="chart-section">
                                    <h4>Activité des 7 derniers jours</h4>
                                    <div className="chart-container" style={{ height: "200px" }}>
                                        <Line data={generateActivityChartData(selectedFriend)} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            <div className="friend-detail-actions">
                                <button
                                    className="action-button danger"
                                    onClick={() => {
                                        setShowFriendModal(false)
                                        handleRemoveFriend(selectedFriend._id)
                                    }}
                                >
                                    <UserMinus size={16} />
                                    <span>Supprimer l'ami</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Notice */}
            <div className="privacy-notice">
                <Info size={16} />
                <p>
                    Vos informations d'amis sont privées et ne sont partagées qu'avec vos amis confirmés.{" "}
                    <button className="privacy-link" onClick={() => setActiveTab("settings")}>
                        Modifier les paramètres de confidentialité
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Friends