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
  const { t } = useTranslation();

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
        toast.error(data.error || t("common.error"));
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
      toast.error(t("common.authcontext.register.validfirstname"));
      return;
    }
    if (!lastName || lastName.length < 2) {
      toast.error(t("common.authcontext.register.validlastname"));
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common.authcontext.register.validemail"));
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error(t("common.authcontext.register.validusername"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("common.authcontext.register.validpassword"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("common.authcontext.register.passwordmismatch"));
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
        },
      );

      const data = res.data;

      if (data.errors.username || data.errors.email) {
        toast.error(
          (data.errors.username && data.errors.email) ||
            data.errors.username ||
            data.errors.email ||
            t("common.error"),
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
          t("common.authcontext.register.error"),
      );
      throw err;
    }
  }, []);

  // --- Login ---
  const login = useCallback(async (LformData) => {
    const { email, password, stayLoggedIn } = LformData;
    if (!email || !password) {
      toast.error(t("common.authcontext.login.fillallfields"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common.authcontext.login.validemail"));
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
        },
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        setIsAuthenticated(true);
        checkAuth();
        toast.success(data.message);
        return data;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.login.error"),
      );
      throw err;
    }
  }, []);

  // --- Forgot Password ---
  const forgotPassword = useCallback(async (email, onSuccess) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common.authcontext.forgotpassword.validemail"));
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
        },
      );
      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common.authcontext.forgotpassword.error"),
      );
      throw err;
    }
  }, []);

  // --- Reset Password ---
  const resetPassword = useCallback(
    async (token, password, confirmPassword, onSuccess) => {
      if (!token)
        return toast.error(t("common.authcontext.resetpassword.validtoken"));
      if (password !== confirmPassword)
        return toast.error(
          t("common.authcontext.resetpassword.passwordmismatch"),
        );
      if (password.length < 8)
        return toast.error(t("common.authcontext.resetpassword.validpassword"));

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
          },
        );

        const data = res.data;

        if (data.error) {
          toast.error(data.error || t("common.error"));
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
            t("common.authcontext.resetpassword.error"),
        );
        throw err;
      }
    },
    [],
  );

  // --- Verify Email ---
  const verifyEmail = useCallback(async (code, onSuccess) => {
    if (code.length !== 6) {
      toast.error(t("common.authcontext.verifyemail.validcode"));
      throw new Error(t("common.authcontext.verifyemail.validcode"));
    }
    try {
      const res = await axios.post(
        `${API_AUTH}/verify-email`,
        {
          code,
        },
        {
          withCredentials: true,
        },
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error || t("common.error"));
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
        err.response?.data?.error || t("common.authcontext.verifyemail.error"),
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
        },
      );

      const data = res.data;

      if (data.error) {
        toast.error(data.error || t("common.error"));
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
          t("common.authcontext.resendverificationcode.error"),
      );
      throw err;
    }
  }, []);

  // --- Change verification email ---
  const changeVerificationEmail = useCallback(async (newEmail, onSuccess) => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return toast.error(
        t("common.authcontext.changeverificationemail.validemail"),
      );
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
        },
      );
      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        setUser(data.user);
        onSuccess();
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common.authcontext.changeverificationemail.error"),
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
        { withCredentials: true },
      );
      setIsAuthenticated(false);
      setUser(null);
      i18n.changeLanguage();
      document.documentElement.lang = navigator.language.slice(0, 2);
      toast.success(res.data.message || t("common.authcontext.logout.success"));
      onSuccess();
    } catch (err) {
      toast.error(t("common.authcontext.logout.error"));
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/${userId}/logout`,
        {},
        { withCredentials: true },
      );
      setIsAuthenticated(false);
      setUser(null);
      toast.success(
        res.data.message || t("common.authcontext.deleteaccount.success"),
      );
    } catch (err) {
      toast.error(t("common.authcontext.deleteaccount.error"));
      throw err;
    }
  }, []);

  // --- Two Factor Authentication ---
  const TwoFactorStatus = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_AUTH}/2fa/status`,
        {},
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        return data;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.status.error"),
      );
      throw err;
    }
  }, []);

  const enableTwoFactor = useCallback(async () => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/enable`,
        {},
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return data;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.enable.error"),
      );
      throw err;
    }
  }, []);

  const enableEmail2FA = useCallback(async () => {
    try {
      const res = await axios.post(`${API_AUTH}/2fa/email/enable`, {
        withCredentials: true,
      });
      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return data;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common.authcontext.2fa.enableemail.error"),
      );
      throw err;
    }
  }, []);

  const verifyTwoFactor = useCallback(async (token) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/verify`,
        { token },
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return data.backupCodes;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.verify.error"),
      );
      throw err;
    }
  }, []);

  const verifyEmail2FA = useCallback(async (code) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/email/verify`,
        { code },
        {
          withCredentials: true,
        },
      );
      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return data.backupCodes;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t("common.authcontext.2fa.verifyemail.error"),
      );
      throw err;
    }
  }, []);

  const disableTwoFactor = useCallback(async (token) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/disable`,
        { token },
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return true;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.disable.error"),
      );
      throw err;
    }
  }, []);

  const disableEmail2FA = useCallback(async (password) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/email/disable`,
        { password },
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      } else {
        toast.success(data.message);
        return true;
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.disable.error"),
      );
      throw err;
    }
  }, []);

  const verifyLoginTwoFactor = useCallback(
    async (email, stayLoggedIn, token, onSuccess) => {
      try {
        const res = await axios.post(
          `${API_AUTH}/2fa/verify-login`,
          { email, stayLoggedIn, token },
          {
            withCredentials: true,
          },
        );

        const data = res.data;
        if (data.error) {
          toast.error(data.error || t("common.error"));
          throw data.error;
        }
        setUser(data.user);
        setIsAuthenticated(true);
        onSuccess();
        return data;
      } catch (err) {
        toast.error(
          err.response?.data?.error || t("common.authcontext.2fa.login.error"),
        );
        throw err;
      }
    },
    [],
  );

  const useBackupCode = useCallback(async (email, backupCode, onSuccess) => {
    try {
      const res = await axios.post(
        `${API_AUTH}/2fa/backup-code`,
        { email, backupCode },
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      if (data.error) {
        toast.error(data.error || t("common.error"));
        throw data.error;
      }
      setUser(data.user);
      setIsAuthenticated(true);
      onSuccess();
      return data;
    } catch (err) {
      toast.error(
        err.response?.data?.error || t("common.authcontext.2fa.backup.error"),
      );
      throw err;
    }
  }, []);

  // WebAuthn functions
  const generateRegistrationKey = async () => {
    try {
      const response = await axios.post(
        `${API_AUTH}/2fa/webauthn/generate-registration`,
      );
      return response.data;
    } catch (error) {
      console.error("Registration options error:", error);
      throw new Error(
        error.response?.data?.message ||
          t("common.authcontext.2fa.generatekey.error"),
      );
    }
  };

  const verifyWebAuthnRegistration = async (attestationResponse) => {
    try {
      const response = await axios.post(
        `${API_AUTH}/2fa/webauthn/verify-registration`,
        { attestationResponse },
      );
      return response.data;
    } catch (error) {
      console.error("Registration verification error:", error);
      throw new Error(
        error.response?.data?.message ||
          t("common.authcontext.2fa.verifyregisterkey.error"),
      );
    }
  };

  // Gestion de l'enregistrement WebAuthn
  const registerWebAuthnCredential = async () => {
    try {
      // 1. Get registration options from server
      const data = await generateRegistrationKey();
      const options = data.options;

      // 2. Convert options for browser API
      const publicKey = {
        ...options,
        challenge: base64URLToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64URLToBuffer(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred) => ({
          ...cred,
          id: base64URLToBuffer(cred.id),
        })),
      };

      // 3. Create credential using browser API
      const credential = await navigator.credentials.create({
        publicKey,
      });

      // 4. Format for server
      const attestationResponse = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(
            credential.response.attestationObject,
          ),
          clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
        },
      };

      // 5. Verify with server
      await verifyWebAuthnRegistration(attestationResponse);
      return true;
    } catch (error) {
      console.error("WebAuthn registration failed:", error);
      throw error;
    }
  };

  const generateAuthenticationnKey = async (email) => {
    try {
      const response = await axios.post(
        `${API_AUTH}/2fa/webauthn/generate-authentication`,
        { email },
      );
      return response.data;
    } catch (error) {
      console.error("Authentication options error:", error);
      throw new Error(
        error.response?.data?.message ||
          t("common.authcontext.2fa.generatekey.error"),
      );
    }
  };

  // Gestion de l'authentification
  const authenticateWithWebAuthn = async (email, stayLoggedIn) => {
    try {
      // 1. Get authentication options from server
      const data = await generateAuthenticationnKey(email);
      const options = data.options;

      // 2. Convert options for browser API
      const publicKey = {
        ...options,
        challenge: base64URLToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64URLToBuffer(cred.id),
        })),
      };

      // 3. Get credential using browser API
      const credential = await navigator.credentials.get({
        publicKey,
      });

      console.log("WebAuthn credential:", credential);

      // 4. Format for server
      const assertionResponse = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: bufferToBase64URL(
            credential.response.authenticatorData,
          ),
          clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
          signature: bufferToBase64URL(credential.response.signature),
          userHandle: credential.response.userHandle
            ? bufferToBase64URL(credential.response.userHandle)
            : null,
        },
      };

      console.log("WebAuthn assertion response:", assertionResponse);

      // 5. Verify with server
      const login = await verifyLoginTwoFactor(
        email,
        stayLoggedIn,
        assertionResponse,
        () => {
          setIsAuthenticated(true);
          checkAuth();
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        },
      );

      //const result = await verifyWebAuthnAuthentication(
      //  assertionResponse,
      //  email
      //);
      console.log(login);
      return login;
    } catch (error) {
      console.error("WebAuthn authentication failed:", error);
      throw error;
    }
  };

  const base64URLToBuffer = (base64URL) => {
    const base64 = base64URL.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
  };

  const bufferToBase64URL = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

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
        isAuthenticated,
        isCheckingAuth,
        checkAuth,
        register,
        login,
        logout,
        deleteUser,
        verifyEmail,
        resendVerificationCode,
        changeVerificationEmail,
        forgotPassword,
        resetPassword,
        setUser,
        updateUserField,
        TwoFactorStatus,
        enableTwoFactor,
        enableEmail2FA,
        registerWebAuthnCredential,
        verifyTwoFactor,
        verifyEmail2FA,
        verifyWebAuthnRegistration,
        disableTwoFactor,
        disableEmail2FA,
        useBackupCode,
        verifyLoginTwoFactor,
        authenticateWithWebAuthn,
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
