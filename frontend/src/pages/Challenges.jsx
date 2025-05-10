import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trophy, Users, Filter, ChevronDown, ChevronUp, Calendar, Search, MessageSquare, UserPlus, Clock, Award, BarChart2, Target, X, Info, Zap, Smile, Star, ArrowUp, ArrowDown, Medal, Crown, Heart, Share2, Settings, User, MapPin, Sliders, Plus, Lock, Unlock, Check, AlertTriangle, Flag, CalendarIcon, Hash, Compass, Bookmark, Trash2, Mail } from 'lucide-react'
import { Bar, Line, Pie } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import "./Challenges.css"

// Register Chart.js components
Chart.register(...registerables)

const Challenges = () => {
    // State for active tab
    const [activeTab, setActiveTab] = useState("my-challenges")

    // State for filters
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState("recent")
    const [filterType, setFilterType] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")

    // State for search
    const [searchQuery, setSearchQuery] = useState("")

    // State for challenge detail modal
    const [selectedChallenge, setSelectedChallenge] = useState(null)
    const [showChallengeModal, setShowChallengeModal] = useState(false)

    // State for join private challenge modal
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [accessCode, setAccessCode] = useState("")

    // State for create challenge modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newChallenge, setNewChallenge] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        goalType: "steps",
        goalValue: 10000,
        isPrivate: false,
        accessCode: "",
        invitedFriends: []
    })

    // Mock data for challenges
    const [challenges, setChallenges] = useState([])
    const [publicChallenges, setPublicChallenges] = useState([])
    const [invitations, setInvitations] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [friends, setFriends] = useState([])

    // Load mock data
    useEffect(() => {
        // Simulate API call to get challenges
        const mockChallenges = generateMockChallenges(10)
        setChallenges(mockChallenges)

        // Simulate API call to get public challenges
        const mockPublicChallenges = generateMockChallenges(15, true)
        setPublicChallenges(mockPublicChallenges)

        // Simulate API call to get invitations
        const mockInvitations = generateMockInvitations(3)
        setInvitations(mockInvitations)

        // Set current user
        setCurrentUser({
            _id: "user-1",
            username: "johndoe42",
            firstName: "John",
            lastName: "Doe",
            avatarUrl: "/placeholder.svg?height=100&width=100&text=JD",
            preferredMode: "walk",
            dailyGoal: 10000,
            dailyProgress: 65,
            totalSteps: 1250000,
            totalXP: 25000,
            streak: {
                current: 12,
                max: 30
            }
        })

        // Set friends
        setFriends(generateMockFriends(10))
    }, [])

    // Filter challenges based on current filters and search
    const filteredChallenges = () => {
        let filtered = [...challenges]

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (challenge) =>
                    challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply type filter
        if (filterType !== "all") {
            filtered = filtered.filter((challenge) => challenge.goalType === filterType)
        }

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((challenge) => challenge.status === filterStatus)
        }

        // Sort challenges
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case "ending-soon":
                    return new Date(a.endDate) - new Date(b.endDate)
                case "progress":
                    return b.progress - a.progress
                case "participants":
                    return b.participants.length - a.participants.length
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt)
            }
        })

        return filtered
    }

    // Filter public challenges
    const filteredPublicChallenges = () => {
        let filtered = [...publicChallenges]

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (challenge) =>
                    challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply type filter
        if (filterType !== "all") {
            filtered = filtered.filter((challenge) => challenge.goalType === filterType)
        }

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((challenge) => challenge.status === filterStatus)
        }

        // Sort challenges
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case "ending-soon":
                    return new Date(a.endDate) - new Date(b.endDate)
                case "progress":
                    return b.progress - a.progress
                case "participants":
                    return b.participants.length - a.participants.length
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt)
            }
        })

        return filtered
    }

    // Generate mock challenges
    const generateMockChallenges = (count, isPublic = false) => {
        const challenges = []
        const challengeNames = [
            "Défi 10K Pas",
            "Marathon Hebdo",
            "Tour de Ville",
            "Défi Matinal",
            "Régularité 30 Jours",
            "Challenge Escaliers",
            "Défi Weekend",
            "Course Urbaine",
            "Randonnée Virtuelle",
            "Défi Calories",
            "Challenge Distance",
            "Défi Équipe",
            "Marche Quotidienne",
            "Sprint Final",
            "Exploration Urbaine"
        ]
        const descriptions = [
            "Atteignez 10 000 pas par jour pendant 7 jours consécutifs.",
            "Parcourez l'équivalent d'un marathon (42,2 km) en une semaine.",
            "Explorez 5 nouveaux lieux dans votre ville en marchant.",
            "Faites 5 000 pas avant 9h du matin pendant 5 jours.",
            "Atteignez votre objectif quotidien pendant 30 jours consécutifs.",
            "Montez l'équivalent de 100 étages en une semaine.",
            "Faites 25 000 pas pendant le weekend.",
            "Courez 5 km dans votre ville en moins de 30 minutes.",
            "Parcourez virtuellement un célèbre sentier de randonnée.",
            "Brûlez 5 000 calories en une semaine.",
            "Parcourez 100 km en un mois.",
            "Défi collectif : atteignez 1 million de pas en équipe.",
            "Faites au moins 8 000 pas chaque jour pendant 14 jours.",
            "Augmentez votre distance de marche de 10% chaque jour pendant une semaine.",
            "Visitez 10 points d'intérêt dans votre ville."
        ]
        const goalTypes = ["steps", "distance", "calories", "time"]
        const statuses = ["upcoming", "active", "completed"]

        for (let i = 0; i < count; i++) {
            const nameIndex = Math.floor(Math.random() * challengeNames.length)
            const descIndex = Math.floor(Math.random() * descriptions.length)
            const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)]
            const status = statuses[Math.floor(Math.random() * statuses.length)]

            // Generate random dates
            const now = new Date()
            let startDate, endDate

            if (status === "upcoming") {
                startDate = new Date(now.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
                endDate = new Date(startDate.getTime() + (7 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000)
            } else if (status === "active") {
                startDate = new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
                endDate = new Date(now.getTime() + (3 + Math.floor(Math.random() * 20)) * 24 * 60 * 60 * 1000)
            } else {
                endDate = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                startDate = new Date(endDate.getTime() - (7 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000)
            }

            // Generate goal value based on goal type
            let goalValue
            switch (goalType) {
                case "steps":
                    goalValue = (5 + Math.floor(Math.random() * 20)) * 1000 // 5,000 to 25,000 steps
                    break
                case "distance":
                    goalValue = 5 + Math.floor(Math.random() * 45) // 5 to 50 km
                    break
                case "calories":
                    goalValue = (5 + Math.floor(Math.random() * 15)) * 100 // 500 to 2,000 calories
                    break
                case "time":
                    goalValue = 30 + Math.floor(Math.random() * 270) // 30 to 300 minutes
                    break
                default:
                    goalValue = 10000
            }

            // Generate participants
            const participantCount = 3 + Math.floor(Math.random() * 18) // 3 to 20 participants
            const participants = []

            for (let j = 0; j < participantCount; j++) {
                const progress = Math.floor(Math.random() * 101) // 0 to 100%

                participants.push({
                    userId: `user-${j + 1}`,
                    username: `user${j + 1}`,
                    firstName: ["John", "Jane", "Mike", "Sarah", "David", "Emma", "Thomas", "Sophie"][Math.floor(Math.random() * 8)],
                    lastName: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia"][Math.floor(Math.random() * 8)],
                    avatarUrl: `/placeholder.svg?height=100&width=100&text=${j + 1}`,
                    progress: progress,
                    joinedAt: new Date(startDate.getTime() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
                    value: Math.floor((goalValue * progress) / 100), // Current value based on progress
                    rank: j + 1
                })
            }

            // Sort participants by progress
            participants.sort((a, b) => b.progress - a.progress)

            // Update ranks after sorting
            participants.forEach((participant, index) => {
                participant.rank = index + 1
            })

            // Create challenge object
            challenges.push({
                _id: `challenge-${i + 1}`,
                name: challengeNames[nameIndex],
                description: descriptions[descIndex],
                goalType: goalType,
                goalValue: goalValue,
                startDate: startDate,
                endDate: endDate,
                status: status,
                isPrivate: isPublic ? false : Math.random() > 0.7, // 30% chance of being private for user challenges, 0% for public
                accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                createdBy: {
                    userId: `user-${Math.floor(Math.random() * 10) + 1}`,
                    username: `user${Math.floor(Math.random() * 10) + 1}`,
                    firstName: ["John", "Jane", "Mike", "Sarah", "David", "Emma", "Thomas", "Sophie"][Math.floor(Math.random() * 8)],
                    lastName: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia"][Math.floor(Math.random() * 8)],
                    avatarUrl: `/placeholder.svg?height=100&width=100&text=${Math.floor(Math.random() * 10) + 1}`
                },
                participants: participants,
                progress: status === "completed" ? 100 : Math.floor(Math.random() * 101), // 0 to 100%
                createdAt: new Date(startDate.getTime() - (1 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000)
            })
        }

        return challenges
    }

    // Generate mock invitations
    const generateMockInvitations = (count) => {
        const invitations = []
        const challengeNames = [
            "Défi Amical",
            "Challenge Équipe",
            "Compétition Hebdo",
            "Défi Surprise",
            "Marathon Virtuel"
        ]

        for (let i = 0; i < count; i++) {
            const now = new Date()
            const expiresAt = new Date(now.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)

            invitations.push({
                _id: `invitation-${i + 1}`,
                challengeId: `challenge-${i + 100}`,
                challengeName: challengeNames[Math.floor(Math.random() * challengeNames.length)],
                description: "Rejoignez ce défi pour comparer vos performances avec vos amis !",
                sentBy: {
                    userId: `user-${Math.floor(Math.random() * 10) + 1}`,
                    username: `user${Math.floor(Math.random() * 10) + 1}`,
                    firstName: ["John", "Jane", "Mike", "Sarah", "David"][Math.floor(Math.random() * 5)],
                    lastName: ["Smith", "Johnson", "Williams", "Brown", "Jones"][Math.floor(Math.random() * 5)],
                    avatarUrl: `/placeholder.svg?height=100&width=100&text=${Math.floor(Math.random() * 10) + 1}`
                },
                sentAt: new Date(now.getTime() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
                expiresAt: expiresAt,
                participants: 5 + Math.floor(Math.random() * 15) // 5 to 20 participants
            })
        }

        return invitations
    }

    // Generate mock friends
    const generateMockFriends = (count) => {
        const friends = []
        const firstNames = ["John", "Jane", "Mike", "Sarah", "David", "Emma", "Thomas", "Sophie", "Alex", "Lisa"]
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Wilson", "Taylor"]

        for (let i = 0; i < count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

            friends.push({
                _id: `user-${i + 2}`, // Start from 2 since user-1 is current user
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
                firstName: firstName,
                lastName: lastName,
                avatarUrl: `/placeholder.svg?height=100&width=100&text=${firstName[0]}${lastName[0]}`,
                status: ["En ligne", "Hors ligne", "Inactif"][Math.floor(Math.random() * 3)]
            })
        }

        return friends
    }

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

    // Format goal value based on goal type
    const formatGoalValue = (value, type) => {
        switch (type) {
            case "steps":
                return `${value.toLocaleString("fr-FR")} pas`
            case "distance":
                return `${value} km`
            case "calories":
                return `${value.toLocaleString("fr-FR")} calories`
            case "time":
                return `${value} minutes`
            default:
                return value.toLocaleString("fr-FR")
        }
    }

    // Get goal type icon
    const getGoalTypeIcon = (type) => {
        switch (type) {
            case "steps":
                return <Trophy size={16} />
            case "distance":
                return <MapPin size={16} />
            case "calories":
                return <Zap size={16} />
            case "time":
                return <Clock size={16} />
            default:
                return <Target size={16} />
        }
    }

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "upcoming":
                return <span className="status-badge upcoming"><Calendar size={12} /> À venir</span>
            case "active":
                return <span className="status-badge active"><Zap size={12} /> En cours</span>
            case "completed":
                return <span className="status-badge completed"><Check size={12} /> Terminé</span>
            default:
                return null
        }
    }

    // Handle challenge click
    const handleChallengeClick = (challenge) => {
        setSelectedChallenge(challenge)
        setShowChallengeModal(true)
    }

    // Handle join challenge
    const handleJoinChallenge = (challengeId) => {
        alert(`Vous avez rejoint le défi ${challengeId}`)
        // In a real app, this would send an API request
    }

    // Handle leave challenge
    const handleLeaveChallenge = (challengeId) => {
        if (window.confirm("Êtes-vous sûr de vouloir quitter ce défi ?")) {
            alert(`Vous avez quitté le défi ${challengeId}`)
            // In a real app, this would send an API request
        }
    }

    // Handle join private challenge
    const handleJoinPrivateChallenge = (e) => {
        e.preventDefault()
        alert(`Tentative de rejoindre un défi privé avec le code: ${accessCode}`)
        setAccessCode("")
        setShowJoinModal(false)
        // In a real app, this would send an API request
    }

    // Handle create challenge
    const handleCreateChallenge = (e) => {
        e.preventDefault()
        alert(`Défi créé: ${newChallenge.name}`)
        setNewChallenge({
            name: "",
            description: "",
            startDate: "",
            endDate: "",
            goalType: "steps",
            goalValue: 10000,
            isPrivate: false,
            accessCode: "",
            invitedFriends: []
        })
        setShowCreateModal(false)
        // In a real app, this would send an API request
    }

    // Handle accept invitation
    const handleAcceptInvitation = (invitationId) => {
        alert(`Invitation ${invitationId} acceptée`)
        // In a real app, this would send an API request
    }

    // Handle decline invitation
    const handleDeclineInvitation = (invitationId) => {
        alert(`Invitation ${invitationId} refusée`)
        // In a real app, this would send an API request
    }

    // Generate progress chart data
    const generateProgressChartData = (challenge) => {
        // Get last 7 days or days since challenge started
        const now = new Date()
        const startDate = new Date(challenge.startDate)
        const days = Math.min(7, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)))

        const labels = Array.from({ length: days }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (days - 1 - i))
            return date.toLocaleDateString("fr-FR", { weekday: "short" })
        })

        // Generate random progress data
        const progressData = labels.map((_, i) => {
            // Progress increases over time
            const baseProgress = (i / (days - 1)) * challenge.progress
            return Math.min(100, Math.max(0, baseProgress * (0.8 + Math.random() * 0.4)))
        })

        return {
            labels,
            datasets: [
                {
                    label: "Progression (%)",
                    data: progressData,
                    backgroundColor: "rgba(74, 145, 158, 0.2)",
                    borderColor: "rgba(74, 145, 158, 1)",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                },
            ],
        }
    }

    // Generate participants distribution chart data
    const generateParticipantsChartData = (challenge) => {
        // Group participants by progress ranges
        const ranges = [
            { label: "0-25%", count: 0 },
            { label: "26-50%", count: 0 },
            { label: "51-75%", count: 0 },
            { label: "76-100%", count: 0 }
        ]

        challenge.participants.forEach(participant => {
            if (participant.progress <= 25) {
                ranges[0].count++
            } else if (participant.progress <= 50) {
                ranges[1].count++
            } else if (participant.progress <= 75) {
                ranges[2].count++
            } else {
                ranges[3].count++
            }
        })

        return {
            labels: ranges.map(r => r.label),
            datasets: [
                {
                    data: ranges.map(r => r.count),
                    backgroundColor: [
                        "rgba(206, 106, 107, 0.7)",
                        "rgba(235, 172, 162, 0.7)",
                        "rgba(190, 211, 195, 0.7)",
                        "rgba(74, 145, 158, 0.7)"
                    ],
                    borderColor: [
                        "rgba(206, 106, 107, 1)",
                        "rgba(235, 172, 162, 1)",
                        "rgba(190, 211, 195, 1)",
                        "rgba(74, 145, 158, 1)"
                    ],
                    borderWidth: 1,
                },
            ],
        }
    }

    // Chart options
    const lineChartOptions = {
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
                max: 100,
                ticks: {
                    callback: (value) => `${value}%`
                }
            },
        },
    }

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    boxWidth: 15,
                    padding: 15
                }
            },
        },
    }

    // Get tab content based on active tab
    const getTabContent = () => {
        switch (activeTab) {
            case "my-challenges":
                return (
                    <div className="challenges-my-tab">
                        {filteredChallenges().length > 0 ? (
                            <div className="challenges-grid">
                                {filteredChallenges().map((challenge) => (
                                    <div
                                        key={challenge._id}
                                        className={`challenge-card ${challenge.status}`}
                                        onClick={() => handleChallengeClick(challenge)}
                                    >
                                        <div className="challenge-header">
                                            <h3>{challenge.name}</h3>
                                            <div className="challenge-badges">
                                                {getStatusBadge(challenge.status)}
                                                {challenge.isPrivate && (
                                                    <span className="privacy-badge">
                                                        <Lock size={12} /> Privé
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="challenge-description">{challenge.description}</p>

                                        <div className="challenge-meta">
                                            <div className="challenge-goal">
                                                <span className="meta-label">Objectif:</span>
                                                <span className="meta-value">
                                                    {getGoalTypeIcon(challenge.goalType)}
                                                    {formatGoalValue(challenge.goalValue, challenge.goalType)}
                                                </span>
                                            </div>

                                            <div className="challenge-dates">
                                                <span className="meta-label">Période:</span>
                                                <span className="meta-value">
                                                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                                </span>
                                            </div>

                                            <div className="challenge-participants-count">
                                                <span className="meta-label">Participants:</span>
                                                <span className="meta-value">
                                                    <Users size={16} />
                                                    {challenge.participants.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="challenge-progress-section">
                                            <div className="progress-header">
                                                <span>Progression</span>
                                                <span>{challenge.progress}%</span>
                                            </div>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${challenge.progress}%` }}
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
                                            >
                                                <Info size={16} />
                                                <span>Voir les détails</span>
                                            </button>

                                            {challenge.status !== "completed" && (
                                                <button
                                                    className="action-button secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLeaveChallenge(challenge._id);
                                                    }}
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
                        {filteredPublicChallenges().length > 0 ? (
                            <div className="challenges-grid">
                                {filteredPublicChallenges().map((challenge) => (
                                    <div
                                        key={challenge._id}
                                        className={`challenge-card ${challenge.status}`}
                                        onClick={() => handleChallengeClick(challenge)}
                                    >
                                        <div className="challenge-header">
                                            <h3>{challenge.name}</h3>
                                            <div className="challenge-badges">
                                                {getStatusBadge(challenge.status)}
                                                {new Date(challenge.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                                    <span className="new-badge">
                                                        <Star size={12} /> Nouveau
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="challenge-description">{challenge.description}</p>

                                        <div className="challenge-meta">
                                            <div className="challenge-goal">
                                                <span className="meta-label">Objectif:</span>
                                                <span className="meta-value">
                                                    {getGoalTypeIcon(challenge.goalType)}
                                                    {formatGoalValue(challenge.goalValue, challenge.goalType)}
                                                </span>
                                            </div>

                                            <div className="challenge-dates">
                                                <span className="meta-label">Période:</span>
                                                <span className="meta-value">
                                                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                                </span>
                                            </div>

                                            <div className="challenge-participants-count">
                                                <span className="meta-label">Participants:</span>
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
                                                    src={challenge.createdBy.avatarUrl || "/placeholder.svg"}
                                                    alt={challenge.createdBy.username}
                                                    className="creator-avatar"
                                                />
                                                <span className="creator-name">
                                                    {challenge.createdBy.firstName} {challenge.createdBy.lastName}
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
                        {invitations.length > 0 ? (
                            <div className="invitations-list">
                                {invitations.map((invitation) => (
                                    <div key={invitation._id} className="invitation-card">
                                        <div className="invitation-header">
                                            <div className="invitation-title">
                                                <h3>{invitation.challengeName}</h3>
                                                {new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                                                    <span className="expiring-badge">
                                                        <AlertTriangle size={12} /> Expire bientôt
                                                    </span>
                                                )}
                                            </div>
                                            <p className="invitation-description">{invitation.description}</p>
                                        </div>

                                        <div className="invitation-details">
                                            <div className="invitation-sender">
                                                <span className="detail-label">Invité par:</span>
                                                <div className="sender-info">
                                                    <img
                                                        src={invitation.sentBy.avatarUrl || "/placeholder.svg"}
                                                        alt={invitation.sentBy.username}
                                                        className="sender-avatar"
                                                    />
                                                    <span className="sender-name">
                                                        {invitation.sentBy.firstName} {invitation.sentBy.lastName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="invitation-meta">
                                                <div className="invitation-date">
                                                    <span className="detail-label">Reçu le:</span>
                                                    <span className="detail-value">{formatDate(invitation.sentAt)}</span>
                                                </div>

                                                <div className="invitation-expiry">
                                                    <span className="detail-label">Expire le:</span>
                                                    <span className="detail-value">{formatDate(invitation.expiresAt)}</span>
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
                                                onClick={() => handleAcceptInvitation(invitation._id)}
                                            >
                                                <Check size={16} />
                                                <span>Accepter</span>
                                            </button>

                                            <button
                                                className="action-button secondary"
                                                onClick={() => handleDeclineInvitation(invitation._id)}
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
                                            value={newChallenge.name}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="challenge-description">Description</label>
                                        <textarea
                                            id="challenge-description"
                                            placeholder="Décrivez votre défi en quelques mots..."
                                            value={newChallenge.description}
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
                                            <select
                                                id="goal-type"
                                                value={newChallenge.goalType}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goalType: e.target.value })}
                                                required
                                            >
                                                <option value="steps">Pas</option>
                                                <option value="distance">Distance (km)</option>
                                                <option value="calories">Calories</option>
                                                <option value="time">Temps (minutes)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="goal-value">Valeur de l'objectif *</label>
                                            <input
                                                type="number"
                                                id="goal-value"
                                                min={1}
                                                value={newChallenge.goalValue}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goalValue: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Visibilité et participants</h3>

                                    <div className="form-group">
                                        <div className="toggle-group">
                                            <label htmlFor="is-private">Défi privé</label>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    id="is-private"
                                                    checked={newChallenge.isPrivate}
                                                    onChange={(e) => setNewChallenge({ ...newChallenge, isPrivate: e.target.checked })}
                                                />
                                                <span className="toggle-slider"></span>
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
                                                {friends.slice(0, 5).map((friend) => (
                                                    <div key={friend._id} className="friend-option">
                                                        <input
                                                            type="checkbox"
                                                            id={`friend-${friend._id}`}
                                                            checked={newChallenge.invitedFriends.includes(friend._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewChallenge({
                                                                        ...newChallenge,
                                                                        invitedFriends: [...newChallenge.invitedFriends, friend._id]
                                                                    });
                                                                } else {
                                                                    setNewChallenge({
                                                                        ...newChallenge,
                                                                        invitedFriends: newChallenge.invitedFriends.filter(id => id !== friend._id)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`friend-${friend._id}`} className="friend-label">
                                                            <img
                                                                src={friend.avatarUrl || "/placeholder.svg"}
                                                                alt={friend.username}
                                                                className="friend-avatar"
                                                            />
                                                            <span className="friend-name">
                                                                {friend.firstName} {friend.lastName}
                                                            </span>
                                                        </label>
                                                    </div>
                                                ))}
                                                {friends.length > 5 && (
                                                    <button type="button" className="show-more-friends">
                                                        + {friends.length - 5} autres amis
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
                                                goalType: "steps",
                                                goalValue: 10000,
                                                isPrivate: false,
                                                accessCode: "",
                                                invitedFriends: []
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

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-section">
                        <h3>Trier par</h3>
                        <div className="filter-options">
                            <button
                                className={sortBy === "recent" ? "active" : ""}
                                onClick={() => setSortBy("recent")}
                            >
                                <Calendar size={16} />
                                <span>Plus récents</span>
                            </button>
                            <button
                                className={sortBy === "ending-soon" ? "active" : ""}
                                onClick={() => setSortBy("ending-soon")}
                            >
                                <Clock size={16} />
                                <span>Se termine bientôt</span>
                            </button>
                            <button
                                className={sortBy === "progress" ? "active" : ""}
                                onClick={() => setSortBy("progress")}
                            >
                                <BarChart2 size={16} />
                                <span>Progression</span>
                            </button>
                            <button
                                className={sortBy === "participants" ? "active" : ""}
                                onClick={() => setSortBy("participants")}
                            >
                                <Users size={16} />
                                <span>Nombre de participants</span>
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Type d'objectif</h3>
                        <div className="filter-options">
                            <button
                                className={filterType === "all" ? "active" : ""}
                                onClick={() => setFilterType("all")}
                            >
                                <span>Tous</span>
                            </button>
                            <button
                                className={filterType === "steps" ? "active" : ""}
                                onClick={() => setFilterType("steps")}
                            >
                                <Trophy size={16} />
                                <span>Pas</span>
                            </button>
                            <button
                                className={filterType === "distance" ? "active" : ""}
                                onClick={() => setFilterType("distance")}
                            >
                                <MapPin size={16} />
                                <span>Distance</span>
                            </button>
                            <button
                                className={filterType === "calories" ? "active" : ""}
                                onClick={() => setFilterType("calories")}
                            >
                                <Zap size={16} />
                                <span>Calories</span>
                            </button>
                            <button
                                className={filterType === "time" ? "active" : ""}
                                onClick={() => setFilterType("time")}
                            >
                                <Clock size={16} />
                                <span>Temps</span>
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Statut</h3>
                        <div className="filter-options">
                            <button
                                className={filterStatus === "all" ? "active" : ""}
                                onClick={() => setFilterStatus("all")}
                            >
                                <span>Tous</span>
                            </button>
                            <button
                                className={filterStatus === "upcoming" ? "active" : ""}
                                onClick={() => setFilterStatus("upcoming")}
                            >
                                <Calendar size={16} />
                                <span>À venir</span>
                            </button>
                            <button
                                className={filterStatus === "active" ? "active" : ""}
                                onClick={() => setFilterStatus("active")}
                            >
                                <Zap size={16} />
                                <span>En cours</span>
                            </button>
                            <button
                                className={filterStatus === "completed" ? "active" : ""}
                                onClick={() => setFilterStatus("completed")}
                            >
                                <Check size={16} />
                                <span>Terminés</span>
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Recherche</h3>
                        <div className="search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher un défi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="clear-search"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    {invitations.length > 0 && (
                        <span className="badge">{invitations.length}</span>
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
                <div className="modal-overlay">
                    <div className="modal challenge-detail-modal">
                        <div className="modal-header">
                            <h3>Détails du défi</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowChallengeModal(false)
                                    setSelectedChallenge(null)
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="challenge-detail-content">
                            <div className="challenge-detail-header">
                                <div className="challenge-detail-title">
                                    <h2>{selectedChallenge.name}</h2>
                                    <div className="challenge-detail-badges">
                                        {getStatusBadge(selectedChallenge.status)}
                                        {selectedChallenge.isPrivate ? (
                                            <span className="privacy-badge">
                                                <Lock size={12} /> Privé
                                            </span>
                                        ) : (
                                            <span className="privacy-badge public">
                                                <Unlock size={12} /> Public
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="challenge-detail-description">{selectedChallenge.description}</p>
                            </div>

                            <div className="challenge-detail-info">
                                <div className="info-section">
                                    <h4>Informations générales</h4>

                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Créé par</span>
                                            <div className="creator-info">
                                                <img
                                                    src={selectedChallenge.createdBy.avatarUrl || "/placeholder.svg"}
                                                    alt={selectedChallenge.createdBy.username}
                                                    className="creator-avatar"
                                                />
                                                <span className="creator-name">
                                                    {selectedChallenge.createdBy.firstName} {selectedChallenge.createdBy.lastName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-label">Dates</span>
                                            <span className="info-value">
                                                <CalendarIcon size={16} />
                                                {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
                                            </span>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-label">Objectif</span>
                                            <span className="info-value">
                                                {getGoalTypeIcon(selectedChallenge.goalType)}
                                                {formatGoalValue(selectedChallenge.goalValue, selectedChallenge.goalType)}
                                            </span>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-label">Participants</span>
                                            <span className="info-value">
                                                <Users size={16} />
                                                {selectedChallenge.participants.length} participants
                                            </span>
                                        </div>

                                        {selectedChallenge.status === "active" && (
                                            <div className="info-item">
                                                <span className="info-label">Temps restant</span>
                                                <span className="info-value">
                                                    <Clock size={16} />
                                                    {getDaysRemaining(selectedChallenge.endDate) > 0
                                                        ? `${getDaysRemaining(selectedChallenge.endDate)} jours`
                                                        : "Dernier jour !"}
                                                </span>
                                            </div>
                                        )}

                                        {selectedChallenge.isPrivate && (
                                            <div className="info-item">
                                                <span className="info-label">Code d'accès</span>
                                                <span className="info-value code">
                                                    <Hash size={16} />
                                                    {selectedChallenge.accessCode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4>Progression du défi</h4>

                                    <div className="challenge-progress-detail">
                                        <div className="progress-header">
                                            <span>Progression globale</span>
                                            <span>{selectedChallenge.progress}%</span>
                                        </div>
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${selectedChallenge.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="challenge-charts">
                                        <div className="chart-container">
                                            <h5>Évolution de la progression</h5>
                                            <div className="chart" style={{ height: "200px" }}>
                                                <Line
                                                    data={generateProgressChartData(selectedChallenge)}
                                                    options={lineChartOptions}
                                                />
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <h5>Répartition des participants</h5>
                                            <div className="chart" style={{ height: "200px" }}>
                                                <Pie
                                                    data={generateParticipantsChartData(selectedChallenge)}
                                                    options={pieChartOptions}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4>Classement des participants</h4>

                                    <div className="participants-list">
                                        {selectedChallenge.participants.slice(0, 10).map((participant, index) => (
                                            <div
                                                key={participant.userId}
                                                className={`participant-item ${participant.userId === currentUser?._id ? "current-user" : ""
                                                    }`}
                                            >
                                                <div className="participant-rank">
                                                    {index === 0 ? (
                                                        <Crown size={16} className="rank-icon gold" />
                                                    ) : index === 1 ? (
                                                        <Medal size={16} className="rank-icon silver" />
                                                    ) : index === 2 ? (
                                                        <Award size={16} className="rank-icon bronze" />
                                                    ) : (
                                                        <span className="rank-number">{index + 1}</span>
                                                    )}
                                                </div>

                                                <div className="participant-avatar">
                                                    <img
                                                        src={participant.avatarUrl || "/placeholder.svg"}
                                                        alt={participant.username}
                                                    />
                                                </div>

                                                <div className="participant-info">
                                                    <span className="participant-name">
                                                        {participant.firstName} {participant.lastName}
                                                    </span>
                                                    <span className="participant-username">@{participant.username}</span>
                                                </div>

                                                <div className="participant-progress-container">
                                                    <div className="participant-value">
                                                        {formatGoalValue(participant.value, selectedChallenge.goalType)}
                                                    </div>
                                                    <div className="progress-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{ width: `${participant.progress}%` }}
                                                        ></div>
                                                        <span className="progress-text">{participant.progress}%</span>
                                                    </div>
                                                </div>

                                                {participant.userId !== currentUser?._id && (
                                                    <div className="participant-actions">
                                                        <button
                                                            className="action-icon-button"
                                                            title="Envoyer un message"
                                                        >
                                                            <MessageSquare size={16} />
                                                        </button>
                                                        <button
                                                            className="action-icon-button"
                                                            title="Ajouter en ami"
                                                        >
                                                            <UserPlus size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {selectedChallenge.participants.length > 10 && (
                                            <button className="show-more-button">
                                                Voir tous les participants ({selectedChallenge.participants.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="challenge-detail-actions">
                                {selectedChallenge.status !== "completed" && (
                                    <>
                                        <button className="action-button primary">
                                            <Share2 size={16} />
                                            <span>Partager</span>
                                        </button>

                                        <button
                                            className="action-button secondary"
                                            onClick={() => handleLeaveChallenge(selectedChallenge._id)}
                                        >
                                            <X size={16} />
                                            <span>Quitter ce défi</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Private Challenge Modal */}
            {showJoinModal && (
                <div className="modal-overlay">
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
                <div className="modal-overlay">
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
                                            value={newChallenge.name}
                                            onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="modal-challenge-description">Description</label>
                                        <textarea
                                            id="modal-challenge-description"
                                            placeholder="Décrivez votre défi en quelques mots..."
                                            value={newChallenge.description}
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
                                            <select
                                                id="modal-goal-type"
                                                value={newChallenge.goalType}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goalType: e.target.value })}
                                                required
                                            >
                                                <option value="steps">Pas</option>
                                                <option value="distance">Distance (km)</option>
                                                <option value="calories">Calories</option>
                                                <option value="time">Temps (minutes)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="modal-goal-value">Valeur de l'objectif *</label>
                                            <input
                                                type="number"
                                                id="modal-goal-value"
                                                min={1}
                                                value={newChallenge.goalValue}
                                                onChange={(e) => setNewChallenge({ ...newChallenge, goalValue: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Visibilité</h4>

                                    <div className="form-group">
                                        <div className="toggle-group">
                                            <label htmlFor="modal-is-private">Défi privé</label>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    id="modal-is-private"
                                                    checked={newChallenge.isPrivate}
                                                    onChange={(e) => setNewChallenge({ ...newChallenge, isPrivate: e.target.checked })}
                                                />
                                                <span className="toggle-slider"></span>
                                            </div>
                                        </div>
                                        <p className="form-help-text">
                                            {newChallenge.isPrivate
                                                ? "Seuls les utilisateurs invités pourront rejoindre ce défi."
                                                : "Tous les utilisateurs pourront voir et rejoindre ce défi."}
                                        </p>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="action-button primary">
                                        <Flag size={16} />
                                        <span>Créer le défi</span>
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
