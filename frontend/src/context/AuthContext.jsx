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
import { useTranslation } from "react-i18next";
import GlobalLoader from "../utils/GlobalLoader";

const API_AUTH = process.env.NODE_ENV === "production" ? "/api/auth" : "/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useTranslation(["common"]);

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
        document.documentElement.lang = data.user.languagePreference;
        i18n.changeLanguage(data.user.languagePreference);
        setIsAuthenticated(data.success);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      if (data.error) {
        toast.error(data.error || t("common:common.error"));
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
      toast.error(t("common:common.authcontext.register.validfirstname"));
      return;
    }
    if (!lastName || lastName.length < 2) {
      toast.error(t("common:common.authcontext.register.validlastname"));
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common:common.authcontext.register.validemail"));
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error(t("common:common.authcontext.register.validusername"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("common:common.authcontext.register.validpassword"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("common:common.authcontext.register.passwordmismatch"));
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
            data.errors.email ||
            t("common:common.error")
        );
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        checkAuth();
        resetForm();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        (err.response?.data?.errors?.username &&
          err.response?.data?.errors?.email) ||
          err.response?.data?.errors?.username ||
          err.response?.data?.errors?.email ||
          t("common:common.authcontext.register.error")
      );
      throw err;
    }
  }, []);

  // --- Login ---
  const login = useCallback(async (LformData, resetForm, navigate) => {
    const { email, password, stayLoggedIn } = LformData;
    if (!email || !password) {
      toast.error(t("common:common.authcontext.login.fillallfields"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common:common.authcontext.login.validemail"));
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
        toast.error(data.error || t("common:common.error"));
        throw data.error;
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        checkAuth();
        resetForm();
        if (!data.user.isVerified) {
          await resendVerificationCode(
            () => {
              toast.error(
                t("common:common.authcontext.login.notverifiederror")
              );
            },
            () => {
              toast.success(
                t("common:common.authcontext.login.notverifiedsucess")
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
      toast.error(
        err.response?.data?.error || t("common:common.authcontext.login.error")
      );
      throw err;
    }
  }, []);

  // --- Forgot Password ---
  const forgotPassword = useCallback(async (email, onSuccess) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common:common.authcontext.forgotpassword.validemail"));
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
        toast.error(data.error || t("common:common.error"));
        throw data.error;
      } else {
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common:common.authcontext.forgotpassword.error")
      );
      throw err;
    }
  }, []);

  // --- Reset Password ---
  const resetPassword = useCallback(
    async (token, password, confirmPassword, onSuccess) => {
      if (!token)
        return toast.error(
          t("common:common.authcontext.resetpassword.validtoken")
        );
      if (password !== confirmPassword)
        return toast.error(
          t("common:common.authcontext.resetpassword.passwordmismatch")
        );
      if (password.length < 8)
        return toast.error(
          t("common:common.authcontext.resetpassword.validpassword")
        );

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
          toast.error(data.error || t("common:common.error"));
          throw data.error;
        } else {
          onSuccess();
          toast.success(data.message);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.error ||
            t("common:common.authcontext.resetpassword.error")
        );
        throw err;
      }
    },
    []
  );

  // --- Verify Email ---
  const verifyEmail = useCallback(async (code, onSuccess) => {
    if (code.length !== 6) {
      toast.error(t("common:common.authcontext.verifyemail.validcode"));
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
        toast.error(data.error || t("common:common.error"));
        throw data.error;
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        checkAuth();
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common:common.authcontext.verifyemail.error")
      );
      throw err;
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
        toast.error(data.error || t("common:common.error"));
        OnError();
        throw data.error;
      } else {
        setIsAuthenticated(true);
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      OnError();
      toast.error(
        err.response?.data?.error ||
          t("common:common.authcontext.resendverificationcode.error")
      );
      throw err;
    }
  }, []);

  // --- Change verification email ---
  const changeVerificationEmail = useCallback(async (newEmail, onSuccess) => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return toast.error(t("common:common.authcontext.changeverificationemail.validemail"));
    }
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
        toast.error(data.error || t("common:common.error"));
        throw data.error;
      } else {
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common:common.authcontext.changeverificationemail.error")
      );
      throw err;
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
      i18n.changeLanguage();
      document.documentElement.lang = navigator.language.slice(0, 2);
      toast.success(res.data.message || t("common:common.authcontext.logout.success"));
      onSuccess();
    } catch (err) {
      toast.error(t("common:common.authcontext.logout.error"));
      throw err;
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
      toast.success(res.data.message || t("common:common.authcontext.deleteaccount.success"));
      onSuccess();
    } catch (err) {
      toast.error(t("common:common.authcontext.deleteaccount.error"));
      throw err;
    }
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
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
