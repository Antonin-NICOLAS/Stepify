import { useState, useEffect, useCallback, use } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_REWARDS =
  process.env.NODE_ENV === 'production' ? '/api/reward' : '/reward'

export const useRewards = (userId) => {
  const [rewards, setRewards] = useState([])
  const [myRewards, setMyRewards] = useState([])
  const [vitrine, setVitrine] = useState(null)

  const fetchRewards = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_REWARDS}/${userId}/all`, {
        withCredentials: true,
      })

      if (data.success) {
        setRewards(data.rewards)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [])

  const fetchMyRewards = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_REWARDS}/${userId}/myrewards`, {
        withCredentials: true,
      })

      if (data.success) {
        setMyRewards(data.rewards)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [])

  const fetchVitrineRewards = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_REWARDS}/${userId}/vitrine`, {
        withCredentials: true,
      })

      if (data.success) {
        setVitrine(data.vitrine)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error(err.response?.data?.error || 'Erreur de connexion au serveur')
    }
  }, [])

  const setInVitrine = useCallback(async (rewardId) => {
    try {
      const { data } = await axios.post(
        `${API_REWARDS}/${userId}/${rewardId}/setinvitrine`,
        { withCredentials: true }
      )
      if (data.success) {
        toast.success(data.message || 'La vitrine a bien été changée')
        fetchRewards()
        fetchMyRewards()
        fetchVitrineRewards()
      } else {
        toast.error(data.error || 'Erreur lors du changement de vitrine')
      }
    } catch (error) {}
  }, [])

  return {
    rewards,
    myRewards,
    vitrine,
    fetchRewards,
    fetchMyRewards,
    fetchVitrineRewards,
    setInVitrine,
  }
}
