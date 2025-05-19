import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_CHALLENGE = process.env.NODE_ENV === 'production' ? '/api/challenge' : '/challenge';

export const useChallenge = (userId) => {
    const [challenges, setChallenges] = useState([])
    const [progress, setProgress] = useState("")
    const [publicChallenges, setPublicChallenges] = useState([])

    const fetchChallenges = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_CHALLENGE}/challenges`,
                { withCredentials: true }
            );

            if (data.success) {
                setPublicChallenges(data.challenges);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        }
    }, []);

    const fetchMyChallenges = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_CHALLENGE}/${userId}/mychallenges`,
                { withCredentials: true }
            );

            if (data.success) {
                setChallenges(data.challenges);
                setProgress(data.userProgress);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        }
    }, [userId]);

    const createChallenge = async (challengeData) => {
        try {
            const { data } = await axios.post(`${API_CHALLENGE}/${userId}/new`,
                challengeData,
                { withCredentials: true }
            );

            if (data.success) {
                await fetchChallenges();
                await fetchMyChallenges();
                toast.success("Challenge créé avec succès");
            } else {
                toast.error(data.error || "Erreur lors de la création du challenge");
                return false;
            }
        } catch (error) {
            console.error("Error creating challenge:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la création du challenge");
            return false;
        }
    };

    const fetchChallengeDetails = async (challengeId) => {
        try {
            const { data } = await axios.get(`${API_CHALLENGE}/${userId}/${challengeId}`,
                { withCredentials: true }
            );

            if (data.success) {
                return data.challenge;
            } else {
                toast.error(data.error || "Erreur lors de la récupération des détails");
                return false;
            }
        } catch (error) {
            console.error("Details error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la récupération des détails");
            return false;
        }
    };

    const updateChallenge = async (challengeId, updates) => {
        try {
            const { data } = await axios.put(`${API_CHALLENGE}/${userId}/${challengeId}/modify`,
                updates,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Challenge modifié avec succès");
                await fetchChallenges();
                await fetchMyChallenges();
                return true;
            } else {
                toast.error(data.error || "Erreur lors de la modification");
                return false;
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la modification");
            return false;
        }
    };

    const joinChallenge = async (accessCode) => {
        try {
            const { data } = await axios.put(`${API_CHALLENGE}/${userId}/join`,
                { accessCode },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Challenge rejoint avec succès");
                await fetchChallenges();
                await fetchMyChallenges();
                return true;
            } else {
                toast.error(data.error || "Erreur lors de l'ajout de l'utilisateur");
                return false;
            }
        } catch (error) {
            console.error("Join error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'ajout de l'utilisateur");
            return false;
        }
    };

    const leaveChallenge = async (challengeId) => {
        try {
            const { data } = await axios.put(`${API_CHALLENGE}/${userId}/${challengeId}/leave`,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Challenge quitté avec succès");
                await fetchChallenges();
                await fetchMyChallenges();
                return true;
            } else {
                toast.error(data.error || "Erreur lors de la suppression de l'utilisateur");
                return false;
            }
        } catch (error) {
            console.error("Join error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la suppression de l'utilisateur");
            return false;
        }
    };

    const deleteChallenge = async (challengeId) => {
        try {
            const { data } = await axios.delete(`${API_CHALLENGE}/${userId}/${challengeId}/delete`,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Challenge supprimée avec succès");
                await fetchChallenges();
                await fetchMyChallenges();
                return true;
            } else {
                toast.error(data.error || "Erreur lors de la suppression");
                return false;
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la suppression");
            return false;
        }
    };

    const updateChallengeProgress = async (challengeId, progressData) => {
        try {
            const { data } = await axios.post(`${API_CHALLENGE}/${userId}/${challengeId}/progress`,
                progressData,
                {
                    withCredentials: true,
                }
            );

            if (data.success) {
                fetchMyChallenges();
                return true;
            } else {
                toast.error(data.error || 'Erreur lors de la mise à jour du progrès');
                return false;
            }
        } catch (error) {
            console.error('Progress update error:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du progrès');
            return false;
        }
    };

    useEffect(() => {
        if (userId) {
            fetchChallenges();
            fetchMyChallenges();
        }
    }, [userId, fetchChallenges, fetchMyChallenges]);

    return {
        challenges,
        publicChallenges,
        progress,
        fetchChallenges,
        fetchMyChallenges,
        createChallenge,
        fetchChallengeDetails,
        updateChallenge,
        joinChallenge,
        leaveChallenge,
        deleteChallenge,
        updateChallengeProgress,
    };
};