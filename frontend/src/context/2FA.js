import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_2FA =
  process.env.NODE_ENV === 'production' ? '/api/auth/2fa' : '/auth/2fa'

export const use2FA = () => {
  const { t } = useTranslation()
  const { setUser, setIsAuthenticated, checkAuth } = useAuth()

  // --- Two Factor Authentication ---
  const TwoFactorStatus = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_2FA}/status`,
        {},
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        return data
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.status.error'),
      )
      throw err
    }
  }, [])

  const enableTwoFactor = useCallback(async () => {
    try {
      const res = await axios.post(
        `${API_2FA}/enable`,
        {},
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        return data
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.enable.error'),
      )
      throw err
    }
  }, [])

  const enableEmail2FA = useCallback(async () => {
    try {
      const res = await axios.post(`${API_2FA}/email/enable`, {
        withCredentials: true,
      })
      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        return data
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t('common.authcontext.2fa.enableemail.error'),
      )
      throw err
    }
  }, [])

  const verifyTwoFactor = useCallback(async (token) => {
    try {
      const res = await axios.post(
        `${API_2FA}/verify`,
        { token },
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        await TwoFactorStatus()
        return data.backupCodes
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.verify.error'),
      )
      throw err
    }
  }, [])

  const verifyEmail2FA = useCallback(async (code) => {
    try {
      const res = await axios.post(
        `${API_2FA}/email/verify`,
        { code },
        {
          withCredentials: true,
        },
      )
      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        await TwoFactorStatus()
        return data.backupCodes
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t('common.authcontext.2fa.verifyemail.error'),
      )
      throw err
    }
  }, [])

  const disableTwoFactor = useCallback(async (token) => {
    try {
      const res = await axios.post(
        `${API_2FA}/disable`,
        { token },
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        await TwoFactorStatus()
        return true
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.disable.error'),
      )
      throw err
    }
  }, [])

  const disableEmail2FA = useCallback(async (password) => {
    try {
      const res = await axios.post(
        `${API_2FA}/email/disable`,
        { password },
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(data.message)
        await TwoFactorStatus()
        return true
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.disable.error'),
      )
      throw err
    }
  }, [])

  const verifyLoginTwoFactor = useCallback(
    async (email, stayLoggedIn, token, onSuccess) => {
      try {
        const { data } = await axios.post(
          `${API_2FA}/verify-login`,
          { email, stayLoggedIn, token },
          {
            withCredentials: true,
          },
        )

        if (data.success) {
          setUser(data.user)
          setIsAuthenticated(true)
          onSuccess()
          return data
        } else {
          toast.error(data.error || t('common.error'))
          throw data.error
        }
      } catch (err) {
        toast.error(
          err.response?.data?.error || t('common.authcontext.2fa.login.error'),
        )
        throw err
      }
    },
    [],
  )

  // WebAuthn functions
  const generateRegistrationKey = async () => {
    try {
      const response = await axios.post(
        `${API_2FA}/webauthn/generate-registration`,
      )
      return response.data
    } catch (error) {
      console.error('Registration options error:', error)
      throw new Error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.generatekey.error'),
      )
    }
  }

  const verifyWebAuthnRegistration = async (
    attestationResponse,
    deviceName,
  ) => {
    try {
      const response = await axios.post(
        `${API_2FA}/webauthn/verify-registration`,
        { attestationResponse, deviceName },
      )
      return response.data
    } catch (error) {
      console.error('Registration verification error:', error)
      throw new Error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.verifyregisterkey.error'),
      )
    }
  }

  // Gestion de l'enregistrement WebAuthn
  const registerWebAuthnCredential = async (deviceName = 'Mon appareil') => {
    try {
      // 1. Get registration options from server
      const data = await generateRegistrationKey()
      const options = data.options

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
      }

      // 3. Create credential using browser API
      const credential = await navigator.credentials.create({
        publicKey,
      })

      // 4. Format for server
      const attestationResponse = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        challenge: options.challenge,
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(
            credential.response.attestationObject,
          ),
          clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
        },
      }

      // 5. Verify with server
      const finaldata = await verifyWebAuthnRegistration(
        attestationResponse,
        deviceName,
      )
      console.log('WebAuthn registration response:', finaldata)
      if (finaldata.success) {
        await checkAuth()
        return finaldata
      } else {
        toast.error(finaldata.error || t('common.error'))
        throw finaldata.error
      }
    } catch (error) {
      console.error('WebAuthn registration failed:', error)
      toast.error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.verifyregisterkey.error'),
      )
      throw error
    }
  }

  const generateAuthenticationnKey = async (email) => {
    try {
      const response = await axios.post(
        `${API_2FA}/webauthn/generate-authentication`,
        { email },
      )
      return response.data
    } catch (error) {
      console.error('Authentication options error:', error)
      throw new Error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.generatekey.error'),
      )
    }
  }

  // Gestion de l'authentification
  const authenticateWithWebAuthn = async (email, stayLoggedIn) => {
    try {
      // 1. Get authentication options from server
      const data = await generateAuthenticationnKey(email)
      const options = data.options

      // 2. Convert options for browser API
      const publicKey = {
        ...options,
        challenge: base64URLToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64URLToBuffer(cred.id),
        })),
      }

      // 3. Get credential using browser API
      const credential = await navigator.credentials.get({
        publicKey,
      })

      console.log('WebAuthn credential:', credential)

      // 4. Format for server
      const assertionResponse = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        challenge: options.challenge,
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
      }

      console.log('WebAuthn assertion response:', assertionResponse)

      // 5. Verify with server
      const login = await verifyLoginTwoFactor(
        email,
        stayLoggedIn,
        assertionResponse,
        () => {
          setIsAuthenticated(true)
          checkAuth()
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        },
      )

      console.log(login)
      return login
    } catch (error) {
      console.error('WebAuthn authentication failed:', error)
      toast.error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.login.error'),
      )
      throw error
    }
  }

  const base64URLToBuffer = (base64URL) => {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (base64.length % 4)) % 4
    const padded = base64 + '='.repeat(padLen)
    const binary = atob(padded)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  const bufferToBase64URL = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // --- Delete a webauthn credential ---
  const removeWebAuthnCredential = useCallback(async (credentialId) => {
    try {
      const { data } = await axios.delete(
        `${API_2FA}/webauthn/remove/${credentialId}`,
        {},
      )
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(
          data.message || t('common.authcontext.2fa.removecredential.success'),
        )
        return data
      }
    } catch (error) {
      console.error('Remove WebAuthn credential error:', error)
      toast.error(
        error.response?.data?.message ||
          t('common.authcontext.2fa.removecredential.error'),
      )
      throw error
    }
  }, [])

  // --- Use backup code ---
  const useBackupCode = useCallback(async (email, backupCode, onSuccess) => {
    try {
      const res = await axios.post(
        `${API_2FA}/backup-code`,
        { email, backupCode },
        {
          withCredentials: true,
        },
      )

      const data = res.data
      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      }
      setUser(data.user)
      setIsAuthenticated(true)
      onSuccess()
      return data
    } catch (err) {
      toast.error(
        err.response?.data?.error || t('common.authcontext.2fa.backup.error'),
      )
      throw err
    }
  }, [])

  // --- Set preferred method ---
  const setPreferredMethod = useCallback(async (method) => {
    try {
      const { data } = await axios.post(
        `${API_2FA}/set-preferred-method`,
        { method },
        {
          withCredentials: true,
        },
      )

      if (data.error) {
        toast.error(data.error || t('common.error'))
        throw data.error
      } else {
        toast.success(
          data.message || t('account.2fa-setup.preferred-method-updated'),
        )
        return data
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          t('common.authcontext.2fa.setpreferredmethod.error'),
      )
      throw err
    }
  }, [])

  return {
    TwoFactorStatus,
    enableTwoFactor,
    enableEmail2FA,
    registerWebAuthnCredential,
    verifyTwoFactor,
    verifyEmail2FA,
    disableTwoFactor,
    disableEmail2FA,
    useBackupCode,
    verifyLoginTwoFactor,
    authenticateWithWebAuthn,
    removeWebAuthnCredential,
    setPreferredMethod,
  }
}
