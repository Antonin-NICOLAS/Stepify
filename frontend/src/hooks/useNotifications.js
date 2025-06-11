import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useFriends } from './useFriends'

const API_NOTIFICATION =
  process.env.NODE_ENV === 'production' ? '/api/notification' : '/notification'

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([])
  const [challengeNotifications, setChallengeNotifications] = useState([])
  const { fetchFriends, fetchFriendRequests } = useFriends(userId)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_NOTIFICATION}/${userId}/all`, {
        withCredentials: true,
      })

      if (data.success) {
        setNotifications(data.notifications)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [])

  const fetchChallengeNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_NOTIFICATION}/${userId}/challenge`,
        { withCredentials: true },
      )

      if (data.success) {
        setChallengeNotifications(data.notifications)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [userId])

  const sendFriendRequest = async (toId) => {
    if (userId === toId) {
      toast.error("Vous ne pouvez pas vous envoyer une demande d'ami")
      return false
    }
    try {
      const { data } = await axios.post(
        `${API_NOTIFICATION}/${toId}/friend-request`,
        { userId },
        { withCredentials: true },
      )

      if (data.success) {
        await fetchNotifications()
        await fetchFriendRequests()
        toast.success(data.message || 'Notification envoyée')
      } else {
        toast.error(data.error || "Erreur lors de l'envoi de la notification")
        return false
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error(
        error.response?.data?.error ||
          "Erreur lors de l'envoi de la notification",
      )
      return false
    }
  }

  const acceptFriendRequest = async (requesterId, inviteId) => {
    try {
      const { data } = await axios.post(
        `${API_NOTIFICATION}/${userId}/${inviteId}/accept-friend`,
        { requesterId },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || "Demande d'ami acceptée")
        await fetchFriends()
        return true
      } else {
        toast.error(data.error || "Erreur lors de l'acceptation de la demande")
        return false
      }
    } catch (error) {
      console.error('Error accepting friend:', error)
      toast.error(
        error.response?.data?.error ||
          "Erreur lors de l'acceptation de la demande",
      )
      return false
    }
  }

  const declineFriendRequest = async (inviteId) => {
    try {
      const { data } = await axios.post(
        `${API_NOTIFICATION}/${userId}/${inviteId}/decline-friend`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || "Demande d'ami refusée")
        await fetchFriendRequests()
        return true
      } else {
        toast.error(data.error || 'Erreur lors du refus de la demande')
        return false
      }
    } catch (error) {
      console.error('Error refusing friend request:', error)
      toast.error(
        error.response?.data?.error || 'Erreur lors du refus de la demande',
      )
      return false
    }
  }

  const cancelFriendRequest = async (inviteId) => {
    try {
      const { data } = await axios.post(
        `${API_NOTIFICATION}/${userId}/${inviteId}/cancel-friend`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || "Demande d'ami annulée")
        await fetchFriendRequests()
        return true
      } else {
        toast.error(data.error || "Erreur lors de l'annulation de la demande")
        return false
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error)
      toast.error(
        error.response?.data?.error ||
          "Erreur lors de l'annulation de la demande",
      )
      return false
    }
  }

  const respondToChallengeInvite = async (inviteId) => {
    try {
      const { data } = await axios.post(
        `${API_NOTIFICATION}/${userId}/${inviteId}/remove-friend`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || "Réponse à l'invitation envoyée")
        await fetchNotifications()
        await fetchChallengeNotifications()
        return true
      } else {
        toast.error(data.error || "Erreur lors de l'envoi de la réponse")
        return false
      }
    } catch (error) {
      console.error('Send Challenge response error:', error)
      toast.error(
        error.response?.data?.error || "Erreur lors de l'envoi de la réponse",
      )
      return false
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { data } = await axios.patch(
        `${API_NOTIFICATION}/${userId}/${notificationId}/read`,
        {},
        { withCredentials: true },
      )

      if (data.success) {
        await fetchNotifications()
      } else {
        toast.error(data.error || 'Erreur lors du marquage comme lu')
      }
    } catch (error) {
      console.error('Mark as read error:', error)
      toast.error(
        error.response?.data?.error || 'Erreur lors du marquage comme lu',
      )
    }
  }

  // Send message
  const sendMessage = useCallback(
    async (targetUserId, message) => {
      try {
        const { data } = await axios.post(
          `${API_NOTIFICATION}/${userId}/message`,
          {
            targetUserId,
            message,
          },
          {
            withCredentials: true,
          },
        )

        if (data.success) {
          toast.success(data.message || 'Message envoyé')
          return true
        } else {
          toast.error(data.error || "Erreur lors de l'envoi du message")
          return false
        }
      } catch (err) {
        console.error('Send message error:', err)
        toast.error(
          err.response?.data?.error || "Erreur lors de l'envoi du message",
        )
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
          `${API_NOTIFICATION}/${userId}/comment`,
          {
            targetUserId,
            comment,
          },
          {
            withCredentials: true,
          },
        )

        if (data.success) {
          toast.success(data.message || 'Commentaire ajouté')
          return true
        } else {
          toast.error(data.error || "Erreur lors de l'ajout du commentaire")
          return false
        }
      } catch (err) {
        console.error('Add comment error:', err)
        toast.error(
          err.response?.data?.error || "Erreur lors de l'ajout du commentaire",
        )
        return false
      }
    },
    [userId],
  )

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      fetchChallengeNotifications()
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    challengeNotifications,
    fetchNotifications,
    fetchChallengeNotifications,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    respondToChallengeInvite,
    markNotificationAsRead,
    addComment,
    sendMessage,
  }
}
