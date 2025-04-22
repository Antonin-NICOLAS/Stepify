import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLoaderStore } from "./Loading";
import { useAuthStore } from "./CheckAuth";

const API_USER = process.env.NODE_ENV === "production" ? "/api/account" : "/account";

export const useUserStore = create((set, get) => ({
    // --- User Profile Management ---
    updateProfile: async (userId, updates) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { user, setUser } = useAuthStore.getState();

        startLoading();
        try {
            const changes = {};
            if (updates.username && updates.username !== user.username) {
                changes.username = updates.username;
            }
            if (updates.firstName && updates.firstName !== user.firstName) {
                changes.firstName = updates.firstName;
            }
            if (updates.lastName && updates.lastName !== user.lastName) {
                changes.lastName = updates.lastName;
            }

            if (Object.keys(changes).length === 0) {
                return toast("Aucune modification détectée");
            }

            const { data } = await axios.patch(`${API_USER}/${userId}/updateprofile`, changes);

            if (data.success) {
                toast.success("Profil mis à jour");
                setUser(data.user);
                return data.user;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Avatar ---
    updateAvatar: async (userId, file) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        if (!file) throw new Error("Aucune image détectée");

        startLoading();
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await axios.patch(`${API_USER}/${userId}/avatar`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            if (data.success) {
                toast.success("Avatar mis à jour");
                updateUserField('avatarUrl', data.avatarUrl); // Mise à jour partielle
                return data.avatarUrl;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Password ---
    changePassword: async (userId, { currentPassword, newPassword, confirmPassword }, onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();

        if (!currentPassword) throw new Error("Mot de passe actuel requis");
        if (newPassword.length < 8) throw new Error("8 caractères minimum");
        if (newPassword !== confirmPassword) throw new Error("Mots de passe différents");

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/password`, {
                currentPassword,
                newPassword
            });

            if (data.success) {
                toast.success("Mot de passe mis à jour");
                onSuccess?.();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Email ---
    updateEmail: async (userId, newEmail) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { setUser } = useAuthStore.getState();

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            throw new Error("Email invalide");
        }

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/email`, { newEmail });

            if (data.success) {
                toast.success("Email mis à jour - Vérification requise");
                setUser(data.user); // Met à jour l'état global
                return {
                    email: data.email,
                    isVerified: data.isVerified
                };
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Status ---
    updateStatus: async (userId, status) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        if (!status || status.length > 150) {
            throw new Error("150 caractères maximum");
        }

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/status`, { status });

            if (data.success) {
                toast.success("Statut mis à jour");
                updateUserField('status', data.status); // Mise à jour partielle
                return data.status;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Daily Goal ---
    updateDailyGoal: async (userId, dailyGoal) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        if (isNaN(dailyGoal)) throw new Error("Doit être un nombre");
        if (dailyGoal < 1000 || dailyGoal > 50000) throw new Error("Entre 1000 et 50000");

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/daily-goal`, { dailyGoal });

            if (data.success) {
                toast.success("Objectif mis à jour");
                updateUserField('dailyGoal', data.dailyGoal); // Mise à jour partielle
                return data.dailyGoal;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Theme ---
    updateThemePreference: async (userId, themePreference) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        if (!['light', 'dark', 'auto'].includes(themePreference)) {
            throw new Error("Préférence invalide");
        }

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/theme`, { themePreference });

            if (data.success) {
                toast.success("Thème mis à jour");
                updateUserField('themePreference', data.themePreference);
                return data.themePreference;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Language ---
    updateLanguagePreference: async (userId, languagePreference) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        if (!['fr', 'en', 'es', 'de'].includes(languagePreference)) {
            throw new Error("Langue non supportée");
        }

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/language`, { languagePreference });

            if (data.success) {
                toast.success("Langue mise à jour");
                updateUserField('languagePreference', data.languagePreference);
                return data.languagePreference;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Privacy Settings ---
    updatePrivacySettings: async (userId, privacySettings) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();
        const { updateUserField } = useAuthStore.getState();

        startLoading();
        try {
            const { data } = await axios.patch(`${API_USER}/${userId}/privacy`, { privacySettings });

            if (data.success) {
                toast.success("Confidentialité mise à jour");
                updateUserField('privacySettings', data.privacySettings);
                return data.privacySettings;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
            throw error;
        } finally {
            stopLoading();
        }
    },

    // --- Get User Profile ---
    getUserProfile: async (userId) => {
        const { startLoading, stopLoading } = useLoaderStore.getState();

        startLoading();
        try {
            const { data } = await axios.get(`${API_USER}/${userId}/profile`);

            if (data.success) {
                return data.user;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la récupération");
            throw error;
        } finally {
            stopLoading();
        }
    }
}));