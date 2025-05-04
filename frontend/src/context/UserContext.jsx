import React, { createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useLoadingActions } from './LoadingContext';

const API_USER = process.env.NODE_ENV === 'production' ? '/api/account' : '/account';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, setUser, updateUserField } = useAuth();
  const { startLoading, stopLoading } = useLoadingActions();

  const updateProfile = useCallback(async (userId, updates) => {
    startLoading();
    try {
      const changes = {};
      if (updates.username && updates.username !== user.username) {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(updates.username)) {
          toast.error("Nom d'utilisateur invalide (3-30 caractères alphanumériques)");
          return;
        }
        changes.username = updates.username;
      }
      if (updates.firstName && updates.firstName !== user.firstName) {
        if (!updates.firstName || updates.firstName.length < 2) {
          toast.error("Un prénom valide (2 caractères minimum) est requis");
          return;
        }
        changes.firstName = updates.firstName;
      }
      if (updates.lastName && updates.lastName !== user.lastName) {
        if (!updates.lastName || updates.lastName.length < 2) {
          toast.error("Un nom valide (2 caractères minimum) est requis");
          return;
        }
        changes.lastName = updates.lastName;
      }

      if (Object.keys(changes).length === 0) {
        toast("Aucune modification détectée");
        return;
      }

      const { data } = await axios.patch(`${API_USER}/${userId}/updateprofile`, changes);

      if (data.success) {
        toast.success("Profil mis à jour");
        // On utilise setUser pour mettre à jour tout l'objet user comme dans le Zustand
        setUser(data.user);
        return data.user;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Erreur lors de la mise à jour");
      throw error;
    } finally {
      stopLoading();
    }
  }, [user, startLoading, stopLoading, setUser]);

  // --- Avatar ---
  const updateAvatar = useCallback(async (userId, file) => {
    if (!file) throw new Error("Aucune image détectée");

    startLoading();
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await axios.patch(`${API_USER}/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success("Avatar mis à jour");
        updateUserField('avatarUrl', data.avatarUrl);
        return data.avatarUrl;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, updateUserField]);

  // --- Password ---
  const changePassword = useCallback(async (userId, { currentPassword, newPassword, confirmPassword }, onSuccess) => {
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
  }, [startLoading, stopLoading]);

  // --- Email ---
  const updateEmail = useCallback(async (userId, newEmail) => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      throw new Error("Email invalide");
    }

    startLoading();
    try {
      const { data } = await axios.patch(`${API_USER}/${userId}/email`, { newEmail });

      if (data.success) {
        toast.success("Email mis à jour - Vérification requise");
        updateUserField('email', data.email);
        updateUserField('isVerified', data.isVerified);
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
  }, [startLoading, stopLoading, setUser]);

  // --- Status ---
  const updateStatus = useCallback(async (userId, status) => {
    if (!status || status.length > 150) {
      throw new Error("150 caractères maximum");
    }

    startLoading();
    try {
      const { data } = await axios.patch(`${API_USER}/${userId}/status`, { status });

      if (data.success) {
        toast.success("Statut mis à jour");
        updateUserField('status', data.status);
        return data.status;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, updateUserField]);

  // --- Daily Goal ---
  const updateDailyGoal = useCallback(async (userId, dailyGoal) => {
    if (isNaN(dailyGoal)) throw new Error("Doit être un nombre");
    if (dailyGoal < 1000 || dailyGoal > 50000) throw new Error("Entre 1000 et 50000");

    startLoading();
    try {
      const { data } = await axios.patch(`${API_USER}/${userId}/daily-goal`, { dailyGoal });

      if (data.success) {
        toast.success("Objectif mis à jour");
        updateUserField('dailyGoal', data.dailyGoal);
        return data.dailyGoal;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, updateUserField]);

  // --- Theme ---
  const updateThemePreference = useCallback(async (userId, themePreference) => {
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
  }, [startLoading, stopLoading, updateUserField]);

  // --- Language ---
  const updateLanguagePreference = useCallback(async (userId, languagePreference) => {
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
  }, [startLoading, stopLoading, updateUserField]);

  // --- Privacy Settings ---
  const updatePrivacySettings = useCallback(async (userId, privacySettings) => {
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
  }, [startLoading, stopLoading, updateUserField]);

  // --- Get User Profile ---
  const getUserProfile = useCallback(async (userId) => {
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
  }, [startLoading, stopLoading]);

  return (
    <UserContext.Provider value={{ 
      updateProfile,
      updateAvatar,
      changePassword,
      updateEmail,
      updateStatus,
      updateDailyGoal,
      updateThemePreference,
      updateLanguagePreference,
      updatePrivacySettings,
      getUserProfile
     }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};