import { useState } from 'react'
import InputField from '../../components/InputField'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter'
import PrimaryBtn from '../../components/buttons/primaryBtn'
import SecondaryBtn from '../../components/buttons/secondaryBtn'
import DangerBtn from '../../components/buttons/dangerBtn'
import BlueBtn from '../../components/buttons/blueBtn'
import { Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
// Icons
import { Mail, Lock, User, Phone } from 'lucide-react'
// CSS
import './Home.css'

function Home() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0 })

  return (
    <div className="component-demo">
      <div className="demo-container">
        <h2>Reusable Components Demo</h2>
        <p>
          Beautiful, consistent input fields with advanced password strength
          meter
        </p>

        <div className="demo-grid">
          <div className="demo-section">
            <h3>Input Field Variations</h3>

            <InputField
              id="demo-email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              autoComplete="email"
            />

            <InputField
              id="demo-username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={User}
              helperText="Must be at least 3 characters long"
            />

            <InputField
              id="demo-phone"
              type="tel"
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              error={
                phone && !/^\+?\d{10,}$/.test(phone.replace(/\D/g, ''))
                  ? 'Please enter a valid phone number'
                  : ''
              }
            />
          </div>

          <div className="demo-section">
            <h3>Password with Strength Meter</h3>

            <InputField
              id="demo-password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              autoComplete="new-password"
            />

            <PasswordStrengthMeter
              password={password}
              onStrengthChange={setPasswordStrength}
              showScore={true}
              showRequirements={true}
            />

            <InputField
              id="demo-confirm-password"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              autoComplete="new-password"
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />
          </div>
        </div>

        <div className="strength-summary">
          <h4>Password Strength: {passwordStrength.score}%</h4>
          <div className="strength-bar">
            <div
              className="strength-fill"
              style={{
                width: `${passwordStrength.score}%`,
                background:
                  passwordStrength.score >= 70
                    ? '#10b981'
                    : passwordStrength.score >= 50
                    ? '#eab308'
                    : passwordStrength.score >= 25
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
        </div>
        <p>Home</p>
        <PrimaryBtn style={{ marginBottom: '10px' }}>
          <Smartphone size={16} />
          {t('account.2fa-setup.setup-app.app-configured')}
        </PrimaryBtn>
        <SecondaryBtn style={{ marginBottom: '10px' }}>
          <Smartphone size={16} />
          {t('account.2fa-setup.setup-app.app-configured')}
        </SecondaryBtn>
        <DangerBtn style={{ marginBottom: '10px' }}>
          <Smartphone size={16} />
          {t('account.2fa-setup.setup-app.app-configured')}
        </DangerBtn>
        <BlueBtn style={{ marginBottom: '10px' }}>
          <Smartphone size={16} />
          {t('account.2fa-setup.setup-app.app-configured')}
        </BlueBtn>
      </div>
    </div>
  )
}

export default Home
