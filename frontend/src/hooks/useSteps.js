import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";

const API_STEP = process.env.NODE_ENV === "production" ? "/api/step" : "/step";

export const useSteps = (userId) => {
  const [stepEntries, setStepEntries] = useState([]);
  const { getUserProfile } = useUser();

  const fetchStepEntries = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_STEP}/${userId}/mysteps`, {
        withCredentials: true,
      });

      if (data.success) {
        setStepEntries(data.steps);
      } else {
        toast.error("Erreur lors du chargement des données");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(
        err.response?.data?.error || "Erreur de connexion au serveur"
      );
    }
  }, [userId]);

  const addStepEntry = async (entryData) => {
    try {
      const { data } = await axios.post(
        `${API_STEP}/${userId}/new`,
        entryData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Entrée ajoutée");
        await fetchStepEntries();
        await getUserProfile(userId);
        return true;
      } else {
        toast.error(data.message || "Erreur lors de l'ajout");
        return false;
      }
    } catch (error) {
      console.error("Add error:", error);
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
      return false;
    }
  };

  const updateStepEntry = async (entryId, entryData) => {
    try {
      const { data } = await axios.put(
        `${API_STEP}/${userId}/${entryId}/modify`,
        entryData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Entrée modifiée");
        await fetchStepEntries();
        await getUserProfile(userId);
        return true;
      } else {
        toast.error(data.message || "Erreur lors de la modification");
        return false;
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la modification"
      );
      return false;
    }
  };

  const FavoriteEntry = async (entryId) => {
    try {
      const { data } = await axios.put(
        `${API_STEP}/${userId}/${entryId}/favorite`,
        { withCredentials: true }
      );

      if (data.success) {
        await fetchStepEntries();
        return true;
      } else {
        toast.error(data.message || "Erreur lors de la mise en favoris");
        return false;
      }
    } catch (error) {
      console.error("Favorites error:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la mise en favoris"
      );
      return false;
    }
  };

  const deleteStepEntry = async (entryId) => {
    try {
      const { data } = await axios.delete(
        `${API_STEP}/${userId}/${entryId}/delete`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Entrée supprimée");
        await fetchStepEntries();
        await getUserProfile(userId);
        return true;
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la suppression"
      );
      return false;
    }
  };

  const importSteps = async (file, onProgress) => {
    if (!file) return false;

    const formData = new FormData();
    formData.append("exported-data", file);
    try {
      const { data } = await axios.post(
        `${API_STEP}/${userId}/import`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onProgress) onProgress(percentCompleted);
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Le fichier a bien été importé");
        await fetchStepEntries();
        await getUserProfile(userId);
        return true;
      } else {
        toast.error("Erreur lors de l'importation");
        return false;
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de l'importation"
      );
      return false;
    }
  };

  return {
    stepEntries,
    fetchStepEntries,
    addStepEntry,
    updateStepEntry,
    FavoriteEntry,
    deleteStepEntry,
    importSteps,
  };
};
