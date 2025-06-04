import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_LEADERBOARD =
  process.env.NODE_ENV === "production" ? "/api/leaderboard" : "/leaderboard";

export const useLeaderboard = (userId) => {
  const [users, setUsers] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [challengesData, setChallengesData] = useState([]);
  const [rewardsData, setRewardsData] = useState([]);

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(
    async (filters = {}) => {
      if (!userId) return;
      try {
        const { data } = await axios.get(`${API_LEADERBOARD}/${userId}`, {
          params: filters,
          withCredentials: true,
        });

        if (data.success) {
          setUsers(data.ranking || []);
        } else {
          console.error(
            data.error || "Erreur lors du chargement du classement"
          );
          toast.error(data.error || "Erreur lors du chargement du classement");
        }
      } catch (err) {
        console.error("Fetch leaderboard error:", err);
        const errorMessage =
          err.response?.data?.error || "Erreur de connexion au serveur";
        toast.error(errorMessage);
      }
    },
    [userId]
  );

  // Get friends leaderboard
  const fetchFriendsLeaderboard = useCallback(
    async (filters = {}) => {
      if (!userId) return;

      try {
        const { data } = await axios.get(
          `${API_LEADERBOARD}/${userId}/friends`,
          {
            params: filters,
            withCredentials: true,
          }
        );

        if (data.success) {
          setFriendsData(data.ranking || []);
        } else {
          toast.error(
            data.error || "Erreur lors du chargement du classement des amis"
          );
          return [];
        }
      } catch (err) {
        console.error("Fetch friends leaderboard error:", err);
        toast.error(
          err.response?.data?.error ||
            "Erreur lors du chargement du classement des amis"
        );
        return [];
      }
    },
    [userId]
  );

  // Get challenges leaderboard
  const fetchChallengesLeaderboard = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await axios.get(
        `${API_LEADERBOARD}/${userId}/challenges`,
        {
          withCredentials: true, //TODO: by query
        }
      );

      if (data.success) {
        setChallengesData(data.rankings || []);
      } else {
        toast.error(data.error || "Erreur lors du chargement des défis");
        return [];
      }
    } catch (err) {
      console.error("Fetch challenges leaderboard error:", err);
      toast.error(
        err.response?.data?.error || "Erreur lors du chargement des défis"
      );
      return [];
    }
  }, [userId]);

  // Get achievements leaderboard
  const fetchRewardsLeaderboard = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await axios.get(`${API_LEADERBOARD}/${userId}/rewards`, {
        withCredentials: true,
      });

      if (data.success) {
        setRewardsData(data.rankings || []);
      } else {
        toast.error(data.error || "Erreur lors du chargement des récompenses");
        return [];
      }
    } catch (err) {
      console.error("Fetch achievements leaderboard error:", err);
      toast.error(
        err.response?.data?.error || "Erreur lors du chargement des récompenses"
      );
      return [];
    }
  }, [userId]);

  return {
    users,
    friendsData,
    challengesData,
    rewardsData,
    fetchLeaderboardData,
    fetchFriendsLeaderboard,
    fetchChallengesLeaderboard,
    fetchRewardsLeaderboard,
  };
};
