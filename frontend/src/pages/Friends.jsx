import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
// Context
import { useAuth } from "../context/AuthContext"
import { useUser } from "../context/UserContext"
import { useNotifications } from "../hooks/useNotifications"
// Loader
import GlobalLoader from "../utils/GlobalLoader"
// Icons
import { Users, UserPlus, UserMinus, Search, Filter, ChevronDown, ChevronUp, Check, X, Clock, Send, MessageSquare, Trophy, Award, Zap, Target, Calendar, MapPin, Settings, Eye, EyeOff, Info, Star, TrendingUp, Activity, Heart, UserCheck, Mail, Bell, Shield } from 'lucide-react'
// CSS
import "./Friends.css"

const Friends = () => {
    const { user, isAuthenticated } = useAuth();
    const { updatePrivacySettings } = useUser();
    const {
        friends,
        pendingRequests,
        sentRequests,
        fetchFriendsList,
        fetchPendingFriendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
        searchUsers
    } = useNotifications(user?._id)

    // State for active tab
    const [activeTab, setActiveTab] = useState("friends")

    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState("recent")
    const [filterStatus, setFilterStatus] = useState("all")
    const [isLoading, setIsLoading] = useState(false)

    // State for friend details modal
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [showFriendModal, setShowFriendModal] = useState(false)

    // State for privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        showActivityToFriends: true,
        showStatsPublicly: false,
        showLastLogin: false,
        allowFriendRequests: true,
        allowChallengeInvites: false,
    })

    // modal close handler
    const FriendModalRef = useRef(null)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowFriendModal(false)
            setSelectedFriend(null)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                () => {
                    setShowFriendModal(false)
                    setSelectedFriend(null)
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [setShowFriendModal, setSelectedFriend]);

    // Load data on component mount
    useEffect(() => {
        if (isAuthenticated && user?._id) {
            fetchFriendsList()
            fetchPendingFriendRequests()

            // Load privacy settings from user data
            if (user.privacySettings) {
                setPrivacySettings(user.privacySettings)
            }
        }
    }, [isAuthenticated, user?._id])

    //TODO: Handle search for users
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle friend request actions
    const handleSendFriendRequest = async (userId) => {
        setIsLoading(true)
        try {
            await sendFriendRequest(userId)
            // Update search results to reflect sent request
            setSearchResults(prev =>
                prev.map(user =>
                    user._id === userId
                        ? { ...user, requestStatus: 'sent' }
                        : user
                )
            )
        } catch (error) {
            console.error("Error sending friend request:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptFriendRequest = async (requesterId, notificationId) => {
        console.log(notificationId)
        setIsLoading(true)
        try {
            await acceptFriendRequest(requesterId, notificationId)
        } catch (error) {
            console.error("Error accepting friend request:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeclineFriendRequest = async (notificationId) => {
        setIsLoading(true)
        try {
            await declineFriendRequest(notificationId)
            fetchPendingFriendRequests()
        } catch (error) {
            console.error("Error declining friend request:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelFriendRequest = async (notificationId) => {
        setIsLoading(true)
        try {
            await cancelFriendRequest(notificationId)
            fetchPendingFriendRequests()
        } catch (error) {
            console.error("Error canceling friend request:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFriend = async (friendId) => {
        if (window.confirm("Êtes-vous sûr de vouloir retirer cet ami ?")) {
            setIsLoading(true)
            try {
                await removeFriend(friendId)
                fetchFriendsList()
            } catch (error) {
                console.error("Error removing friend:", error)
            } finally {
                setIsLoading(false)
            }
        }
    }
    // Handle privacy settings update
    const handlePrivacySettingsUpdate = async (updatedSettings) => {
        setIsLoading(true)
        console.log("Updating privacy settings:", updatedSettings)
        try {
            await updatePrivacySettings(user?._id, updatedSettings)
        } catch (error) {
            console.error("Error updating privacy settings:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle friend click
    const handleFriendClick = (friend) => {
        setSelectedFriend(friend)
        setShowFriendModal(true)
    }

    // Sort friends based on selected criteria
    const sortedFriends = () => {
        if (!friends || friends.length === 0) return []

        const sorted = [...friends]

        switch (sortBy) {
            case "recent":
                return sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            case "name":
                return sorted.sort((a, b) => a.firstName.localeCompare(b.firstName))
            case "activity":
                return sorted.sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0))
            case "level":
                return sorted.sort((a, b) => (b.level || 0) - (a.level || 0))
            default:
                return sorted
        }
    }

    // Filter friends based on status
    const filteredFriends = () => {
        const sorted = sortedFriends()

        if (filterStatus === "all") return sorted

        // Add more filter logic here if needed
        return sorted
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    // Empty state components
    const EmptyFriends = () => (
        <div className="empty-friends">
            <div className="empty-icon">
                <Users size={48} />
            </div>
            <h3>Aucun ami pour le moment</h3>
            <p>Commencez à ajouter des amis pour partager vos progrès et vous motiver mutuellement !</p>
            <div className="empty-actions">
                <button
                    className="action-button primary"
                    onClick={() => setActiveTab("search")}
                >
                    <UserPlus size={16} />
                    <span>Rechercher des amis</span>
                </button>
            </div>
        </div>
    )

    const EmptyRequests = () => (
        <div className="empty-requests">
            <div className="empty-icon">
                <Mail size={48} />
            </div>
            <h3>Aucune demande d'ami</h3>
            <p>Vous n'avez pas de demandes d'ami en attente pour le moment.</p>
        </div>
    )

    const EmptySearch = () => (
        <div className="empty-search">
            <div className="empty-icon">
                <Search size={48} />
            </div>
            <h3>Recherchez des amis</h3>
            <p>Utilisez la barre de recherche ci-dessus pour trouver des amis par nom ou nom d'utilisateur.</p>
        </div>
    )

    // Tab content functions
    const getFriendsContent = () => {
        if (!friends || friends.length === 0) {
            return <EmptyFriends />
        }

        return (
            <div className="friends-content">
                {isLoading && <GlobalLoader />}
                <div className="friends-header">
                    <div className="friends-stats">
                        <div className="stat-item">
                            <Users size={20} />
                            <span>{friends.length} {friends.length === 1 ? 'ami' : 'amis'}</span>
                        </div>
                    </div>

                    <div className="friends-controls">
                        <div className="sort-controls">
                            <label>Trier par:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="recent">Plus récents</option>
                                <option value="name">Nom</option>
                                <option value="activity">Activité</option>
                                <option value="level">Niveau</option>
                            </select>
                        </div>

                        <button
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            <span>Filtres</span>
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Statut d'activité</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">Tous</option>
                                <option value="online">En ligne</option>
                                <option value="active">Actifs</option>
                                <option value="inactive">Inactifs</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="friends-grid">
                    {filteredFriends().map((friend) => (
                        <div
                            key={friend._id}
                            className="friend-card"
                            onClick={() => handleFriendClick(friend)}
                        >
                            <div className="friend-avatar">
                                <img
                                    src={friend.userId.avatarUrl || "/placeholder.svg"}
                                    alt={friend.userId.username}
                                />
                                <div className={`activity-indicator`}></div> {/*TODO: status color indicator */}
                            </div>

                            <div className="friend-info">
                                <h3 className="friend-name">{friend.userId.firstName} {friend.userId.lastName}</h3>
                                <p className="friend-username">@{friend.userId.username}</p>
                                <p className="friend-status">{friend.userId.status[user?.languagePreference] || "Aucun statut"}</p>

                                <div className="friend-stats">
                                    <div className="stat">
                                        <Trophy size={14} />
                                        <span>{(friend.userId.totalSteps || 0).toLocaleString()} pas</span>
                                    </div>
                                    <div className="stat">
                                        <Star size={14} />
                                        <span>Niveau {friend.userId.level || 0}</span>
                                    </div>
                                </div>

                                <div className="friend-meta">
                                    <span className="added-date">
                                        Ami depuis {formatDate(friend.addedAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="friend-actions">
                                <button
                                    className="action-icon-button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // Handle message action
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
                                    title="Retirer de mes amis"
                                >
                                    <UserMinus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const getRequestsContent = () => {
        const receivedRequests = pendingRequests?.filter(req => req.notificationId.type === 'friend_request') || []
        const sentRequestsList = sentRequests || []

        if (receivedRequests.length === 0 && sentRequestsList.length === 0) {
            return <EmptyRequests />
        }

        return (
            <div className="requests-content">
                {receivedRequests.length > 0 && (
                    <div className="requests-section">
                        <h3>Demandes reçues ({receivedRequests.length})</h3>
                        <div className="requests-list">
                            {receivedRequests.map((request) => (
                                <div key={request.notificationId._id} className="request-card received">
                                    <div className="request-avatar">
                                        <img
                                            src={request.notificationId.sender?.avatarUrl || "/placeholder.svg"}
                                            alt={request.notificationId.sender?.username}
                                        />
                                    </div>

                                    <div className="request-info">
                                        <h4>{request.notificationId.sender?.fullName}</h4>
                                        <p>@{request.notificationId.sender?.username}</p>
                                        <span className="request-date">
                                            <Clock size={14} />
                                            {formatDate(request.notificationId.createdAt)}
                                        </span>
                                    </div>

                                    <div className="request-actions">
                                        <button
                                            className="action-button primary"
                                            onClick={() =>  handleAcceptFriendRequest(request.notificationId.sender._id, request.notificationId._id)}
                                        >
                                            <Check size={16} />
                                            <span>Accepter</span>
                                        </button>
                                        <button
                                            className="action-button secondary"
                                            onClick={() => handleDeclineFriendRequest(request.notificationId._id)}
                                        >
                                            <X size={16} />
                                            <span>Refuser</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sentRequestsList.length > 0 && (
                    <div className="requests-section">
                        <h3>Demandes envoyées ({sentRequestsList.length})</h3>
                        <div className="requests-list">
                            {sentRequestsList.map((request) => (
                                <div key={request.notificationId._id} className="request-card sent">
                                    <div className="request-avatar">
                                        <img
                                            src={request.notificationId.recipient?.avatarUrl || "/placeholder.svg"}
                                            alt={request.notificationId.recipient?.username}
                                        />
                                    </div>

                                    <div className="request-info">
                                        <h4>{request.notificationId.recipient?.firstName} {request.notificationId.recipient?.lastName}</h4>
                                        <p>@{request.notificationId.recipient?.username}</p>
                                        <span className="request-date">
                                            <Send size={14} />
                                            Envoyée {formatDate(request.notificationId.createdAt)}
                                        </span>
                                    </div>

                                    <div className="request-actions">
                                        <button
                                            className="action-button secondary"
                                            onClick={() => handleCancelFriendRequest(request.notificationId._id)}
                                        >
                                            <X size={16} />
                                            <span>Annuler</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const getSearchContent = () => {
        return (
            <div className="search-content">
                <div className="search-header">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou nom d'utilisateur..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                handleSearch(e.target.value)
                            }}
                        />
                        {isSearching && <div className="search-loading">Recherche...</div>}
                    </div>
                </div>

                <div className="search-results">
                    {searchQuery === "" ? (
                        <EmptySearch />
                    ) : searchResults.length === 0 && !isSearching ? (
                        <div className="no-results">
                            <div className="empty-icon">
                                <Search size={48} />
                            </div>
                            <h3>Aucun résultat</h3>
                            <p>Aucun utilisateur trouvé pour "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="results-grid">
                            {searchResults.map((user) => (
                                <div key={user._id} className="search-result-card">
                                    <div className="result-avatar">
                                        <img
                                            src={user.avatarUrl || "/placeholder.svg"}
                                            alt={user.username}
                                        />
                                    </div>

                                    <div className="result-info">
                                        <h4>{user.firstName} {user.lastName}</h4>
                                        <p>@{user.username}</p>

                                        <div className="result-stats">
                                            <div className="stat">
                                                <Trophy size={14} />
                                                <span>{user.totalSteps.toLocaleString()} pas</span>
                                            </div>
                                            <div className="stat">
                                                <Star size={14} />
                                                <span>Niveau {user.level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="result-actions">
                                        {user.requestStatus === "none" && (
                                            <button
                                                className="action-button primary"
                                                onClick={() => handleSendFriendRequest(user._id)}
                                            >
                                                <UserPlus size={16} />
                                                <span>Ajouter</span>
                                            </button>
                                        )}
                                        {user.requestStatus === "sent" && (
                                            <button className="action-button disabled">
                                                <Clock size={16} />
                                                <span>Demande envoyée</span>
                                            </button>
                                        )}
                                        {user.requestStatus === "friends" && (
                                            <button className="action-button success">
                                                <UserCheck size={16} />
                                                <span>Ami</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const getSettingsContent = () => {
        return (
            <div className="settings-content">
                <div className="settings-header">
                    <h2>Paramètres de confidentialité</h2>
                    <p>Gérez qui peut voir vos informations et vous envoyer des demandes d'ami</p>
                </div>

                <div className="settings-sections">
                    <div className="settings-section">
                        <h3>Visibilité de l'activité</h3>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Montrer mon activité à mes amis</h4>
                                <p>Vos amis peuvent voir vos statistiques et votre progression</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.showActivityToFriends}
                                        onChange={(e) => {
                                            const newSettings = {
                                                ...privacySettings,
                                                showActivityToFriends: e.target.checked
                                            };
                                            setPrivacySettings(newSettings);
                                            handlePrivacySettingsUpdate(newSettings);
                                        }}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Dernière connection</h4>
                                <p>Votre dernière connection est visible par tous les utilisateurs</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.showLastLogin}
                                        onChange={(e) => {
                                            const newSettings = {
                                                ...privacySettings,
                                                showLastLogin: e.target.checked
                                            };
                                            setPrivacySettings(newSettings);
                                            handlePrivacySettingsUpdate(newSettings);
                                        }}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Profil public</h4>
                                <p>Vos statistiques sont visibles par tous les utilisateurs</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.showStatsPublicly}
                                        onChange={(e) => {
                                            const newSettings = {
                                                ...privacySettings,
                                                showStatsPublicly: e.target.checked
                                            };
                                            setPrivacySettings(newSettings);
                                            handlePrivacySettingsUpdate(newSettings);
                                        }}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Demandes d'ami</h3>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Autoriser les demandes d'ami</h4>
                                <p>Les autres utilisateurs peuvent vous envoyer des demandes d'ami</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.allowFriendRequests}
                                        onChange={(e) => {
                                            const newSettings = {
                                                ...privacySettings,
                                                allowFriendRequests: e.target.checked
                                            };
                                            setPrivacySettings(newSettings);
                                            handlePrivacySettingsUpdate(newSettings);
                                        }}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Main render - handle authentication
    if (!isAuthenticated) {
        return (
            <div className="friends-container">
                <div className="auth-required">
                    <div className="auth-icon">
                        <Users size={48} />
                    </div>
                    <h2>Connexion requise</h2>
                    <p>Vous devez être connecté pour accéder à vos amis</p>
                    <Link to="/login" className="action-button primary">
                        Se connecter
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="friends-container">
            <div className="friends-header">
                <h1>Mes Amis</h1>
                <p>Connectez-vous avec d'autres utilisateurs et partagez vos progrès</p>
            </div>

            <div className="friends-tabs">
                <button
                    className={activeTab === "friends" ? "active" : ""}
                    onClick={() => setActiveTab("friends")}
                >
                    <Users size={16} />
                    <span>Amis</span>
                    {friends && friends.length > 0 && (
                        <span className="tab-badge">{friends.length}</span>
                    )}
                </button>
                <button
                    className={activeTab === "requests" ? "active" : ""}
                    onClick={() => setActiveTab("requests")}
                >
                    <Bell size={16} />
                    <span>Demandes</span>
                    {pendingRequests && pendingRequests.length > 0 && (
                        <span className="tab-badge">{pendingRequests.length}</span>
                    )}
                </button>
                <button
                    className={activeTab === "search" ? "active" : ""}
                    onClick={() => setActiveTab("search")}
                >
                    <Search size={16} />
                    <span>Rechercher</span>
                </button>
                <button
                    className={activeTab === "settings" ? "active" : ""}
                    onClick={() => setActiveTab("settings")}
                >
                    <Settings size={16} />
                    <span>Confidentialité</span>
                </button>
            </div>

            <div className="friends-content">
                {activeTab === "friends" && getFriendsContent()}
                {activeTab === "requests" && getRequestsContent()}
                {activeTab === "search" && getSearchContent()}
                {activeTab === "settings" && getSettingsContent()}
            </div>

            {/* Friend Detail Modal */}
            {showFriendModal && selectedFriend && (
                <div className="modal-overlay" ref={FriendModalRef} onClick={handleOverlayClick}>
                    <div className="modal friend-detail-modal">
                        <div className="modal-header">
                            <h3>Profil de {selectedFriend.userId.firstName}</h3>
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
                                    <img
                                        src={selectedFriend.userId.avatarUrl || "/placeholder.svg"}
                                        alt={selectedFriend.userId.username}
                                    />
                                    <div className={`activity-indicator`}></div> {/*TODO: status color indicator */}
                                </div>

                                <div className="friend-detail-info">
                                    <h2>{selectedFriend.userId.firstName} {selectedFriend.userId.lastName}</h2>
                                    <p className="username">@{selectedFriend.userId.username}</p>
                                    <p className="status">{selectedFriend.userId.status[user?.languagePreference] || "Aucun statut"}</p>
                                    <span className={`activity-status`}>
                                        {/*TODO: status color indicator */}
                                    </span>
                                </div>
                            </div>

                            <div className="friend-detail-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{(selectedFriend.userId.totalSteps || 0).toLocaleString()}</span>
                                        <span className="stat-label">Pas totaux</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Star size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{selectedFriend.userId.level || 0}</span>
                                        <span className="stat-label">Niveau</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{selectedFriend.userId.totalXP || 0}</span>
                                        <span className="stat-label">XP total</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{formatDate(selectedFriend.addedAt)}</span>
                                        <span className="stat-label">Ami depuis</span>
                                    </div>
                                </div>
                            </div>

                            <div className="friend-detail-actions">
                                <button className="action-button primary">
                                    <MessageSquare size={16} />
                                    <span>Envoyer un message</span>
                                </button>
                                <button className="action-button secondary">
                                    <TrendingUp size={16} />
                                    <span>Comparer les stats</span>
                                </button>
                                <button
                                    className="action-button danger"
                                    onClick={() => {
                                        handleRemoveFriend(selectedFriend.userId._id)
                                        setShowFriendModal(false)
                                    }}
                                >
                                    <UserMinus size={16} />
                                    <span>Retirer de mes amis</span>
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
                    Vos informations d'ami sont protégées selon vos paramètres de confidentialité.{" "}
                    <button
                        className="privacy-link"
                        onClick={() => setActiveTab("settings")}
                    >
                        Modifier les paramètres
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Friends
