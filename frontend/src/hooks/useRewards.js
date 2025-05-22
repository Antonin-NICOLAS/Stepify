import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_REWARDS = process.env.NODE_ENV === 'production' ? '/api/reward' : '/reward';

export const useRewards = (userId) => {
    const [rewards, setRewards] = useState([])
    const [myRewards, setMyRewards] = useState([])

    const fetchRewards = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_REWARDS}/${userId}/all`,
                { withCredentials: true }
            );

            if (data.success) {
                setRewards(data.rewards);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        }
    }, []);

        const fetchMyRewards = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_REWARDS}/${userId}/myrewards`,
                { withCredentials: true }
            );

            if (data.success) {
                setMyRewards(data.rewards);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchRewards();
            fetchMyRewards();
        }
    }, [userId, fetchRewards]);

    return {
        rewards,
        myRewards,
        fetchRewards,
        fetchMyRewards,
    };
};