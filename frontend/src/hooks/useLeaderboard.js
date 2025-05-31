import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"

const API_LEADERBOARD = process.env.NODE_ENV === "production" ? "/api/leaderboard" : "/leaderboard"

export const useLeaderboard = (userId) => {
    const [users, setUsers] = useState([])

    // Fetch leaderboard data
    const fetchLeaderboardData = useCallback(
        async (filters = {}) => {
            if (!userId) return
            try {
                const { data } = await axios.get(`${API_LEADERBOARD}/${userId}`, {
                    params: filters,
                    withCredentials: true,
                })

                if (data.success) {
                    setUsers(data.ranking || [])
                } else {
                    console.error(data.error || "Erreur lors du chargement du classement")
                    toast.error(data.error || "Erreur lors du chargement du classement")
                }
            } catch (err) {
                console.error("Fetch leaderboard error:", err)
                const errorMessage = err.response?.data?.error || "Erreur de connexion au serveur"
                toast.error(errorMessage)
            }
        },
        [userId],
    );

    // Send message
    const sendMessage = useCallback(
        async (targetUserId, message) => {
            try {
                const { data } = await axios.post(
                    `${API_LEADERBOARD}/${userId}/message`,
                    {
                        targetUserId,
                        message,
                    },
                    {
                        withCredentials: true,
                    },
                )

                if (data.success) {
                    toast.success(data.message || "Message envoyé")
                    return true
                } else {
                    toast.error(data.error || "Erreur lors de l'envoi du message")
                    return false
                }
            } catch (err) {
                console.error("Send message error:", err)
                toast.error(err.response?.data?.error || "Erreur lors de l'envoi du message")
                return false
            }
        },
        [userId],
    )

    // Add comment to user profile
    const addComment = useCallback(
        async (targetUserId, comment) => {
            try {
                const { data } = await axios.post(
                    `${API_LEADERBOARD}/${userId}/comment`,
                    {
                        targetUserId,
                        comment,
                    },
                    {
                        withCredentials: true,
                    },
                )

                if (data.success) {
                    toast.success(data.message || "Commentaire ajouté")
                    return true
                } else {
                    toast.error(data.error || "Erreur lors de l'ajout du commentaire")
                    return false
                }
            } catch (err) {
                console.error("Add comment error:", err)
                toast.error(err.response?.data?.error || "Erreur lors de l'ajout du commentaire")
                return false
            }
        },
        [userId],
    )

    // Search users
    const searchUsers = useCallback(
        async (query, filters = {}) => {
            if (!query.trim()) return []

            try {
                const { data } = await axios.get(`${API_LEADERBOARD}/${userId}/search`, {
                    params: { query, ...filters },
                    withCredentials: true,
                })

                if (data.success) {
                    return data.users || []
                } else {
                    return []
                }
            } catch (err) {
                console.error("Search users error:", err)
                toast.error(err.response?.data?.error || "Erreur lors de la recherche")
                return []
            }
        },
        [userId],
    )

    // Get friends leaderboard
    const fetchFriendsLeaderboard = useCallback(
        async (filters = {}) => {
            if (!userId) return

            try {
                const { data } = await axios.get(`${API_LEADERBOARD}/${userId}/friends`, {
                    params: filters,
                    withCredentials: true,
                })

                if (data.success) {
                    return data.ranking || []
                } else {
                    toast.error(data.error || "Erreur lors du chargement du classement des amis")
                    return []
                }
            } catch (err) {
                console.error("Fetch friends leaderboard error:", err)
                toast.error(err.response?.data?.error || "Erreur lors du chargement du classement des amis")
                return []
            }
        },
        [userId],
    )

    // Get challenges leaderboard
    const fetchChallengesLeaderboard = useCallback(async () => {
        if (!userId) return

        try {
            const { data } = await axios.get(`${API_LEADERBOARD}/${userId}/challenges`, {
                withCredentials: true,
            })

            if (data.success) {
                return data.rankings || []
            } else {
                toast.error(data.error || "Erreur lors du chargement des défis")
                return []
            }
        } catch (err) {
            console.error("Fetch challenges leaderboard error:", err)
            toast.error(err.response?.data?.error || "Erreur lors du chargement des défis")
            return []
        }
    }, [userId])

    // Get achievements leaderboard
    const fetchRewardsLeaderboard = useCallback(async () => {
        if (!userId) return

        try {
            const { data } = await axios.get(`${API_LEADERBOARD}/${userId}/achievements`, {
                withCredentials: true,
            })

            if (data.success) {
                return data.achievements || []
            } else {
                toast.error(data.error || "Erreur lors du chargement des récompenses")
                return []
            }
        } catch (err) {
            console.error("Fetch achievements leaderboard error:", err)
            toast.error(err.response?.data?.error || "Erreur lors du chargement des récompenses")
            return []
        }
    }, [userId])

    return {
        users,
        fetchLeaderboardData,
        sendMessage,
        addComment,
        searchUsers,
        fetchFriendsLeaderboard,
        fetchChallengesLeaderboard,
        fetchRewardsLeaderboard
    }
}
