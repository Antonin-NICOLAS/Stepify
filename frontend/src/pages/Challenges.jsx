import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import Select from 'react-select';
// Context
import { useAuth } from "../context/AuthContext";
import { useChallenge } from "../hooks/useChallenges";
import { useNotifications } from "../hooks/useNotifications";
import { useChallengesFilters } from "../hooks/useChallengesFilters";
import FiltersPanel from "./Challenges/FiltersPanel"
import ChallengeDetailModal from "./Challenges/ChallengeDetailModal";
// Loader
import GlobalLoader from "../utils/GlobalLoader";
// Icons
import { Icon, Activity, Footprints, Watch, Spline, Flame, Trophy, Users, Filter, ChevronDown, ChevronUp, Calendar, Search, Clock, Award, BarChart2, Target, X, Info, Zap, Star, MapPin, Plus, Lock, Check, AlertTriangle, Flag, Hash, Compass, Bookmark, Mail, CheckCheck } from 'lucide-react'
import { sneaker, watchActivity } from '@lucide/lab';
// Charts
import { Chart, registerables } from "chart.js"
//CSS
import "./Challenges.css"

// Register Chart.js components
Chart.register(...registerables)

const Challenges = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("my-challenges");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [accessCode, setAccessCode] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newChallenge, setNewChallenge] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        activityType: "steps",
        goal: 10000,
        time: 1,
        xpReward: 100,
        isPrivate: false,
        participants: []
    });

    const {
        challenges,
        publicChallenges,
        createChallenge,
        fetchChallengeDetails,
        updateChallenge,
        joinChallenge,
        leaveChallenge,
        deleteChallenge,
    } = useChallenge(user?._id);

    const { challengeNotifications, respondToChallengeInvite } = useNotifications(user?._id);

    const {
        sortBy,
        setSortBy,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        filteredChallenges,
        filteredPublicChallenges
    } = useChallengesFilters(user, challenges, publicChallenges);

    //modal close handler
    const JoinModalRef = useRef(null)
    const CreateModalRef = useRef(null)

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowJoinModal(false)
            setShowCreateModal(false)
            setAccessCode("")
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                () => {
                    setShowJoinModal(false)
                    setShowCreateModal(false)
                    setAccessCode("")
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [setShowJoinModal, setShowCreateModal]);

    // Calculate progress
    const computeGlobalProgress = (participants = []) => {
        if (!Array.isArray(participants) || !participants.length) return 0;
        const total = participants.reduce((sum, p) => sum + (p.progress || 0), 0);
        return Math.round(total / participants.length);
    };

    // Select options
    const ActivityOptions = [
        { value: 'steps', label: ' Pas', icon: <Footprints size={16} /> },
        { value: 'steps-time', label: ' Pas par jour', icon: <Icon iconNode={sneaker} size={16} /> },
        { value: 'xp', label: ' XP', icon: <Trophy size={16} /> },
        { value: 'xp-time', label: ' XP par jour', icon: <Award size={16} /> },
        { value: 'distance', label: ' Distance (km)', icon: <Spline size={16} /> },
        { value: 'distance-time', label: ' Distance par jour', icon: <Watch size={16} /> },
        { value: 'calories', label: ' Calories (kcal)', icon: <Flame size={16} /> },
        { value: 'calories-time', label: ' Calories par jour', icon: <Icon iconNode={watchActivity} size={16} /> },
        { value: 'any', label: ' Tout type d\'activité', icon: <Activity size={16} /> },
    ];

    const [selectedActivity, setSelectedActivity] = useState(
        ActivityOptions.find(opt => opt.value === (newChallenge?.activityType || 'walk'))
    );

    const customSingleValue = ({ data }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {data.icon}
            {data.label}
        </div>
    );

    const customOption = (props) => {
        const { data, innerRef, innerProps, isSelected, isFocused } = props;
        return (
            <div
                ref={innerRef}
                {...innerProps}
                className={`activity-select__option ${isSelected ? 'activity-select__option--is-selected' : ''} ${isFocused ? 'activity-select__option--is-focused' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px' }}
            >
                {data.icon}
                {data.label}
            </div>
        );
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    // Calculate days remaining
    const getDaysRemaining = (endDate) => {
        const now = new Date()
        const end = new Date(endDate)
        const diffTime = end - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const formatgoal = (value, type) => {
        switch (type) {
            case "steps":
                return `${value.toLocaleString("fr-FR")} pas`;
            case "steps-time":
                return `${value.toLocaleString("fr-FR")} pas par jour`;
            case "distance":
                return `${value} km`;
            case "distance-time":
                return `${value.toLocaleString("fr-FR")} km par jour`;
            case "calories":
                return `${value} kcal`;
            case "calories-time":
                return `${value} kcal par jour`;
            case "xp":
                return `${value.toLocaleString("fr-FR")} XP`;
            default:
                return value.toLocaleString("fr-FR");
        }
    };

    // Get goal type icon
    const getActivityTypeIcon = (type) => {
        switch (type) {
            case "xp":
                return <Trophy size={16} />
            case "xp-time":
                return <Award size={16} />
            case "steps":
                return <Footprints size={16} />;
            case "steps-time":
                return <Icon iconNode={sneaker} size={16} />;
            case "distance":
                return <Spline size={16} />
            case "distance-time":
                return <Watch size={16} />
            case "calories":
                return <Flame size={16} />
            case "calories-time":
                return <Icon iconNode={watchActivity} size={16} />
            case "any":
                return <Activity size={16} />
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "upcoming":
                return <span className="status-badge upcoming"><Calendar size={12} /> À venir</span>
            case "active":
                return <span className="status-badge active"><Zap size={12} /> En cours</span>
            case "completed":
                return <span className="status-badge completed"><CheckCheck size={12} /> Terminé</span>
            default:
                return null
        }
    }

    // Handle challenge click - fetch details
    const handleChallengeClick = async (challenge) => {
        setIsLoading(true);
        try {
            const details = await fetchChallengeDetails(challenge._id);
            setSelectedChallenge(details);
            setShowChallengeModal(true);
        } catch (error) {
            console.error("Error fetching challenge details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle join challenge
    const handleJoinChallenge = async (challengeId) => {
        setIsLoading(true);
        try {
            await joinChallenge(null, challengeId);
        } catch (error) {
            console.error("Error joining challenge:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle leave challenge
    const handleLeaveChallenge = async (challengeId) => {
        if (window.confirm("Êtes-vous sûr de vouloir quitter ce défi ?")) {
            setIsLoading(true);
            try {
                await leaveChallenge(challengeId);
                setShowChallengeModal(false)
                setSelectedChallenge(null)
            } catch (error) {
                console.error("Error leaving challenge:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle delete challenge
    const handleDeleteChallenge = async (challengeId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce défi ? Tous les participants seront également supprimés.")) {
            setIsLoading(true);
            try {
                await deleteChallenge(challengeId);
                setShowChallengeModal(false)
                setSelectedChallenge(null)
            } catch (error) {
                console.error("Error deleting challenge:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle join private challenge
    const handleJoinPrivateChallenge = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await joinChallenge(accessCode, null);
            setAccessCode("");
            setShowJoinModal(false);
        } catch (error) {
            console.error("Error joining private challenge:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle create challenge
    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const challengeData = {
                name: newChallenge.name,
                description: newChallenge.description,
                startDate: newChallenge.startDate,
                endDate: newChallenge.endDate,
                activityType: selectedActivity.value,
                goal: newChallenge.goal,
                xpReward: newChallenge.xpReward,
                time: selectedActivity.value.includes("-time") ? newChallenge.time : 1,
                isPrivate: newChallenge.isPrivate,
                participants: newChallenge.participants
            };

            await createChallenge(challengeData);

            setNewChallenge({
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                activityType: "steps",
                goal: 10000,
                time: 1,
                xpReward: 100,
                isPrivate: false,
                participants: []
            });

            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating challenge:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle accept invitation
    const handleRespondToInvitation = async (invitationId, action) => {
        setIsLoading(true)
        try {
            await respondToChallengeInvite(invitationId, action);
        } catch (error) {
            console.error("Error accepting invitation:", error);
        } finally {
            setIsLoading(false)
        }
    }

    // Get tab content based on active tab
    const getTabContent = () => {
        switch (activeTab) {
            case "my-challenges":
                return (
                    <div className="challenges-my-tab">
                        {filteredChallenges.length > 0 ? (
                            <div className="challenges-grid">
                                {filteredChallenges.map((challenge) => (
                                    <div
                                        key={challenge._id}
                                        className={`challenge-card ${challenge.status}`}
                                        onClick={() => handleChallengeClick(challenge)}
                                    >
                                        <div className="challenge-header">
                                            <h3>{challenge.name[user?.languagePreference]}</h3>
                                            <div className="challenge-badges">
                                                {getStatusBadge(challenge.status)}
                                                {challenge.isPrivate && (
                                                    <span className="privacy-badge">
                                                        <Lock size={12} /> Privé
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="challenge-description">{challenge.description[user?.languagePreference]}</p>

                                        <div className="challenge-meta">
                                            <div className="challenge-goal">
                                                <span className="meta-label">Objectif :</span>
                                                <span className="meta-value">
                                                    {getActivityTypeIcon(challenge.activityType)}
                                                    {formatgoal(challenge.goal, challenge.activityType)}
                                                </span>
                                            </div>

                                            <div className="challenge-dates">
                                                <span className="meta-label">Période :</span>
                                                <span className="meta-value">
                                                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                                </span>
                                            </div>

                                            <div className="challenge-participants-count">
                                                <span className="meta-label">{challenge.participants.length <= 1 ? "Participant :" : "Participants:"}</span>
                                                <span className="meta-value">
                                                    <Users size={16} />
                                                    {challenge.participants.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="challenge-progress-section">
                                            <div className="progress-header">
                                                <span>Progression</span>
                                                <span>{computeGlobalProgress(challenge.participants)}%</span>
                                            </div>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${computeGlobalProgress(challenge.participants)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {challenge.status === "active" && (
                                            <div className="challenge-time-remaining">
                                                <Clock size={16} />
                                                <span>
                                                    {getDaysRemaining(challenge.endDate) > 0
                                                        ? `${getDaysRemaining(challenge.endDate)} jours restants`
                                                        : "Dernier jour !"}
                                                </span>
                                            </div>
                                        )}

                                        <div className="challenge-actions">
                                            <button
                                                className="action-button primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChallengeClick(challenge);
                                                }}
                                                disabled={isLoading}
                                            >
                                                <Info size={16} />
                                                <span>Voir les détails</span>
                                            </button>
                                            {challenge.creator._id === user?._id && challenge.status !== "completed" && (
                                                <button
                                                    className="action-button secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteChallenge(challenge._id);
                                                    }}
                                                    disabled={challenge.status === "completed" || isLoading}
                                                >
                                                    <X size={16} />
                                                    <span>Supprimer</span>
                                                </button>
                                            )}
                                            {challenge.creator._id !== user?._id && challenge.status !== "completed" && (
                                                <button
                                                    className="action-button secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLeaveChallenge(challenge._id);
                                                    }}
                                                    disabled={challenge.status === "completed" || isLoading}
                                                >
                                                    <X size={16} />
                                                    <span>Quitter</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-challenges">
                                <div className="no-data-message">
                                    <Target size={48} />
                                    <h3>Aucun défi trouvé</h3>
                                    <p>Vous n'avez pas encore rejoint de défis ou aucun défi ne correspond à vos filtres.</p>
                                    <div className="no-data-actions">
                                        <button
                                            className="action-button primary"
                                            onClick={() => setActiveTab("public-challenges")}
                                        >
                                            <Search size={16} />
                                            <span>Parcourir les défis publics</span>
                                        </button>
                                        <button
                                            className="action-button secondary"
                                            onClick={() => setShowCreateModal(true)}
                                        >
                                            <Plus size={16} />
                                            <span>Créer un défi</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            case "public-challenges":
                return (
                    <div className="challenges-public-tab">
                        {filteredPublicChallenges.length > 0 ? (
                            <div className="challenges-grid">
                                {filteredPublicChallenges.map((challenge) => (
                                    <div
                                        key={challenge._id}
                                        className={`challenge-card ${challenge.status}`}
                                        onClick={() => handleChallengeClick(challenge)}
                                    >
                                        <div className="challenge-header">
                                            <h3>{challenge.name[user?.languagePreference]}</h3>
                                            <div className="challenge-badges">
                                                {getStatusBadge(challenge.status)}
                                                {new Date(challenge.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                                    <span className="new-badge">
                                                        <Star size={12} /> Nouveau
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="challenge-description">{challenge.description[user?.languagePreference]}</p>

                                        <div className="challenge-meta">
                                            <div className="challenge-goal">
                                                <span className="meta-label">Objectif:</span>
                                                <span className="meta-value">
                                                    {getActivityTypeIcon(challenge.activityType)}
                                                    {formatgoal(challenge.goal, challenge.activityType)}
                                                </span>
                                            </div>

                                            <div className="challenge-dates">
                                                <span className="meta-label">Période:</span>
                                                <span className="meta-value">
                                                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                                </span>
                                            </div>

                                            <div className="challenge-participants-count">
                                                <span className="meta-label">{challenge.participants.length <= 1 ? "Participant :" : "Participants :"}</span>
                                                <span className="meta-value">
                                                    <Users size={16} />
                                                    {challenge.participants.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="challenge-creator">
                                            <span className="meta-label">Créé par:</span>
                                            <div className="creator-info">
                                                <img
                                                    src={challenge.creator.avatarUrl || "/placeholder.svg"}
                                                    alt={challenge.creator.username}
                                                    className="creator-avatar"
                                                />
                                                <span className="creator-name">
                                                    {challenge.creator.firstName} {challenge.creator.lastName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="challenge-actions">
                                            <button
                                                className="action-button primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJoinChallenge(challenge._id);
                                                }}
                                            >
                                                <Plus size={16} />
                                                <span>Rejoindre</span>
                                            </button>

                                            <button
                                                className="action-button secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChallengeClick(challenge);
                                                }}
                                            >
                                                <Info size={16} />
                                                <span>Détails</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-challenges">
                                <div className="no-data-message">
                                    <Search size={48} />
                                    <h3>Aucun défi public trouvé</h3>
                                    <p>Aucun défi public ne correspond à vos filtres actuels.</p>
                                    <button
                                        className="action-button primary"
                                        onClick={() => {
                                            setFilterType("all");
                                            setFilterStatus("all");
                                            setSortBy("recent");
                                            setSearchQuery("");
                                        }}
                                    >
                                        <X size={16} />
                                        <span>Réinitialiser les filtres</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case "invitations":
                return (
                    <div className="challenges-invitations-tab">
                        {challengeNotifications && challengeNotifications.length > 0 ? (
                            <div className="invitations-list">
                                {challengeNotifications.map((invitation) => (
                                    <div key={invitation?._id} className="invitation-card">
                                        <div className="invitation-header">
                                            <div className="invitation-title">
                                                <h3>{invitation?.challenge.name[user?.languagePreference]}</h3>
                                                {new Date(invitation?.DeleteAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                                                    <span className="expiring-badge">
                                                        <AlertTriangle size={12} /> Expire bientôt
                                                    </span>
                                                )}
                                            </div>
                                            <p className="invitation-description">{invitation?.content[user?.languagePreference]}</p>
                                        </div>

                                        <div className="invitation-details">
                                            <div className="invitation-sender">
                                                <span className="detail-label">Invité par:</span>
                                                <div className="sender-info">
                                                    <img
                                                        src={invitation?.sender?.avatarUrl || "/placeholder.svg"}
                                                        alt={invitation?.sender?.username}
                                                        className="sender-avatar"
                                                    />
                                                    <span className="sender-name">
                                                        {invitation?.sender?.firstName} {invitation?.sender?.lastName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="invitation-meta">
                                                <div className="invitation-date">
                                                    <span className="detail-label">Reçu le:</span>
                                                    <span className="detail-value">{formatDate(invitation?.createdAt)}</span>
                                                </div>

                                                <div className="invitation-expiry">
                                                    <span className="detail-label">Expire le:</span>
                                                    <span className="detail-value">{formatDate(invitation?.DeleteAt)}</span>
                                                </div>

                                                <div className="invitation-participants">
                                                    <span className="detail-label">Participants:</span>
                                                    <span className="detail-value">
                                                        <Users size={16} />
                                                        {invitation.participants}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="invitation-actions">
                                            <button
                                                className="action-button primary"
                                                onClick={() => handleRespondToInvitation(invitation._id, 'accept')}
                                            >
                                                <Check size={16} />
                                                <span>Accepter</span>
                                            </button>

                                            <button
                                                className="action-button secondary"
                                                onClick={() => handleRespondToInvitation(invitation._id, 'decline')}
                                            >
                                                <X size={16} />
                                                <span>Refuser</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-invitations">
                                <div className="no-data-message">
                                    <Mail size={48} />
                                    <h3>Aucune invitation</h3>
                                    <p>Vous n'avez pas d'invitations à des défis pour le moment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            case "create":
                return (
                    <div className="challenges-create-tab">
                        <div className="create-challenge-form-container">
                            <form className="create-challenge-form" onSubmit={handleCreateChallenge}>
                                <div className="form-section">
                                    <h3>Informations générales</h3>

                                    <div className="form-group">
                                        <label htmlFor="challenge-name">Nom du défi *</label>
                                        <input
                                            type="text"
                                            id="challenge-name"
                                            placeholder="Ex: Défi 10K Pas"
                                            value={newChallenge.name[user?.languagePreference]}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="challenge-description">Description</label>
                                        <textarea
                                            id="challenge-description"
                                            placeholder="Décrivez votre défi en quelques mots..."
                                            value={newChallenge.description[user?.languagePreference]}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                            rows={3}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Période et objectif</h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="start-date">Date de début *</label>
                                            <input
                                                type="date"
                                                id="start-date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={newChallenge.startDate}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="end-date">Date de fin</label>
                                            <input
                                                type="date"
                                                id="end-date"
                                                min={newChallenge.startDate || new Date().toISOString().split('T')[0]}
                                                value={newChallenge.endDate}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="goal-type">Type d'objectif *</label>
                                            <Select
                                                value={selectedActivity}
                                                onChange={(selected) => {
                                                    setSelectedActivity(selected);
                                                }}
                                                options={ActivityOptions}
                                                components={{ SingleValue: customSingleValue, Option: customOption }}
                                                classNamePrefix="activity-select"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="goal-value">Valeur de l'objectif *</label>
                                            <input
                                                type="number"
                                                id="goal-value"
                                                min={1}
                                                value={newChallenge.goal}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goal: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        {selectedActivity.value.includes("-time") && (
                                            <div className="form-group">
                                                <label>Durée (en jours)</label>
                                                <input
                                                    type="number"
                                                    id="time-duration"
                                                    value={newChallenge.time}
                                                    onChange={(e) => setNewChallenge({ ...newChallenge, time: parseInt(e.target.value) })}
                                                    min={2}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-section">
                                    <h3> Récompenses </h3>
                                    <div className="form-group">
                                        <label>Récompense XP *</label>
                                        <input
                                            type="number"
                                            id="xp"
                                            value={newChallenge.xpReward}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, xpReward: parseInt(e.target.value) })}
                                            min={10}
                                            step={5}
                                            required
                                        />
                                    </div>
                                    {/*TODO: ajouter un reward associé si nécessaire */}
                                </div>

                                <div className="form-section">
                                    <h3>Visibilité et participants</h3>

                                    <div className="form-group">
                                        <div className="toggle-group">
                                            <label htmlFor="is-private">
                                                {newChallenge.isPrivate
                                                    ? "Défi privé"
                                                    : "Défi public"}</label>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    id="is-private"
                                                    checked={newChallenge.isPrivate}
                                                    onChange={() => { setNewChallenge({ ...newChallenge, isPrivate: !newChallenge.isPrivate }) }}
                                                />
                                            </div>
                                        </div>
                                        <p className="form-help-text">
                                            {newChallenge.isPrivate
                                                ? "Seuls les utilisateurs invités pourront rejoindre ce défi."
                                                : "Tous les utilisateurs pourront voir et rejoindre ce défi."}
                                        </p>
                                    </div>

                                    {newChallenge.isPrivate && (
                                        <div className="form-group">
                                            <label>Inviter des amis</label>
                                            <div className="friends-selection">
                                                {user?.friends.length === 0 ? (
                                                    <p className="form-help-text">Vous navez pas d'ami. Vous pouvez créer le challenge. Si dans une semaine vous êtes le seul participant, il sera supprimé</p>
                                                ) : (
                                                    user?.friends.slice(0, 5).map((friend) => (
                                                        <div key={friend.userId._id} className="friend-option">
                                                            <input
                                                                type="checkbox"
                                                                id={`friend-${friend.userId._id}`}
                                                                checked={newChallenge.participants.includes(friend.userId._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setNewChallenge({
                                                                            ...newChallenge,
                                                                            participants: [...newChallenge.participants, friend.userId._id]
                                                                        });
                                                                    } else {
                                                                        setNewChallenge({
                                                                            ...newChallenge,
                                                                            participants: newChallenge.participants.filter(id => id !== friend.userId._id)
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={`friend-${friend.userId._id}`} className="friend-label">
                                                                <img
                                                                    src={friend.userId.avatarUrl || "/placeholder.svg"}
                                                                    alt={friend.userId.username}
                                                                    className="friend-avatar"
                                                                />
                                                                <span className="friend-name">
                                                                    {friend.userId.fullName}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))
                                                )}
                                                {user?.friends.length > 5 && (
                                                    <button type="button" className="show-more-friends">
                                                        + {user?.friends.length - 5} autres amis
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="action-button primary">
                                        <Flag size={16} />
                                        <span>Créer le défi</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="action-button secondary"
                                        onClick={() => {
                                            setNewChallenge({
                                                name: "",
                                                description: "",
                                                startDate: "",
                                                endDate: "",
                                                activityType: "steps",
                                                goal: 10000,
                                                time: 1,
                                                isPrivate: false,
                                                participants: []
                                            });
                                        }}
                                    >
                                        <X size={16} />
                                        <span>Réinitialiser</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="challenges-container">
            {isLoading && <GlobalLoader />}
            <div className="challenges-header">
                <h1>Défis</h1>
                <p>Participez à des défis pour vous motiver et comparer vos performances</p>
            </div>

            <div className="challenges-quick-actions">
                <button
                    className="quick-action-button"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={20} />
                    <span>Créer un défi</span>
                </button>

                <button
                    className="quick-action-button"
                    onClick={() => setShowJoinModal(true)}
                >
                    <Hash size={20} />
                    <span>Rejoindre avec un code</span>
                </button>

                <button
                    className="quick-action-button"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    <span>Filtrer</span>
                    {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
            <FiltersPanel
                showFilters={showFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterType={filterType}
                setFilterType={setFilterType}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <div className="challenges-tabs">
                <button
                    className={activeTab === "my-challenges" ? "active" : ""}
                    onClick={() => setActiveTab("my-challenges")}
                >
                    <Bookmark size={16} />
                    <span>Mes défis</span>
                </button>
                <button
                    className={activeTab === "public-challenges" ? "active" : ""}
                    onClick={() => setActiveTab("public-challenges")}
                >
                    <Compass size={16} />
                    <span>Défis publics</span>
                </button>
                <button
                    className={activeTab === "invitations" ? "active" : ""}
                    onClick={() => setActiveTab("invitations")}
                >
                    <Mail size={16} />
                    <span>Invitations</span>
                    {challengeNotifications.length > 0 && (
                        <span className="badge">{challengeNotifications.length}</span>
                    )}
                </button>
                <button
                    className={activeTab === "create" ? "active" : ""}
                    onClick={() => setActiveTab("create")}
                >
                    <Plus size={16} />
                    <span>Créer un défi</span>
                </button>
            </div>

            <div className="challenges-content">
                {getTabContent()}
            </div>

            {/* Challenge Detail Modal */}
            {showChallengeModal && selectedChallenge && (
                <ChallengeDetailModal
                    challenge={selectedChallenge}
                    onClose={() => setSelectedChallenge(null)}
                    onDelete={() => handleDeleteChallenge(selectedChallenge._id)}
                    onLeave={() => handleLeaveChallenge(selectedChallenge._id)}
                    user={user}
                />
            )}

            {/* Join Private Challenge Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={handleOverlayClick} ref={JoinModalRef}>
                    <div className="modal join-challenge-modal">
                        <div className="modal-header">
                            <h3>Rejoindre un défi privé</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowJoinModal(false)
                                    setAccessCode("")
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="join-challenge-content">
                            <p className="join-instructions">
                                Entrez le code d'accès du défi privé que vous souhaitez rejoindre.
                            </p>

                            <form className="join-form" onSubmit={handleJoinPrivateChallenge}>
                                <div className="form-group">
                                    <label htmlFor="access-code">Code d'accès</label>
                                    <input
                                        type="text"
                                        id="access-code"
                                        placeholder="Ex: ABC123"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="action-button primary">
                                        <Check size={16} />
                                        <span>Rejoindre</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Challenge Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleOverlayClick} ref={CreateModalRef}>
                    <div className="modal create-challenge-modal">
                        <div className="modal-header">
                            <h3>Créer un nouveau défi</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowCreateModal(false)
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="create-challenge-content">
                            <form className="create-challenge-form" onSubmit={handleCreateChallenge}>
                                <div className="form-section">
                                    <h4>Informations générales</h4>

                                    <div className="form-group">
                                        <label htmlFor="modal-challenge-name">Nom du défi *</label>
                                        <input
                                            type="text"
                                            id="modal-challenge-name"
                                            placeholder="Ex: Défi 10K Pas"
                                            value={newChallenge.name[user?.languagePreference]}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="modal-challenge-description">Description</label>
                                        <textarea
                                            id="modal-challenge-description"
                                            placeholder="Décrivez votre défi en quelques mots..."
                                            value={newChallenge.description[user?.languagePreference]}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                            rows={3}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Période et objectif</h4>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="modal-start-date">Date de début *</label>
                                            <input
                                                type="date"
                                                id="modal-start-date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={newChallenge.startDate}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="modal-end-date">Date de fin</label>
                                            <input
                                                type="date"
                                                id="modal-end-date"
                                                min={newChallenge.startDate || new Date().toISOString().split('T')[0]}
                                                value={newChallenge.endDate}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="modal-goal-type">Type d'objectif *</label>
                                            <Select
                                                value={selectedActivity}
                                                onChange={(selected) => {
                                                    setSelectedActivity(selected);
                                                }}
                                                options={ActivityOptions}
                                                components={{ SingleValue: customSingleValue, Option: customOption }}
                                                classNamePrefix="activity-select"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="modal-goal-value">Valeur de l'objectif *</label>
                                            <input
                                                type="number"
                                                id="modal-goal-value"
                                                min={1}
                                                value={newChallenge.goal}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goal: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        {selectedActivity.value.includes("-time") && (
                                            <div className="form-group">
                                                <label>Durée (en jours)</label>
                                                <input
                                                    type="number"
                                                    id="time-duration"
                                                    value={newChallenge.time}
                                                    onChange={(e) => setNewChallenge({ ...newChallenge, time: parseInt(e.target.value) })}
                                                    min={2}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-section">
                                    <h3> Récompenses </h3>
                                    <div className="form-group">
                                        <label>Récompense XP *</label>
                                        <input
                                            type="number"
                                            id="xp"
                                            value={newChallenge.xpReward}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, xpReward: parseInt(e.target.value) })}
                                            min={10}
                                            step={5}
                                            required
                                        />
                                    </div>
                                    {/*TODO: ajouter un reward associé si nécessaire */}
                                </div>

                                <div className="form-section">
                                    <h4>Visibilité</h4>

                                    <div className="form-group">
                                        <div className="toggle-group">
                                            <label htmlFor="modal-is-private">
                                                {newChallenge.isPrivate
                                                    ? "Défi privé"
                                                    : "Défi public"}</label>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    id="modal-is-private"
                                                    checked={newChallenge.isPrivate}
                                                    onChange={() => { setNewChallenge({ ...newChallenge, isPrivate: !newChallenge.isPrivate }) }}
                                                />
                                            </div>
                                        </div>
                                        <p className="form-help-text">
                                            {newChallenge.isPrivate
                                                ? "Seuls les utilisateurs invités pourront rejoindre ce défi."
                                                : "Tous les utilisateurs pourront voir et rejoindre ce défi."}
                                        </p>
                                    </div>
                                    {newChallenge.isPrivate && (
                                        <div className="form-group">
                                            <label>Inviter des amis</label>
                                            <div className="friends-selection">
                                                {user?.friends.length === 0 ? (
                                                    <p className="form-help-text">Vous navez pas d'ami. Vous pouvez créer le challenge. Si dans une semaine vous êtes le seul participant, il sera supprimé</p>
                                                ) : (
                                                    user?.friends.slice(0, 5).map((friend) => (
                                                        <div key={friend.userId._id} className="friend-option">
                                                            <input
                                                                type="checkbox"
                                                                id={`friend-${friend.userId._id}`}
                                                                checked={newChallenge.participants.includes(friend.userId._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setNewChallenge({
                                                                            ...newChallenge,
                                                                            participants: [...newChallenge.participants, friend.userId._id]
                                                                        });
                                                                    } else {
                                                                        setNewChallenge({
                                                                            ...newChallenge,
                                                                            participants: newChallenge.participants.filter(id => id !== friend.userId._id)
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={`friend-${friend.userId._id}`} className="friend-label">
                                                                <img
                                                                    src={friend.userId.avatarUrl || "/placeholder.svg"}
                                                                    alt={friend.userId.username}
                                                                    className="friend-avatar"
                                                                />
                                                                <span className="friend-name">
                                                                    {friend.userId.fullName}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))
                                                )}
                                                {user?.friends.length > 5 && (
                                                    <button type="button" className="show-more-friends">
                                                        + {user?.friends.length - 5} autres amis
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="action-button primary">
                                        <Flag size={16} />
                                        <span>Créer le défi</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="action-button secondary"
                                        onClick={() => {
                                            setNewChallenge({
                                                name: "",
                                                description: "",
                                                startDate: "",
                                                endDate: "",
                                                activityType: "steps",
                                                goal: 10000,
                                                time: 1,
                                                isPrivate: false,
                                                participants: []
                                            });
                                        }}
                                    >
                                        <X size={16} />
                                        <span>Réinitialiser</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="privacy-notice">
                <Info size={16} />
                <p>
                    Les défis publics sont visibles par tous les utilisateurs.{" "}
                    <Link to="/settings">Modifier les paramètres de confidentialité</Link>
                </p>
            </div>
        </div>
    )
}

export default Challenges