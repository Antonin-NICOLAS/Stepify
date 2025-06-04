import { createContext, useContext, useCallback, useState } from "react";
import axios from "axios";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const API_USER =
  process.env.NODE_ENV === "production" ? "/api/account" : "/account";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, setUser, updateUserField } = useAuth();
  const { t } = useTranslation(["common"]);

  const updateProfile = useCallback(
    async (userId, updates) => {
      try {
        const changes = {};
        if (updates.username && updates.username !== user.username) {
          if (!/^[a-zA-Z0-9_]{3,30}$/.test(updates.username)) {
            toast.error(
              "Nom d'utilisateur invalide (3-30 caractères alphanumériques)"
            );
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

        const { data } = await axios.patch(
          `${API_USER}/${userId}/updateprofile`,
          changes
        );

        if (data.success) {
          toast.success(data.message || "Profil mis à jour");
          setUser(data.user);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error ||
            error.message ||
            "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [user, setUser]
  );

  // --- Avatar ---
  const updateAvatar = useCallback(
    async (userId, file) => {
      if (!file) return toast.error("Aucune image détectée");
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        const { data } = await axios.patch(
          `${API_USER}/${userId}/avatar`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (data.success) {
          toast.success(data.message || "Avatar mis à jour");
          updateUserField("avatarUrl", data.avatarUrl);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Password ---
  const changePassword = useCallback(
    async (
      userId,
      { currentPassword, newPassword, confirmPassword },
      onSuccess
    ) => {
      if (!currentPassword) return toast.error("Mot de passe actuel requis");
      if (newPassword.length < 8) return toast.error("8 caractères minimum");
      if (newPassword !== confirmPassword)
        return toast.error("Mots de passe différents");

      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/password`, {
          currentPassword,
          newPassword,
        });

        if (data.success) {
          toast.success(data.message || "Mot de passe mis à jour");
          onSuccess?.();
          return true;
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    []
  );

  // --- Email ---
  const updateEmail = useCallback(
    async (userId, newEmail) => {
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        toast.error("Email invalide");
      }
      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/email`, {
          newEmail,
        });

        if (data.success) {
          toast.success(
            data.message || "Email mis à jour - Vérification requise"
          );
          updateUserField("email", data.email);
          updateUserField("isVerified", data.isVerified);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [setUser]
  );

  // --- Status ---
  const updateStatus = useCallback(
    async (userId, status) => {
      if (!status || status.length > 150) {
        return toast.error("150 caractères maximum");
      }
      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/status`, {
          status,
        });

        if (data.success) {
          toast.success("Statut mis à jour");
          updateUserField("status", data.status);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Daily Goal ---
  const updateDailyGoal = useCallback(
    async (userId, dailyGoal, OnSuccess) => {
      if (isNaN(dailyGoal))
        return toast.error("L'objectif quotidien doit être un nombre");
      if (dailyGoal < 1000 || dailyGoal > 50000)
        return toast.error("Compris entre 1000 et 50000 pas");

      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/daily-goal`, {
          dailyGoal,
        });

        if (data.success) {
          OnSuccess();
          toast.success(data.message || "Objectif mis à jour");
          updateUserField("dailyGoal", data.dailyGoal);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Theme ---
  const updateThemePreference = useCallback(
    async (userId, themePreference) => {
      if (!["light", "dark", "auto"].includes(themePreference)) {
        return toast.error("Préference invalide");
      }
      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/theme`, {
          themePreference,
        });

        if (data.success) {
          toast.success(data.message || "Thème mis à jour");
          updateUserField("themePreference", data.themePreference);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Language ---
  const updateLanguagePreference = useCallback(
    async (userId, languagePreference) => {
      if (!["fr", "en", "es", "de"].includes(languagePreference)) {
        return toast.error("Langue non supportée");
      }
      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/language`, {
          languagePreference,
        });

        if (data.success) {
          i18n.changeLanguage(languagePreference, (err) => {
            if (!err) {
              i18n.loadNamespaces(["account", "settings"], () => {});
            }
          });
          document.documentElement.lang = languagePreference;
          toast.success(t("common:common.usercontext.languageupdated"));
          updateUserField("languagePreference", data.languagePreference);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Privacy Settings ---
  const updatePrivacySettings = useCallback(
    async (userId, privacySettings) => {
      try {
        const { data } = await axios.patch(`${API_USER}/${userId}/privacy`, {
          privacySettings,
        });

        if (data.success) {
          toast.success(data.message || "Confidentialité mise à jour");
          updateUserField("privacySettings", data.privacySettings);
          getUserProfile(userId);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la mise à jour"
        );
        throw error;
      }
    },
    [updateUserField]
  );

  // --- Get User Profile ---
  const getUserProfile = useCallback(async (userId) => {
    try {
      const { data } = await axios.get(`${API_USER}/${userId}/profile`);

      if (data.success) {
        setUser(data.user);
        return data.user;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erreur lors de la récupération"
      );
      throw error;
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        updateProfile,
        updateAvatar,
        changePassword,
        updateEmail,
        updateStatus,
        updateDailyGoal,
        updateThemePreference,
        updateLanguagePreference,
        updatePrivacySettings,
        getUserProfile,
        //TODO: sessions & notif pref
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
