import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_NOTIFICATION = process.env.NODE_ENV === 'production' ? '/api/notification' : '/notification';

export const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([])
    const [challengeNotifications, setChallengeNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(`${API_NOTIFICATION}/${userId}/all`,
                { withCredentials: true }
            );

            if (data.success) {
                setNotifications(data.notifications);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        } finally {
            setIsLoading(false)
        }
    }, []);

    const fetchChallengeNotifications = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(`${API_NOTIFICATION}/${userId}/challenge`,
                { withCredentials: true }
            );

            if (data.success) {
                setChallengeNotifications(data.notifications);
            } else {
                toast.error(data.error || "Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err.response?.data?.error || "Erreur de connexion au serveur");
        } finally {
            setIsLoading(false)
        }
    }, [userId]);

    const sendFriendRequest = async (toId) => {
        setIsLoading(true)
        if (userId === toId) {
            toast.error("Vous ne pouvez pas vous envoyer une demande d'ami");
            return false;
        }
        try {
            const { data } = await axios.post(`${API_NOTIFICATION}/${toId}/friend-request`,
                { userId },
                { withCredentials: true }
            );

            if (data.success) {
                await fetchNotifications();
                toast.success("Notification envoyée");
            } else {
                toast.error(data.error || "Erreur lors de l'envoi de la notification");
                return false;
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'envoi de la notification");
            return false;
        } finally {
            setIsLoading(false)
        }
    };

    const acceptFriendRequest = async (requesterId, inviteId) => {
        setIsLoading(true)
        try {
            const { data } = await axios.post(`${API_NOTIFICATION}/${userId}/${inviteId}/accept-friend`,
                { requesterId },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Demande d'ami acceptée");
                return true
            } else {
                toast.error(data.error || "Erreur lors de l'acceptation de la demande");
                return false;
            }
        } catch (error) {
            console.error("Error accepting friend:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'acceptation de la demande");
            return false;
        } finally {
            setIsLoading(false)
        }
    };

    const respondToChallengeInvite = async (inviteId, action) => {
        setIsLoading(true)
        try {
            const { data } = await axios.post(`${API_NOTIFICATION}/${userId}/${inviteId}/respond`,
                { action },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Réponse à l'invitation envoyée");
                await fetchNotifications();
                await fetchChallengeNotifications();
                return true
            } else {
                toast.error(data.error || "Erreur lors de l'envoi de la réponse");
                return false;
            }
        } catch (error) {
            console.error("Send Challenge response error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'envoi de la réponse");
            return false;
        } finally {
            setIsLoading(false)
        }
    };

    const markNotificationAsRead = async (notificationId) => {
    setIsLoading(true)
    try {
        const { data } = await axios.patch(
            `${API_NOTIFICATION}/${userId}/${notificationId}/read`,
            {},
            { withCredentials: true }
        );

        if (data.success) {
            await fetchNotifications();
        } else {
            toast.error(data.error || "Erreur lors du marquage comme lu");
        }
    } catch (error) {
        console.error("Mark as read error:", error);
        toast.error(error.response?.data?.error || "Erreur lors du marquage comme lu");
    } finally {
        setIsLoading(false)
    }
};

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            fetchChallengeNotifications();
        }
    }, [userId, fetchNotifications]);

    return {
        notifications,
        challengeNotifications,
        isLoading,
        fetchNotifications,
        fetchChallengeNotifications,
        sendFriendRequest,
        acceptFriendRequest,
        respondToChallengeInvite,
        markNotificationAsRead
    };
};