import { useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_FRIENDS =
  process.env.NODE_ENV === 'production' ? '/api/friend' : '/friend'

export const useFriends = (userId) => {
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await axios.get(`${API_FRIENDS}/${userId}/friends`, {
        withCredentials: true,
      })

      if (data.success) {
        setFriends(data.friends || [])
      } else {
        toast.error(data.error || 'Erreur lors du chargement des amis')
      }
    } catch (err) {
      console.error('Fetch friends error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [userId])

  // Fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await axios.get(`${API_FRIENDS}/${userId}/requests`, {
        withCredentials: true,
      })

      if (data.success) {
        setFriendRequests(data.requests || [])
        setSentRequests(data.sent || [])
      } else {
        toast.error(data.error || 'Erreur lors du chargement des demandes')
      }
    } catch (err) {
      console.error('Fetch requests error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [userId])

  // Search users
  const searchUsers = useCallback(async (query) => {
    if (!userId) return []
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data } = await axios.get(`${API_FRIENDS}/${userId}/search`, {
        params: { query },
        withCredentials: true,
      })

      if (data.success) {
        setSearchResults(data.users || [])
      } else {
        setSearchResults([])
        toast.error(data.error || 'Erreur lors de la recherche')
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
      toast.error(err.response?.data?.error || 'Erreur de recherche')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Remove friend
  const removeFriend = useCallback(
    async (friendId) => {
      try {
        const { data } = await axios.post(
          `${API_FRIENDS}/${userId}/${friendId}/remove-friend`,
          { withCredentials: true }
        )

        if (data.success) {
          toast.success(data.message || "Demande d'ami annulée")
          fetchFriends()
          return true
        } else {
          toast.error(data.error || "Erreur lors de l'annulation de la demande")
          return false
        }
      } catch (error) {
        console.error('Error cancelling friend request:', error)
        toast.error(
          error.response?.data?.error ||
            "Erreur lors de l'annulation de la demande"
        )
        return false
      }
    },
    [userId, fetchFriends]
  )

  return {
    friends,
    friendRequests,
    sentRequests,
    searchResults,
    isSearching,
    fetchFriends,
    fetchFriendRequests,
    searchUsers,
    removeFriend,
  }
}
