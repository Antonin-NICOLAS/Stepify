import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import i18n from "./i18n";
import GlobalLoader from "../utils/GlobalLoader";

const API_AUTH = process.env.NODE_ENV === "production" ? "/api/auth" : "/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Mise à jour partielle de l'utilisateur
  const updateUserField = useCallback((field, value) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  // --- Check Auth ---
  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API_AUTH}/check-auth`, {
        withCredentials: true,
      });
      const data = res.data;
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(data.success);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      if (data.error === "Session expirée ou invalide") {
        toast.error("Session expirée ou invalide. Veuillez vous reconnecter");
        throw data.error;
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      console.error("Error checking auth:", err);
    }
  }, []);

  // --- Register ---
  const register = useCallback(async (RformData, resetForm) => {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      stayLoggedIn,
    } = RformData;

    if (!firstName || firstName.length < 2) {
      toast.error("Un prénom valide (2 caractères minimum) est requis");
      return;
    }
    if (!lastName || lastName.length < 2) {
      toast.error("Un nom valide (2 caractères minimum) est requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error(
        "Nom d'utilisateur invalide (3-30 caractères alphanumériques)"
      );
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const res = await axios.post(
        `${API_AUTH}/register`,
        {
          firstName,
          lastName,
          username,
          email,
          password,
          stayLoggedIn,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.errors.username || data.errors.email) {
        toast.error(
          (data.errors.username && data.errors.email) ||
            data.errors.username ||
            data.errors.email
        );
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        resetForm();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        (err.response?.data?.errors?.username &&
          err.response?.data?.errors?.email) ||
          err.response?.data?.errors?.username ||
          err.response?.data?.errors?.email ||
          "Erreur lors de l'inscription"
      );
    }
  }, []);

  // --- Login ---
  const login = useCallback(async (LformData, resetForm, navigate) => {
    const { email, password, stayLoggedIn } = LformData;
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      const res = await axios.post(
        `${API_AUTH}/login`,
        {
          email,
          password,
          stayLoggedIn,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error);
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        resetForm();
        if (!data.user.isVerified) {
          await resendVerificationCode(
            () => {
              toast.success(
                "Un code vous a été envoyé pour vérifier votre adresse mail"
              );
            },
            () => {
              toast.error(
                `Cliquez sur "renvoyer un mail" pour recevoir un nouveau code`
              );
            }
          );
          navigate("/email-verification");
        } else {
          navigate("/dashboard");
        }
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la connexion");
      throw err;
    }
  }, []);

  // --- Forgot Password ---
  const forgotPassword = useCallback(async (email, onSuccess) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    try {
      const res = await axios.post(
        `${API_AUTH}/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      if (data.error) {
        toast.error(data.error);
      } else {
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Erreur lors de l'envoi de l'email"
      );
      throw err;
    }
  }, []);

  // --- Reset Password ---
  const resetPassword = useCallback(
    async (token, password, confirmPassword, onSuccess) => {
      if (!token) return toast.error("Lien invalide ou expiré");
      if (password !== confirmPassword)
        return toast.error("Les mots de passe ne correspondent pas");
      if (password.length < 8)
        return toast.error("Mot de passe trop court (min 8 caractères)");

      try {
        const res = await axios.post(
          `${API_AUTH}/reset-password/${token}`,
          {
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = res.data;

        if (data.error) {
          toast.error(data.error);
        } else {
          onSuccess();
          toast.success(data.message);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.error || "Erreur lors de la réinitialisation"
        );
      }
    },
    []
  );

  // --- Verify Email ---
  const verifyEmail = useCallback(async (code, onSuccess) => {
    if (code.length !== 6) {
      toast.error("Veuillez entrer le code complet à 6 chiffres");
      throw new Error("Invalid code length");
    }
    try {
      const res = await axios.post(
        `${API_AUTH}/verify-email`,
        {
          code,
        },
        {
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error);
      } else {
        setIsAuthenticated(true);
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de vérification");
    }
  }, []);

  // --- Resend verification code ---
  const resendVerificationCode = useCallback(async (OnError, onSuccess) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/resend-verification-code`,
        {},
        {
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error);
        OnError();
      } else {
        setIsAuthenticated(true);
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      OnError();
      toast.error(
        err.response?.data?.error || "Erreur lors de l'envoi du code"
      );
    }
  }, []);

  // --- Change verification email ---
  const changeVerificationEmail = useCallback(async (newEmail, onSuccess) => {
    if (!newEmail) return toast.error("Veuillez entrer votre email");

    try {
      const res = await axios.post(
        `${API_AUTH}/change-verification-email`,
        {
          newEmail,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      if (data.error) {
        toast.error(data.error);
      } else {
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Erreur lors de l'envoi de l'email"
      );
    }
  }, []);

  // --- Logout ---
  const logout = useCallback(async (onSuccess) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
      toast.success(res.data.message || "Déconnecté avec succès");
      onSuccess();
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    }
  }, []);

  const deleteUser = useCallback(async (onSuccess) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/${user?._id}/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
      toast.success(res.data.message || "Compte supprimé");
      onSuccess();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
      if (user) {
        document.documentElement.lang = user.languagePreference;
        i18n.changeLanguage(user.languagePreference);
      }
    };
    verifyAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        updateUserField,
        checkAuth,
        register,
        login,
        forgotPassword,
        resetPassword,
        verifyEmail,
        deleteUser,
        changeVerificationEmail,
        resendVerificationCode,
        logout,
      }}
    >
      {isCheckingAuth && <GlobalLoader />}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
