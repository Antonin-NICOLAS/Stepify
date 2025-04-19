import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLoaderStore } from "./Loading";

const API_AUTH = process.env.NODE_ENV === "production" ? "/api/auth" : "/auth";

export const useAuthStore = create((set, get) => ({
    // --- Auth State ---
    user: null,
    isAuthenticated: false,
    error: null,

    // --- Auth Status ---
    checkAuth: async () => {
        const { startLoading, stopLoading } = useLoaderStore();
        startLoading();
        try {
            const res = await axios.get(`${API_AUTH}/check-auth`, { withCredentials: true });
            const data = res.data;
            if (data.user) {
                set({ isAuthenticated: data.success, user: data.user });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (err) {
            set({ user: null, isAuthenticated: false });
            console.error("error while checking auth:", err);
        } finally {
            stopLoading();
        }
    },

    // --- Register ---
    register: async (RformData, resetForm) => {
        const { startLoading, stopLoading } = useLoaderStore();
        const { firstName, lastName, username, email, password, confirmPassword, stayLoggedIn } = RformData;
        if (!firstName || !lastName || !username || !email || !password) {
            toast.error("Tous les champs sont requis");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        if (password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/register`, {
                firstName,
                lastName,
                username,
                email,
                password,
                stayLoggedIn,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = res.data;

            if (data.error) {
                toast.error(data.error);
            } else {
                set({ isAuthenticated: true, user: data.user });
                resetForm();
                toast.success(data.message);
            }

        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
        } finally {
            stopLoading();
        }
    },

    // --- Login ---
    login: async (LformData, resetForm, navigate) => {
        const { startLoading, stopLoading } = useLoaderStore();
        const { email, password, stayLoggedIn } = LformData;
        if (!email || !password) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/login`, {
                email,
                password,
                stayLoggedIn
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = res.data;

            if (data.error) {
                toast.error(data.error);
            } else {
                set({ isAuthenticated: true, user: data.user });
                resetForm();
                if (!data.user.isVerified) {
                    await resendVerificationCode(
                        () => {toast.success("Un code vous a été envoyé pour vérifier votre adresse mail")},
                        () => {toast.error(`Cliquez sur "renvoyer un mail" pour recevoir un nouveau code`)},);
                    navigate("/email-verification");
                } else {
                    navigate("/dashboard");
                }
                toast.success(data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de la connexion");
        } finally {
            stopLoading();
        }
    },

    // --- Forgot Password ---
    forgotPassword: async (email, onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore();
        if (!email) return toast("Veuillez entrer votre email");
        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/forgot-password`, {
                email
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = res.data;
            if (data.error) {
                toast.error(data.error)
            } else {
                onSuccess()
                toast.success(data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de l'envoi de l'email");
        } finally {
            stopLoading();
        }
    },

    // --- Reset Password ---
    resetPassword: async (token, password, confirmPassword, onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore();
        if (!token) return toast.error("Lien invalide ou expiré");
        if (password !== confirmPassword) return toast.error("Les mots de passe ne correspondent pas");
        if (password.length < 6) return toast.error("Mot de passe trop court (min 6 caractères)");

        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/reset-password/${token}`, {
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = res.data;

            if (data.error) {
                toast.error(data.error);
            } else {
                onSuccess();
                toast.success(data.message);
                set({ isAuthenticated: false, user: null });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de la réinitialisation");
        } finally {
            stopLoading();
        }
    },

    // --- Verify Email ---
    verifyEmail: async (code, onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore();
        if (code.length !== 6) {
            toast.error("Veuillez entrer le code complet à 6 chiffres")
            return
        }
        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/verify-email`, {
                code
            }, {
                withCredentials: true
            });

            const data = res.data;

            if (data.error) {
                toast.error(data.error);
            } else {
                set({ isAuthenticated: true, user: data.user });
                onSuccess();
                toast.success(data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur de vérification");
        } finally {
            stopLoading();
        }
    },

    // --- Resend verification code ---
    resendVerificationCode: async (OnError, onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore();
        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/resend-verification-code`, {}, {
                withCredentials: true
            });

            const data = res.data;

            if (data.error) {
                toast.error(data.error);
                OnError();
            } else {
                set({ isAuthenticated: true, user: data.user });
                onSuccess();
                toast.success(data.message);
            }
        } catch (err) {
            OnError();
            toast.error(err.response?.data?.error || "Erreur lors de l'envoi du code");
        } finally {
            stopLoading();
        }
    },

    // --- Logout ---
    logout: async (onSuccess) => {
        const { startLoading, stopLoading } = useLoaderStore();
        startLoading();
        try {
            const res = await axios.post(`${API_AUTH}/logout`, {}, { withCredentials: true });
            set({ user: null, isAuthenticated: false });
            toast.success(res.data.message || "Déconnecté avec succès");
            onSuccess();
        } catch (err) {
            toast.error("Erreur lors de la déconnexion");
        } finally {
            stopLoading();
        }
    },
}));