import { useState, useEffect, useCallback } from "react";
import { useLoadingActions } from "../context/LoadingContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_STEP = process.env.NODE_ENV === 'production' ? '/api/step' : '/step';

export const useSteps = (userId) => {
    const [stepEntries, setStepEntries] = useState([]);
    const { startLoading, stopLoading } = useLoadingActions();

    const fetchStepEntries = useCallback(async () => {
        startLoading();
        try {
            const { data } = await axios.get(`${API_STEP}/${userId}/mysteps`,
                { withCredentials: true }
            );

            if (data.success) {
                setStepEntries(data.steps);
            } else {
                toast.error("Erreur lors du chargement des données");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Erreur de connexion au serveur");
        } finally {
            stopLoading();
        }
    }, [userId]);

    const addStepEntry = async (entryData) => {
        startLoading();
        try {
            const { data } = await axios.post(`${API_STEP}/${userId}/new`,
                entryData,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Entrée ajoutée avec succès");
                await fetchStepEntries();
                return true;
            } else {
                toast.error(data.message || "Erreur lors de l'ajout");
                return false;
            }
        } catch (error) {
            console.error("Add error:", error);
            toast.error("Erreur lors de l'ajout");
            return false;
        } finally {
            stopLoading();
        }
    };

    const updateStepEntry = async (entryId, entryData) => {
        startLoading();
        try {
            const { data } = await axios.put(`${API_STEP}/${userId}/${entryId}/modify`,
                entryData,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Entrée modifiée avec succès");
                await fetchStepEntries();
                return true;
            } else {
                toast.error(data.message || "Erreur lors de la modification");
                return false;
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Erreur lors de la modification");
            return false;
        } finally {
            stopLoading();
        }
    };

    const deleteStepEntry = async (entryId) => {
        startLoading();
        try {
            const { data } = await axios.delete(`${API_STEP}/${userId}/${entryId}/delete`,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Entrée supprimée avec succès");
                await fetchStepEntries();
                return true;
            } else {
                toast.error(data.message || "Erreur lors de la suppression");
                return false;
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Erreur lors de la suppression");
            return false;
        } finally {
            stopLoading();
        }
    };

    const importSteps = async (file, source) => {
        if (!file) return false;

        const formData = new FormData();
        formData.append('exported-data', file);

        startLoading();
        try {
            const { data } = await axios.post(`${API_STEP}/${userId}/import`,
                formData, 
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (data.success) {
                toast.success('Le fichier a bien été importé');
                await fetchStepEntries();
                return true;
            } else {
                toast.error('Erreur lors de l\'importation');
                return false;
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Erreur lors de l\'importation');
            return false;
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (userId) {
            fetchStepEntries();
        }
    }, [userId, fetchStepEntries]);

    return {
        stepEntries,
        fetchStepEntries,
        addStepEntry,
        updateStepEntry,
        deleteStepEntry,
        importSteps,
    };
};