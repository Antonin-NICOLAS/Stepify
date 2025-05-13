import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import {
    Trophy, Medal, Star, Filter, Search, ChevronDown, ChevronUp, Clock, Award, Target,
    Zap, Users, Info, X, ArrowUp, BarChart2, Flame, Gift, Crown, Bookmark, BookmarkPlus, Share2,
} from "lucide-react"
import { Pie, Bar } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import "./Rewards.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const Rewards = () => {
    const { theme } = useTheme();
    const [noir, setNoir] = useState(getCssVar('--Noir'));
    // State for active tab
    const [activeTab, setActiveTab] = useState("dashboard")

    // State for filters
    const [filters, setFilters] = useState({
        type: "all",
        tier: "all",
        status: "all",
        search: "",
    })

    // State for sort
    const [sortBy, setSortBy] = useState("progress")

    // State for show filters
    const [showFilters, setShowFilters] = useState(false)

    // State for rewards data
    const [rewards, setRewards] = useState([])
    const [userRewards, setUserRewards] = useState([])
    const [rewardStats, setRewardStats] = useState({
        total: 0,
        unlocked: 0,
        percentage: 0,
        byType: {},
        byTier: {},
        recentlyUnlocked: null,
        nextToUnlock: null,
    })

    // State for showcase
    const [showcaseRewards, setShowcaseRewards] = useState([])

    // State for reward detail modal
    const [selectedReward, setSelectedReward] = useState(null)
    const [showRewardModal, setShowRewardModal] = useState(false)

    // State for animation
    const [animateReward, setAnimateReward] = useState(null)

    // Refs for animations
    const confettiRef = useRef(null)

    // Load mock data
    useEffect(() => {
        // Simulate API call to get rewards data
        const mockRewards = generateMockRewards()
        setRewards(mockRewards)

        // Simulate user's unlocked rewards
        const mockUserRewards = generateMockUserRewards(mockRewards)
        setUserRewards(mockUserRewards)

        // Calculate stats
        calculateRewardStats(mockRewards, mockUserRewards)

        // Set initial showcase rewards (top 3 rarest)
        const initialShowcase = mockUserRewards
            .filter((reward) => reward.unlocked)
            .sort((a, b) => {
                // Sort by rarity (lower percentage = more rare)
                return a.unlockedPercentage - b.unlockedPercentage
            })
            .slice(0, 3)

        setShowcaseRewards(initialShowcase)
    }, [])

    useEffect(() => {
        // force une mise à jour après changement du theme
        const timeout = setTimeout(() => {
            setNoir(getCssVar('--Noir'));
        }, 0);
        return () => clearTimeout(timeout);
    }, [theme]);

    function getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    // Calculate reward statistics
    const calculateRewardStats = (allRewards, userRewards) => {
        const total = allRewards.length
        const unlocked = userRewards.filter((r) => r.unlocked).length
        const percentage = Math.round((unlocked / total) * 100)

        // Group by type
        const byType = {}
        const byTier = {}

        allRewards.forEach((reward) => {
            // Count by type
            if (!byType[reward.criteria]) {
                byType[reward.criteria] = {
                    total: 0,
                    unlocked: 0,
                }
            }
            byType[reward.criteria].total += 1

            // Count by tier
            if (!byTier[reward.tier]) {
                byTier[reward.tier] = {
                    total: 0,
                    unlocked: 0,
                }
            }
            byTier[reward.tier].total += 1
        })

        userRewards.forEach((reward) => {
            if (reward.unlocked) {
                byType[reward.criteria].unlocked += 1
                byTier[reward.tier].unlocked += 1
            }
        })

        // Find recently unlocked reward
        const recentlyUnlocked = userRewards
            .filter((r) => r.unlocked)
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))[0]

        // Find next reward to unlock (closest to completion)
        const nextToUnlock = userRewards
            .filter((r) => !r.unlocked && r.progress > 0)
            .sort((a, b) => b.progress - a.progress)[0]

        setRewardStats({
            total,
            unlocked,
            percentage,
            byType,
            byTier,
            recentlyUnlocked,
            nextToUnlock,
        })
    }

    // Filter rewards based on current filters
    const filteredRewards = () => {
        return userRewards.filter((reward) => {
            // Filter by search
            if (
                filters.search &&
                !reward.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !reward.description.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false
            }

            // Filter by type
            if (filters.type !== "all" && reward.criteria !== filters.type) {
                return false
            }

            // Filter by tier
            if (filters.tier !== "all" && reward.tier !== filters.tier) {
                return false
            }

            // Filter by status
            if (filters.status === "unlocked" && !reward.unlocked) {
                return false
            }
            if (filters.status === "locked" && reward.unlocked) {
                return false
            }

            return true
        })
    }

    // Sort filtered rewards
    const sortedRewards = () => {
        const filtered = filteredRewards()

        switch (sortBy) {
            case "name":
                return filtered.sort((a, b) => a.name.localeCompare(b.name))
            case "progress":
                return filtered.sort((a, b) => {
                    // Unlocked rewards first, then by progress
                    if (a.unlocked && !b.unlocked) return -1
                    if (!a.unlocked && b.unlocked) return 1
                    return b.progress - a.progress
                })
            case "tier":
                const tierOrder = {
                    bronze: 1,
                    silver: 2,
                    gold: 3,
                    platinium: 4,
                    ruby: 5,
                    sapphire: 6,
                    diamond: 7,
                }
                return filtered.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier])
            case "date":
                return filtered.sort((a, b) => {
                    if (!a.unlocked && !b.unlocked) return b.progress - a.progress
                    if (!a.unlocked) return 1
                    if (!b.unlocked) return -1
                    return new Date(b.unlockedAt) - new Date(a.unlockedAt)
                })
            case "rarity":
                return filtered.sort((a, b) => a.unlockedPercentage - b.unlockedPercentage)
            default:
                return filtered
        }
    }

    // Handle reward click
    const handleRewardClick = (reward) => {
        setSelectedReward(reward)
        setShowRewardModal(true)
    }

    // Handle adding/removing reward from showcase
    const handleToggleShowcase = (reward) => {
        if (showcaseRewards.some((r) => r._id === reward._id)) {
            // Remove from showcase
            setShowcaseRewards(showcaseRewards.filter((r) => r._id !== reward._id))
        } else {
            // Add to showcase (max 3)
            if (showcaseRewards.length < 3) {
                setShowcaseRewards([...showcaseRewards, reward])
            } else {
                alert("Vous ne pouvez mettre que 3 récompenses en vitrine. Veuillez en retirer une d'abord.")
            }
        }
    }

    // Handle reward animation
    const triggerRewardAnimation = (reward) => {
        setAnimateReward(reward)
        setTimeout(() => {
            setAnimateReward(null)
        }, 3000)
    }

    // Get criteria label
    const getCriteriaLabel = (criteria) => {
        switch (criteria) {
            case "steps":
                return "Pas"
            case "steps-time":
                return "Pas (Temps)"
            case "distance":
                return "Distance"
            case "distance-time":
                return "Distance (Temps)"
            case "calories":
                return "Calories"
            case "calories-time":
                return "Calories (Temps)"
            case "streak":
                return "Streak"
            case "level":
                return "Niveau"
            case "dailygoal-time":
                return "Objectif quotidien"
            case "customgoal":
                return "Objectif personnalisé"
            case "challenges":
                return "Défis"
            case "challenges-time":
                return "Défis (Temps)"
            case "rank":
                return "Classement"
            case "friend":
                return "Social"
            default:
                return criteria
        }
    }

    // Get criteria icon
    const getCriteriaIcon = (criteria) => {
        switch (criteria) {
            case "steps":
            case "steps-time":
                return <Trophy size={16} />
            case "distance":
            case "distance-time":
                return <Award size={16} />
            case "calories":
            case "calories-time":
                return <Flame size={16} />
            case "streak":
                return <Zap size={16} />
            case "level":
                return <Star size={16} />
            case "dailygoal-time":
            case "customgoal":
                return <Target size={16} />
            case "challenges":
            case "challenges-time":
                return <Gift size={16} />
            case "rank":
                return <Crown size={16} />
            case "friend":
                return <Users size={16} />
            default:
                return <Medal size={16} />
        }
    }

    // Get tier color class
    const getTierColorClass = (tier) => {
        switch (tier) {
            case "bronze":
                return "tier-bronze"
            case "silver":
                return "tier-silver"
            case "gold":
                return "tier-gold"
            case "platinium":
                return "tier-platinum"
            case "ruby":
                return "tier-ruby"
            case "sapphire":
                return "tier-sapphire"
            case "diamond":
                return "tier-diamond"
            default:
                return ""
        }
    }

    // Get tier label
    const getTierLabel = (tier) => {
        switch (tier) {
            case "bronze":
                return "Bronze"
            case "silver":
                return "Argent"
            case "gold":
                return "Or"
            case "platinium":
                return "Platine"
            case "ruby":
                return "Rubis"
            case "sapphire":
                return "Saphir"
            case "diamond":
                return "Diamant"
            default:
                return tier
        }
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    // Generate mock rewards data
    const generateMockRewards = () => {
        const rewards = []
        const criteriaTypes = [
            "steps",
            "steps-time",
            "distance",
            "distance-time",
            "calories",
            "calories-time",
            "streak",
            "level",
            "dailygoal-time",
            "customgoal",
            "challenges",
            "challenges-time",
            "rank",
            "friend",
        ]
        const tiers = ["bronze", "silver", "gold", "platinium", "ruby", "sapphire", "diamond"]

        // Step rewards
        rewards.push({
            _id: "reward-1",
            name: "Premiers Pas",
            description: "Atteindre 5 000 pas en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🚶",
            criteria: "steps",
            tier: "bronze",
            target: 5000,
            isRepeatable: false,
            unlockedPercentage: 85, // % of users who unlocked this
        })

        rewards.push({
            _id: "reward-2",
            name: "Marcheur Régulier",
            description: "Atteindre 10 000 pas en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🚶",
            criteria: "steps",
            tier: "silver",
            target: 10000,
            isRepeatable: false,
            unlockedPercentage: 65,
        })

        rewards.push({
            _id: "reward-3",
            name: "Marcheur d'Élite",
            description: "Atteindre 20 000 pas en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🚶",
            criteria: "steps",
            tier: "gold",
            target: 20000,
            isRepeatable: false,
            unlockedPercentage: 35,
        })

        rewards.push({
            _id: "reward-4",
            name: "Marathonien",
            description: "Atteindre 40 000 pas en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🏃",
            criteria: "steps",
            tier: "platinium",
            target: 40000,
            isRepeatable: false,
            unlockedPercentage: 12,
        })

        // Distance rewards
        rewards.push({
            _id: "reward-5",
            name: "Première Distance",
            description: "Parcourir 5 km en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=📏",
            criteria: "distance",
            tier: "bronze",
            target: 5,
            isRepeatable: false,
            unlockedPercentage: 80,
        })

        rewards.push({
            _id: "reward-6",
            name: "Explorateur",
            description: "Parcourir 10 km en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=📏",
            criteria: "distance",
            tier: "silver",
            target: 10,
            isRepeatable: false,
            unlockedPercentage: 60,
        })

        rewards.push({
            _id: "reward-7",
            name: "Grand Voyageur",
            description: "Parcourir 20 km en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🌍",
            criteria: "distance",
            tier: "gold",
            target: 20,
            isRepeatable: false,
            unlockedPercentage: 30,
        })

        // Streak rewards
        rewards.push({
            _id: "reward-8",
            name: "Première Série",
            description: "Maintenir une série de 3 jours consécutifs",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🔥",
            criteria: "streak",
            tier: "bronze",
            target: 3,
            isRepeatable: false,
            unlockedPercentage: 75,
        })

        rewards.push({
            _id: "reward-9",
            name: "Série Hebdomadaire",
            description: "Maintenir une série de 7 jours consécutifs",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🔥",
            criteria: "streak",
            tier: "silver",
            target: 7,
            isRepeatable: false,
            unlockedPercentage: 50,
        })

        rewards.push({
            _id: "reward-10",
            name: "Série Mensuelle",
            description: "Maintenir une série de 30 jours consécutifs",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🔥",
            criteria: "streak",
            tier: "gold",
            target: 30,
            isRepeatable: false,
            unlockedPercentage: 15,
        })

        // Calories rewards
        rewards.push({
            _id: "reward-11",
            name: "Première Combustion",
            description: "Brûler 300 calories en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🔥",
            criteria: "calories",
            tier: "bronze",
            target: 300,
            isRepeatable: false,
            unlockedPercentage: 70,
        })

        rewards.push({
            _id: "reward-12",
            name: "Brûleur Actif",
            description: "Brûler 500 calories en une journée",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🔥",
            criteria: "calories",
            tier: "silver",
            target: 500,
            isRepeatable: false,
            unlockedPercentage: 45,
        })

        // Challenge rewards
        rewards.push({
            _id: "reward-13",
            name: "Premier Défi",
            description: "Compléter votre premier défi",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🎯",
            criteria: "challenges",
            tier: "bronze",
            target: 1,
            isRepeatable: false,
            unlockedPercentage: 65,
        })

        rewards.push({
            _id: "reward-14",
            name: "Maître des Défis",
            description: "Compléter 10 défis",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🎯",
            criteria: "challenges",
            tier: "gold",
            target: 10,
            isRepeatable: false,
            unlockedPercentage: 25,
        })

        // Social rewards
        rewards.push({
            _id: "reward-15",
            name: "Première Connexion",
            description: "Ajouter votre premier ami",
            iconUrl: "/placeholder.svg?height=100&width=100&text=👥",
            criteria: "friend",
            tier: "bronze",
            target: 1,
            isRepeatable: false,
            unlockedPercentage: 60,
        })

        rewards.push({
            _id: "reward-16",
            name: "Cercle Social",
            description: "Avoir 5 amis actifs",
            iconUrl: "/placeholder.svg?height=100&width=100&text=👥",
            criteria: "friend",
            tier: "silver",
            target: 5,
            isRepeatable: false,
            unlockedPercentage: 40,
        })

        // Rank rewards
        rewards.push({
            _id: "reward-17",
            name: "Top 50",
            description: "Atteindre le top 50 du classement",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🏆",
            criteria: "rank",
            tier: "bronze",
            target: 50,
            isRepeatable: false,
            unlockedPercentage: 50,
        })

        rewards.push({
            _id: "reward-18",
            name: "Top 10",
            description: "Atteindre le top 10 du classement",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🏆",
            criteria: "rank",
            tier: "gold",
            target: 10,
            isRepeatable: false,
            unlockedPercentage: 10,
        })

        rewards.push({
            _id: "reward-19",
            name: "Champion",
            description: "Atteindre la première place du classement",
            iconUrl: "/placeholder.svg?height=100&width=100&text=👑",
            criteria: "rank",
            tier: "diamond",
            target: 1,
            isRepeatable: false,
            unlockedPercentage: 1,
        })

        // Time-based rewards
        rewards.push({
            _id: "reward-20",
            name: "Sprint Hebdomadaire",
            description: "Faire 70 000 pas en une semaine",
            iconUrl: "/placeholder.svg?height=100&width=100&text=⏱️",
            criteria: "steps-time",
            tier: "silver",
            target: 70000,
            isRepeatable: true,
            unlockedPercentage: 55,
        })

        rewards.push({
            _id: "reward-21",
            name: "Explorateur Mensuel",
            description: "Parcourir 100 km en un mois",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🗺️",
            criteria: "distance-time",
            tier: "gold",
            target: 100,
            isRepeatable: true,
            unlockedPercentage: 30,
        })

        // Level rewards
        rewards.push({
            _id: "reward-22",
            name: "Débutant",
            description: "Atteindre le niveau 5",
            iconUrl: "/placeholder.svg?height=100&width=100&text=⭐",
            criteria: "level",
            tier: "bronze",
            target: 5,
            isRepeatable: false,
            unlockedPercentage: 85,
        })

        rewards.push({
            _id: "reward-23",
            name: "Intermédiaire",
            description: "Atteindre le niveau 15",
            iconUrl: "/placeholder.svg?height=100&width=100&text=⭐",
            criteria: "level",
            tier: "silver",
            target: 15,
            isRepeatable: false,
            unlockedPercentage: 60,
        })

        rewards.push({
            _id: "reward-24",
            name: "Expert",
            description: "Atteindre le niveau 30",
            iconUrl: "/placeholder.svg?height=100&width=100&text=⭐",
            criteria: "level",
            tier: "gold",
            target: 30,
            isRepeatable: false,
            unlockedPercentage: 25,
        })

        rewards.push({
            _id: "reward-25",
            name: "Maître",
            description: "Atteindre le niveau 50",
            iconUrl: "/placeholder.svg?height=100&width=100&text=⭐",
            criteria: "level",
            tier: "platinium",
            target: 50,
            isRepeatable: false,
            unlockedPercentage: 10,
        })

        // Daily goal rewards
        rewards.push({
            _id: "reward-26",
            name: "Objectif Hebdomadaire",
            description: "Atteindre votre objectif quotidien 7 jours de suite",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🎯",
            criteria: "dailygoal-time",
            tier: "silver",
            target: 7,
            isRepeatable: true,
            unlockedPercentage: 45,
        })

        rewards.push({
            _id: "reward-27",
            name: "Objectif Mensuel",
            description: "Atteindre votre objectif quotidien 30 jours de suite",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🎯",
            criteria: "dailygoal-time",
            tier: "gold",
            target: 30,
            isRepeatable: true,
            unlockedPercentage: 15,
        })

        // Hidden rewards
        rewards.push({
            _id: "reward-28",
            name: "Noctambule",
            description: "Faire 1000 pas entre minuit et 5h du matin",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🌙",
            criteria: "steps",
            tier: "sapphire",
            target: 1000,
            isRepeatable: false,
            unlockedPercentage: 8,
            isHidden: true,
        })

        rewards.push({
            _id: "reward-29",
            name: "Aventurier Pluvieux",
            description: "Faire 5000 pas un jour de pluie",
            iconUrl: "/placeholder.svg?height=100&width=100&text=☔",
            criteria: "steps",
            tier: "ruby",
            target: 5000,
            isRepeatable: false,
            unlockedPercentage: 20,
            isHidden: true,
        })

        rewards.push({
            _id: "reward-30",
            name: "Globetrotter",
            description: "Parcourir 1000 km au total",
            iconUrl: "/placeholder.svg?height=100&width=100&text=🌎",
            criteria: "distance",
            tier: "diamond",
            target: 1000,
            isRepeatable: false,
            unlockedPercentage: 5,
        })

        return rewards
    }

    // Generate mock user rewards
    const generateMockUserRewards = (allRewards) => {
        return allRewards.map((reward) => {
            // Randomly determine if the reward is unlocked
            const unlocked = Math.random() > 0.4 // 60% chance of being unlocked

            // For unlocked rewards, set progress to 100% and add unlock date
            // For locked rewards, set random progress
            const progress = unlocked ? 100 : Math.floor(Math.random() * 100)
            const unlockedAt = unlocked ? new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)) : null

            return {
                ...reward,
                unlocked,
                progress,
                unlockedAt,
            }
        })
    }

    // Generate monthly rewards data
    const generateMonthlyRewardsData = () => {
        // If no user rewards, return empty data
        if (!userRewards || userRewards.length === 0) {
            return Array(12).fill(0)
        }

        // Count rewards unlocked per month
        const monthlyData = Array(12).fill(0)

        userRewards.forEach((reward) => {
            if (reward.unlocked && reward.unlockedAt) {
                const month = new Date(reward.unlockedAt).getMonth()
                monthlyData[month]++
            }
        })

        return monthlyData
    }

    // Get dashboard content
    const getDashboardContent = () => {
        // Chart data for criteria summary
        const criteriaChartData = {
            labels: Object.entries(rewardStats.byType).map(([criteria]) => getCriteriaLabel(criteria)),
            datasets: [
                {
                    label: "Récompenses",
                    data: Object.entries(rewardStats.byType).map(([, stats]) => stats.unlocked),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                    ],
                    borderWidth: 1,
                },
            ],
        }

        // Chart data for tier summary
        const tierChartData = {
            labels: Object.entries(rewardStats.byTier).map(([tier]) => getTierLabel(tier)),
            datasets: [
                {
                    label: "Récompenses",
                    data: Object.entries(rewardStats.byTier).map(([, stats]) => stats.unlocked),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                        "rgba(128, 0, 128, 0.6)", // Purple for diamond
                    ],
                    borderWidth: 1,
                },
            ],
        }

        // Chart options
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                },
                title: {
                    display: false,
                },
            },
        }

        return (
            <div className="rewards-dashboard">
                <div className="dashboard-header">
                    <div className="dashboard-progress">
                        <div className="progress-info">
                            <h3>Progression globale</h3>
                            <span className="progress-percentage">{rewardStats.percentage}%</span>
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${rewardStats.percentage}%` }}></div>
                        </div>
                        <div className="progress-detail">
                            <span>
                                {rewardStats.unlocked} / {rewardStats.total} récompenses débloquées
                            </span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-summary">
                    <div className="summary-section">
                        <h3>Résumé par critère</h3>
                        <div className="criteria-summary">
                            {Object.entries(rewardStats.byType).map(([criteria, stats]) => (
                                <div className="criteria-item" key={criteria}>
                                    <div className="criteria-icon">{getCriteriaIcon(criteria)}</div>
                                    <div className="criteria-info">
                                        <span className="criteria-name">{getCriteriaLabel(criteria)}</span>
                                        <div className="criteria-progress">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${Math.round((stats.unlocked / stats.total) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="criteria-stats">
                                            {stats.unlocked} / {stats.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3>Résumé par niveau</h3>
                        <div className="tier-summary">
                            {Object.entries(rewardStats.byTier).map(([tier, stats]) => (
                                <div className="tier-item" key={tier}>
                                    <div className={`tier-icon ${getTierColorClass(tier)}`}>
                                        <Medal size={16} />
                                    </div>
                                    <div className="tier-info">
                                        <span className="tier-name">{getTierLabel(tier)}</span>
                                        <div className="tier-progress">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${Math.round((stats.unlocked / stats.total) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="tier-stats">
                                            {stats.unlocked} / {stats.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-highlights">
                    {rewardStats.recentlyUnlocked && (
                        <div className="highlight-card recent-reward">
                            <div className="highlight-header">
                                <h3>Dernière récompense débloquée</h3>
                                <span className="highlight-date">{formatDate(rewardStats.recentlyUnlocked.unlockedAt)}</span>
                            </div>
                            <div className="highlight-content">
                                <div className="highlight-icon">
                                    <img
                                        src={rewardStats.recentlyUnlocked.iconUrl || "/placeholder.svg"}
                                        alt={rewardStats.recentlyUnlocked.name}
                                    />
                                </div>
                                <div className="highlight-info">
                                    <h4 className="highlight-name">{rewardStats.recentlyUnlocked.name}</h4>
                                    <p className="highlight-description">{rewardStats.recentlyUnlocked.description}</p>
                                    <div className="highlight-meta">
                                        <span className={`highlight-tier ${getTierColorClass(rewardStats.recentlyUnlocked.tier)}`}>
                                            {getTierLabel(rewardStats.recentlyUnlocked.tier)}
                                        </span>
                                        <span className="highlight-criteria">
                                            {getCriteriaIcon(rewardStats.recentlyUnlocked.criteria)}
                                            {getCriteriaLabel(rewardStats.recentlyUnlocked.criteria)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="highlight-action" onClick={() => handleRewardClick(rewardStats.recentlyUnlocked)}>
                                Voir les détails
                            </button>
                        </div>
                    )}

                    {rewardStats.nextToUnlock && (
                        <div className="highlight-card next-reward">
                            <div className="highlight-header">
                                <h3>Prochaine récompense</h3>
                                <span className="highlight-progress">{rewardStats.nextToUnlock.progress}% complété</span>
                            </div>
                            <div className="highlight-content">
                                <div className="highlight-icon">
                                    <img
                                        src={rewardStats.nextToUnlock.iconUrl || "/placeholder.svg"}
                                        alt={rewardStats.nextToUnlock.name}
                                    />
                                </div>
                                <div className="highlight-info">
                                    <h4 className="highlight-name">{rewardStats.nextToUnlock.name}</h4>
                                    <p className="highlight-description">{rewardStats.nextToUnlock.description}</p>
                                    <div className="highlight-meta">
                                        <span className={`highlight-tier ${getTierColorClass(rewardStats.nextToUnlock.tier)}`}>
                                            {getTierLabel(rewardStats.nextToUnlock.tier)}
                                        </span>
                                        <span className="highlight-criteria">
                                            {getCriteriaIcon(rewardStats.nextToUnlock.criteria)}
                                            {getCriteriaLabel(rewardStats.nextToUnlock.criteria)}
                                        </span>
                                    </div>
                                    <div className="highlight-progress-bar">
                                        <div className="progress-bar" style={{ width: `${rewardStats.nextToUnlock.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <button className="highlight-action" onClick={() => handleRewardClick(rewardStats.nextToUnlock)}>
                                Voir les détails
                            </button>
                        </div>
                    )}
                </div>

                <div className="dashboard-stats">
                    <div className="stats-card">
                        <div className="stats-header">
                            <h3>Statistiques des récompenses</h3>
                        </div>
                        <div className="stats-content">
                            <div className="stats-chart">
                                <Pie
                                    data={{
                                        labels: Object.keys(rewardStats.byType).map((type) => getCriteriaLabel(type)),
                                        datasets: [
                                            {
                                                data: Object.values(rewardStats.byType).map((stats) => stats.unlocked),
                                                backgroundColor: [
                                                    "rgba(74, 145, 158, 0.7)",
                                                    "rgba(74, 201, 190, 0.7)",
                                                    "rgba(33, 46, 83, 0.7)",
                                                    "rgba(190, 211, 195, 0.7)",
                                                    "rgba(235, 172, 162, 0.7)",
                                                    "rgba(206, 106, 107, 0.7)",
                                                    "rgba(43, 90, 115, 0.7)",
                                                ],
                                                borderColor: [
                                                    "rgba(74, 145, 158, 1)",
                                                    "rgba(74, 201, 190, 1)",
                                                    "rgba(33, 46, 83, 1)",
                                                    "rgba(190, 211, 195, 1)",
                                                    "rgba(235, 172, 162, 1)",
                                                    "rgba(206, 106, 107, 1)",
                                                    "rgba(43, 90, 115, 1)",
                                                ],
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: {
                                                position: "right",
                                                labels: {
                                                    color: noir,
                                                    font: {
                                                        size: 10,
                                                    },
                                                },
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const label = context.label || ""
                                                        const value = context.raw || 0
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                                        const percentage = Math.round((value / total) * 100)
                                                        return `${label}: ${value} (${percentage}%)`
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className="stats-info">
                                <div className="stats-item">
                                    <span className="stats-label">Récompenses débloquées ce mois</span>
                                    <span className="stats-value">
                                        {
                                            userRewards.filter(
                                                (r) => r.unlocked && new Date(r.unlockedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                            ).length
                                        }
                                    </span>
                                </div>
                                <div className="stats-item">
                                    <span className="stats-label">Récompenses les plus rares</span>
                                    <span className="stats-value">
                                        {userRewards.filter((r) => r.unlocked && r.unlockedPercentage < 10).length}
                                    </span>
                                </div>
                                <div className="stats-item">
                                    <span className="stats-label">Progression moyenne</span>
                                    <span className="stats-value">
                                        {Math.round(
                                            userRewards.filter((r) => !r.unlocked).reduce((sum, r) => sum + r.progress, 0) /
                                            userRewards.filter((r) => !r.unlocked).length || 0,
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Get catalog content
    const getCatalogContent = () => {
        return (
            <div className="rewards-catalog">
                <div className="catalog-header">
                    <div className="catalog-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher une récompense..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="catalog-actions">
                        <div className="catalog-sort">
                            <label>Trier par:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="progress">Progression</option>
                                <option value="name">Nom</option>
                                <option value="tier">Niveau</option>
                                <option value="date">Date d'obtention</option>
                                <option value="rarity">Rareté</option>
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
                    <div className="catalog-filters">
                        <div className="filter-group">
                            <label>Type</label>
                            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                                <option value="all">Tous les types</option>
                                <option value="steps">Pas</option>
                                <option value="steps-time">Pas (Temps)</option>
                                <option value="distance">Distance</option>
                                <option value="distance-time">Distance (Temps)</option>
                                <option value="calories">Calories</option>
                                <option value="calories-time">Calories (Temps)</option>
                                <option value="streak">Streak</option>
                                <option value="level">Niveau</option>
                                <option value="dailygoal-time">Objectif quotidien</option>
                                <option value="customgoal">Objectif personnalisé</option>
                                <option value="challenges">Défis</option>
                                <option value="challenges-time">Défis (Temps)</option>
                                <option value="rank">Classement</option>
                                <option value="friend">Social</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Niveau</label>
                            <select value={filters.tier} onChange={(e) => setFilters({ ...filters, tier: e.target.value })}>
                                <option value="all">Tous les niveaux</option>
                                <option value="bronze">Bronze</option>
                                <option value="silver">Argent</option>
                                <option value="gold">Or</option>
                                <option value="platinium">Platine</option>
                                <option value="ruby">Rubis</option>
                                <option value="sapphire">Saphir</option>
                                <option value="diamond">Diamant</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Statut</label>
                            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                <option value="all">Tous</option>
                                <option value="unlocked">Débloqués</option>
                                <option value="locked">Non débloqués</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="catalog-grid">
                    {sortedRewards().map((reward) => (
                        <div
                            key={reward._id}
                            className={`reward-card ${reward.unlocked ? "unlocked" : "locked"} ${reward.isHidden && !reward.unlocked ? "hidden-reward" : ""
                                }`}
                            onClick={() => handleRewardClick(reward)}
                        >
                            <div className={`reward-tier ${getTierColorClass(reward.tier)}`}>
                                <span>{getTierLabel(reward.tier)}</span>
                            </div>

                            <div className="reward-icon">
                                {reward.isHidden && !reward.unlocked ? (
                                    <div className="hidden-icon">?</div>
                                ) : (
                                    <img src={reward.iconUrl || "/placeholder.svg"} alt={reward.name} />
                                )}
                            </div>

                            <div className="reward-info">
                                <h3 className="reward-name">
                                    {reward.isHidden && !reward.unlocked ? "Récompense cachée" : reward.name}
                                </h3>
                                <p className="reward-description">
                                    {reward.isHidden && !reward.unlocked
                                        ? "Continuez à explorer pour débloquer cette récompense mystère."
                                        : reward.description}
                                </p>

                                <div className="reward-meta">
                                    <span className="reward-criteria">
                                        {getCriteriaIcon(reward.criteria)}
                                        {getCriteriaLabel(reward.criteria)}
                                    </span>
                                    {reward.unlocked ? (
                                        <span className="reward-unlocked-date">
                                            <Clock size={16} />
                                            {formatDate(reward.unlockedAt)}
                                        </span>
                                    ) : (
                                        <span className="reward-rarity">
                                            <Users size={16} />
                                            {reward.unlockedPercentage}% des utilisateurs
                                        </span>
                                    )}
                                </div>

                                <div className="reward-progress">
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${reward.progress}%` }}></div>
                                    </div>
                                    <span className="progress-text">{reward.progress}%</span>
                                </div>
                            </div>

                            {reward.unlocked && (
                                <div className="reward-actions">
                                    <button
                                        className={`showcase-button ${showcaseRewards.some((r) => r._id === reward._id) ? "active" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggleShowcase(reward)
                                        }}
                                        title={
                                            showcaseRewards.some((r) => r._id === reward._id)
                                                ? "Retirer de la vitrine"
                                                : "Ajouter à la vitrine"
                                        }
                                    >
                                        {showcaseRewards.some((r) => r._id === reward._id) ? (
                                            <Bookmark size={16} />
                                        ) : (
                                            <BookmarkPlus size={16} />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {sortedRewards().length === 0 && (
                        <div className="no-rewards">
                            <p>Aucune récompense ne correspond à vos critères de recherche.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Get showcase content
    const getShowcaseContent = () => {
        return (
            <div className="rewards-showcase">
                <div className="showcase-header">
                    <h2>Ma Vitrine de Récompenses</h2>
                    <p>Mettez en avant vos récompenses préférées et les plus rares</p>
                </div>

                <div className="showcase-featured">
                    {showcaseRewards.length > 0 ? (
                        showcaseRewards.map((reward) => (
                            <div
                                key={reward._id}
                                className={`featured-reward ${getTierColorClass(reward.tier)}`}
                                onClick={() => handleRewardClick(reward)}
                            >
                                <div className="featured-icon">
                                    <img src={reward.iconUrl || "/placeholder.svg"} alt={reward.name} />
                                    <div className="featured-shine"></div>
                                </div>
                                <div className="featured-info">
                                    <h3 className="featured-name">{reward.name}</h3>
                                    <p className="featured-description">{reward.description}</p>
                                    <div className="featured-meta">
                                        <span className="featured-tier">{getTierLabel(reward.tier)}</span>
                                        <span className="featured-criteria">{getCriteriaLabel(reward.criteria)}</span>
                                        <span className="featured-rarity">{reward.unlockedPercentage}% des utilisateurs</span>
                                    </div>
                                </div>
                                <button
                                    className="remove-showcase"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleShowcase(reward)
                                    }}
                                    title="Retirer de la vitrine"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-showcase">
                            <p>
                                Vous n'avez pas encore ajouté de récompenses à votre vitrine. Allez dans le catalogue et cliquez sur
                                l'icône <BookmarkPlus size={16} /> pour ajouter une récompense à votre vitrine.
                            </p>
                        </div>
                    )}
                </div>

                <div className="showcase-rarest">
                    <h3>Vos récompenses les plus rares</h3>
                    <div className="rarest-grid">
                        {userRewards
                            .filter((r) => r.unlocked)
                            .sort((a, b) => a.unlockedPercentage - b.unlockedPercentage)
                            .slice(0, 3)
                            .map((reward) => (
                                <div
                                    key={reward._id}
                                    className={`rarest-card ${getTierColorClass(reward.tier)}`}
                                    onClick={() => handleRewardClick(reward)}
                                >
                                    <div className="rarest-percentage">
                                        <span>{reward.unlockedPercentage}%</span>
                                        <small>des utilisateurs</small>
                                    </div>
                                    <div className="rarest-icon">
                                        <img src={reward.iconUrl || "/placeholder.svg"} alt={reward.name} />
                                    </div>
                                    <div className="rarest-info">
                                        <h4>{reward.name}</h4>
                                        <p>{reward.description}</p>
                                    </div>
                                    {!showcaseRewards.some((r) => r._id === reward._id) && (
                                        <button
                                            className="add-to-showcase"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleToggleShowcase(reward)
                                            }}
                                            disabled={showcaseRewards.length >= 3}
                                        >
                                            <BookmarkPlus size={16} />
                                            <span>Ajouter à la vitrine</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="showcase-compare">
                    <h3>Comparez avec vos amis</h3>
                    <div className="compare-friends">
                        <div className="friend-selector">
                            <select>
                                <option value="">Sélectionnez un ami</option>
                                <option value="friend1">Thomas Martin</option>
                                <option value="friend2">Emma Bernard</option>
                                <option value="friend3">Lucas Dubois</option>
                            </select>
                            <button className="compare-button">Comparer</button>
                        </div>
                        <p className="compare-info">
                            Sélectionnez un ami pour voir quelles récompenses vous avez en commun et celles qu'il a débloquées mais
                            pas vous.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Get stats content
    const getStatsContent = () => {
        // Chart data for criteria distribution
        const criteriaDistributionData = {
            labels: Object.entries(rewardStats.byType).map(([criteria]) => getCriteriaLabel(criteria)),
            datasets: [
                {
                    data: Object.entries(rewardStats.byType).map(([, stats]) => stats.total),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                    ],
                },
            ],
        }

        // Chart data for tier distribution
        const tierDistributionData = {
            labels: Object.entries(rewardStats.byTier).map(([tier]) => getTierLabel(tier)),
            datasets: [
                {
                    data: Object.entries(rewardStats.byTier).map(([, stats]) => stats.total),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                        "rgba(128, 0, 128, 0.6)", // Purple for diamond
                    ],
                },
            ],
        }

        // Mock data for monthly progression (replace with actual data)
        const monthlyProgressionData = {
            labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
            datasets: [
                {
                    label: "Récompenses débloquées",
                    data: [5, 8, 3, 6, 9, 4, 7, 2, 5, 8, 6, 4],
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        }

        // Chart options
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                },
                title: {
                    display: false,
                },
            },
        }

        return (
            <div className="rewards-stats">
                <div className="stats-header">
                    <h2>Statistiques des Récompenses</h2>
                    <p>Analysez votre progression et vos accomplissements</p>
                </div>

                <div className="stats-overview">
                    <div className="stats-card">
                        <div className="stats-card-header">
                            <h3>Répartition par type</h3>
                        </div>
                        <div className="stats-card-content">
                            <Pie
                                data={{
                                    labels: Object.keys(rewardStats.byType).map((type) => getCriteriaLabel(type)),
                                    datasets: [
                                        {
                                            data: Object.values(rewardStats.byType).map((stats) => stats.unlocked),
                                            backgroundColor: [
                                                "rgba(74, 145, 158, 0.7)",
                                                "rgba(74, 201, 190, 0.7)",
                                                "rgba(33, 46, 83, 0.7)",
                                                "rgba(190, 211, 195, 0.7)",
                                                "rgba(235, 172, 162, 0.7)",
                                                "rgba(206, 106, 107, 0.7)",
                                                "rgba(43, 90, 115, 0.7)",
                                            ],
                                            borderColor: [
                                                "rgba(74, 145, 158, 1)",
                                                "rgba(74, 201, 190, 1)",
                                                "rgba(33, 46, 83, 1)",
                                                "rgba(190, 211, 195, 1)",
                                                "rgba(235, 172, 162, 1)",
                                                "rgba(206, 106, 107, 1)",
                                                "rgba(43, 90, 115, 1)",
                                            ],
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        legend: {
                                            position: "right",
                                            labels: {
                                                color: noir,
                                                font: {
                                                    size: 10,
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-card-header">
                            <h3>Répartition par niveau</h3>
                        </div>
                        <div className="stats-card-content">
                            <Bar
                                data={{
                                    labels: Object.keys(rewardStats.byTier).map((tier) => getTierLabel(tier)),
                                    datasets: [
                                        {
                                            label: "Débloquées",
                                            data: Object.values(rewardStats.byTier).map((stats) => stats.unlocked),
                                            backgroundColor: "rgba(74, 145, 158, 0.7)",
                                            borderColor: "rgba(74, 145, 158, 1)",
                                            borderWidth: 1,
                                        },
                                        {
                                            label: "Verrouillées",
                                            data: Object.values(rewardStats.byTier).map((stats) => stats.total - stats.unlocked),
                                            backgroundColor: "rgba(190, 211, 195, 0.7)",
                                            borderColor: "rgba(190, 211, 195, 1)",
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    scales: {
                                        x: {
                                            stacked: true,
                                            ticks: {
                                                color: noir,
                                            },
                                        },
                                        y: {
                                            stacked: true,
                                            ticks: {
                                                color: noir,
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: {
                                                color: noir,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-card-header">
                            <h3>Progression mensuelle</h3>
                        </div>
                        <div className="stats-card-content">
                            <Bar
                                data={{
                                    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
                                    datasets: [
                                        {
                                            label: "Récompenses débloquées",
                                            data: generateMonthlyRewardsData(), // Mock data for monthly progression
                                            backgroundColor: "rgba(74, 145, 158, 0.7)",
                                            borderColor: "rgba(74, 145, 158, 1)",
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    scales: {
                                        x: {
                                            ticks: {
                                                color: noir,
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                                color: noir,
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: {
                                                color: noir,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="stats-details">
                    <div className="stats-table-container">
                        <h3>Historique des récompenses</h3>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Récompense</th>
                                    <th>Type</th>
                                    <th>Niveau</th>
                                    <th>Date d'obtention</th>
                                    <th>Rareté</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userRewards
                                    .filter((r) => r.unlocked)
                                    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                                    .slice(0, 10)
                                    .map((reward) => (
                                        <tr key={reward._id} onClick={() => handleRewardClick(reward)}>
                                            <td>
                                                <div className="table-reward">
                                                    <img src={reward.iconUrl || "/placeholder.svg"} alt={reward.name} className="table-icon" />
                                                    <span>{reward.name}</span>
                                                </div>
                                            </td>
                                            <td>{getCriteriaLabel(reward.criteria)}</td>
                                            <td>
                                                <span className={`table-tier ${getTierColorClass(reward.tier)}`}>
                                                    {getTierLabel(reward.tier)}
                                                </span>
                                            </td>
                                            <td>{formatDate(reward.unlockedAt)}</td>
                                            <td>{reward.unlockedPercentage}%</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="stats-insights">
                    <h3>Insights</h3>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <div className="insight-icon">
                                <Flame size={24} />
                            </div>
                            <div className="insight-content">
                                <h4>Votre meilleur mois</h4>
                                <p>
                                    <strong>Mai 2023</strong> - Vous avez débloqué 5 récompenses ce mois-là !
                                </p>
                            </div>
                        </div>

                        <div className="insight-card">
                            <div className="insight-icon">
                                <Target size={24} />
                            </div>
                            <div className="insight-content">
                                <h4>Votre point fort</h4>
                                <p>
                                    <strong>Pas quotidiens</strong> - Vous avez débloqué 80% des récompenses liées aux pas !
                                </p>
                            </div>
                        </div>

                        <div className="insight-card">
                            <div className="insight-icon">
                                <ArrowUp size={24} />
                            </div>
                            <div className="insight-content">
                                <h4>Progression rapide</h4>
                                <p>
                                    <strong>+15%</strong> de récompenses débloquées par rapport au mois dernier !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Get tab content based on active tab
    const getTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return getDashboardContent()
            case "catalog":
                return getCatalogContent()
            case "showcase":
                return getShowcaseContent()
            case "stats":
                return getStatsContent()
            default:
                return getDashboardContent()
        }
    }

    return (
        <div className="rewards-container">
            <div className="rewards-header">
                <h1>Mes Récompenses</h1>
                <p>Découvrez et suivez votre progression à travers les différentes récompenses</p>
            </div>

            <div className="rewards-tabs">
                <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
                    <Trophy size={16} />
                    <span>Tableau de bord</span>
                </button>
                <button className={activeTab === "catalog" ? "active" : ""} onClick={() => setActiveTab("catalog")}>
                    <Medal size={16} />
                    <span>Catalogue</span>
                </button>
                <button className={activeTab === "showcase" ? "active" : ""} onClick={() => setActiveTab("showcase")}>
                    <Star size={16} />
                    <span>Vitrine</span>
                </button>
                <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
                    <BarChart2 size={16} />
                    <span>Statistiques</span>
                </button>
            </div>

            <div className="rewards-content">{getTabContent()}</div>

            {/* Reward Detail Modal */}
            {showRewardModal && selectedReward && (
                <div className="modal-overlay">
                    <div className="modal reward-modal">
                        <div className="modal-header">
                            <h3>Détails de la récompense</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowRewardModal(false)
                                    setSelectedReward(null)
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="reward-modal-content">
                            <div className={`reward-modal-icon ${getTierColorClass(selectedReward.tier)}`}>
                                <img src={selectedReward.iconUrl || "/placeholder.svg"} alt={selectedReward.name} />
                            </div>

                            <div className="reward-modal-info">
                                <h2 className="reward-modal-name">{selectedReward.name}</h2>
                                <p className="reward-modal-description">{selectedReward.description}</p>

                                <div className="reward-modal-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Type</span>
                                        <span className="meta-value">
                                            {getCriteriaIcon(selectedReward.criteria)} {getCriteriaLabel(selectedReward.criteria)}
                                        </span>
                                    </div>

                                    <div className="meta-item">
                                        <span className="meta-label">Niveau</span>
                                        <span className={`meta-value tier-badge ${getTierColorClass(selectedReward.tier)}`}>
                                            {getTierLabel(selectedReward.tier)}
                                        </span>
                                    </div>

                                    <div className="meta-item">
                                        <span className="meta-label">Objectif</span>
                                        <span className="meta-value">{selectedReward.target.toLocaleString()}</span>
                                    </div>

                                    <div className="meta-item">
                                        <span className="meta-label">Rareté</span>
                                        <span className="meta-value">{selectedReward.unlockedPercentage}% des utilisateurs</span>
                                    </div>

                                    {selectedReward.unlocked && (
                                        <div className="meta-item">
                                            <span className="meta-label">Débloqué le</span>
                                            <span className="meta-value">{formatDate(selectedReward.unlockedAt)}</span>
                                        </div>
                                    )}

                                    {selectedReward.isRepeatable && (
                                        <div className="meta-item">
                                            <span className="meta-label">Type</span>
                                            <span className="meta-value repeatable-badge">Répétable</span>
                                        </div>
                                    )}
                                </div>

                                {!selectedReward.unlocked && (
                                    <div className="reward-modal-progress">
                                        <div className="progress-label">
                                            <span>Progression</span>
                                            <span>{selectedReward.progress}%</span>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: `${selectedReward.progress}%` }}></div>
                                        </div>
                                        <p className="progress-hint">
                                            {selectedReward.progress > 0
                                                ? `Continuez vos efforts ! Vous êtes sur la bonne voie pour débloquer cette récompense.`
                                                : `Commencez à accumuler des ${getCriteriaLabel(
                                                    selectedReward.criteria,
                                                ).toLowerCase()} pour progresser vers cette récompense.`}
                                        </p>
                                    </div>
                                )}

                                <div className="reward-modal-actions">
                                    {selectedReward.unlocked ? (
                                        <>
                                            <button
                                                className={`showcase-action ${showcaseRewards.some((r) => r._id === selectedReward._id) ? "active" : ""
                                                    }`}
                                                onClick={() => handleToggleShowcase(selectedReward)}
                                                disabled={
                                                    showcaseRewards.length >= 3 && !showcaseRewards.some((r) => r._id === selectedReward._id)
                                                }
                                            >
                                                {showcaseRewards.some((r) => r._id === selectedReward._id) ? (
                                                    <>
                                                        <Bookmark size={16} />
                                                        <span>Retirer de la vitrine</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <BookmarkPlus size={16} />
                                                        <span>Ajouter à la vitrine</span>
                                                    </>
                                                )}
                                            </button>
                                            <button className="share-action">
                                                <Share2 size={16} />
                                                <span>Partager</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button className="focus-action">
                                            <Target size={16} />
                                            <span>Définir comme objectif</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedReward.unlocked && (
                            <div className="reward-modal-social">
                                <h4>Qui d'autre a débloqué cette récompense ?</h4>
                                <div className="social-users">
                                    <div className="user-avatar">
                                        <img src="/placeholder.svg?height=40&width=40&text=TM" alt="User" />
                                        <span className="user-name">Thomas M.</span>
                                    </div>
                                    <div className="user-avatar">
                                        <img src="/placeholder.svg?height=40&width=40&text=EB" alt="User" />
                                        <span className="user-name">Emma B.</span>
                                    </div>
                                    <div className="user-avatar">
                                        <img src="/placeholder.svg?height=40&width=40&text=LD" alt="User" />
                                        <span className="user-name">Lucas D.</span>
                                    </div>
                                    <div className="more-users">+12</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reward Animation */}
            {animateReward && (
                <div className="reward-animation">
                    <div className="animation-content">
                        <div className="animation-icon">
                            <img src={animateReward.iconUrl || "/placeholder.svg"} alt={animateReward.name} />
                        </div>
                        <div className="animation-text">
                            <h3>Nouvelle récompense débloquée !</h3>
                            <h2>{animateReward.name}</h2>
                        </div>
                        <div className="animation-confetti" ref={confettiRef}></div>
                    </div>
                </div>
            )}

            {/* Privacy Notice */}
            <div className="privacy-notice">
                <Info size={16} />
                <p>
                    Vos récompenses sont visibles par vos amis.{" "}
                    <Link to="/settings">Modifier les paramètres de confidentialité</Link>
                </p>
            </div>
        </div>
    )
}

export default Rewards