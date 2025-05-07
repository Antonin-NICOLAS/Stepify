import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '../utils/GlobalLoader';
import { toast } from 'react-hot-toast';

const API_AUTH = process.env.NODE_ENV === 'production' ? '/api/auth' : '/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Mise à jour partielle de l'utilisateur
  const updateUserField = useCallback((field, value) => {
    setUser(prev => (prev ? { ...prev, [field]: value } : null));
  }, []);

  // --- Check Auth ---
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`${API_AUTH}/check-auth`, { withCredentials: true });
      const data = res.data;
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(data.success);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      if (data.error === 'Session expirée ou invalide') {
        toast.error('Session expirée ou invalide. Veuillez vous reconnecter');
        throw data.error;
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      console.error("Error checking auth:", err);
    } finally {
      setIsLoading(false)
    }
  }, []);

  // --- Register ---
  const register = useCallback(async (RformData, resetForm) => {
    const { firstName, lastName, username, email, password, confirmPassword, stayLoggedIn } = RformData;

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
      toast.error("Nom d'utilisateur invalide (3-30 caractères alphanumériques)");
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

      if (res.data.errors.username || res.data.errors.email) {
        toast.error(res.data.errors.username && res.data.errors.email || res.data.errors.username || res.data.errors.email);
      } else {
        setUser(res.data.user);
        setIsAuthenticated(true);
        resetForm();
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.errors?.username && err.response?.data?.errors?.email || err.response?.data?.errors?.username || err.response?.data?.errors?.email || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Login ---
  const login = useCallback(async (LformData, resetForm, navigate) => {
    const { email, password, stayLoggedIn } = LformData;
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true)
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
      console.log('requête lancée')

      const data = res.data;

      if (data.error) {
        toast.error(data.error);
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        resetForm();
        if (!data.user.isVerified) {
          await resendVerificationCode(
            () => { toast.success("Un code vous a été envoyé pour vérifier votre adresse mail") },
            () => { toast.error(`Cliquez sur "renvoyer un mail" pour recevoir un nouveau code`) },);
          navigate("/email-verification");
        } else {
          navigate("/dashboard");
        }
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la connexion");
      throw err;
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Forgot Password ---
  const forgotPassword = useCallback(async (email, onSuccess) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Reset Password ---
  const resetPassword = useCallback(async (token, password, confirmPassword, onSuccess) => {
    if (!token) return toast.error("Lien invalide ou expiré");
    if (password !== confirmPassword) return toast.error("Les mots de passe ne correspondent pas");
    if (password.length < 8) return toast.error("Mot de passe trop court (min 8 caractères)");

    setIsLoading(true)
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
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la réinitialisation");
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Verify Email ---
  const verifyEmail = useCallback(async (code, onSuccess) => {
    if (code.length !== 6) {
      toast.error("Veuillez entrer le code complet à 6 chiffres")
      return
    }
    setIsLoading(true)
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
        setIsAuthenticated(true)
        setUser(data.user)
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de vérification");
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Resend verification code ---
  const resendVerificationCode = useCallback(async (OnError, onSuccess) => {
    setIsLoading(true)
    try {
      const res = await axios.post(`${API_AUTH}/resend-verification-code`, {}, {
        withCredentials: true
      });

      const data = res.data;

      if (data.error) {
        toast.error(data.error);
        OnError();
      } else {
        setIsAuthenticated(true)
        setUser(data.user)
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      OnError();
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading]);

  // --- Change verification email ---
  const changeVerificationEmail = useCallback(async (newEmail, onSuccess, Finally) => {
    if (!newEmail) return toast.error("Veuillez entrer votre email");

    setIsLoading(true)
    try {
      const res = await axios.post(`${API_AUTH}/change-verification-email`, {
        newEmail
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
        setUser(data.user)
        onSuccess()
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading])

  // --- Logout ---
  const logout = useCallback(async (onSuccess) => {
    setIsLoading(true)
    try {
      const res = await axios.post(`${API_AUTH}/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false)
      setUser(false)
      toast.success(res.data.message || "Déconnecté avec succès");
      onSuccess();
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsLoading(false)
    }
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isLoading,
      isAuthenticated,
      error,
      updateUserField,
      checkAuth,
      register,
      login,
      forgotPassword,
      resetPassword,
      verifyEmail,
      changeVerificationEmail,
      resendVerificationCode,
      logout
    }}>
      {isLoading && <GlobalLoader />}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};