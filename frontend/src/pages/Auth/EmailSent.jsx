import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
// Components
import SecondaryBtn from '../../components/buttons/secondaryBtn'
//icons
import {
  MailCheck,
  CornerDownLeft,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
//CSS
import './EmailSent.css'

function EmailSent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="email-sent-page">
      <div className="auth-container">
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-logo">
              <span>Stepify</span>
            </div>
            <div className="auth-stats">
              <div
                className="auth-stat-item"
                style={{ flexDirection: 'column' }}
              >
                <h3>{t('auth.emailsent.visual.title')}</h3>
                <p>{t('auth.emailsent.visual.description')}</p>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <Mail />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.emailsent.visual.step1')}</h4>
                  <p>{t('auth.emailsent.visual.step1description')}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <AlertCircle />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.emailsent.visual.step2')}</h4>
                  <p>{t('auth.emailsent.visual.step2description')}</p>
                </div>
              </div>
              <div className="auth-stat-item">
                <div className="auth-stat-icon">
                  <CheckCircle2 />
                </div>
                <div className="auth-stat-info">
                  <h4>{t('auth.emailsent.visual.step3')}</h4>
                  <p>{t('auth.emailsent.visual.step3description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="auth-icon-container">
                <div className="auth-icon">
                  <MailCheck />
                </div>
              </div>
              <h2>{t('auth.emailsent.content.title')}</h2>
              <p className="auth-subtitle">
                {t('auth.emailsent.content.description')}
              </p>
            </div>

            <div className="auth-form-content">
              <div className="email-sent-message">
                <p>{t('auth.emailsent.content.message1')}</p>
                <p>{t('auth.emailsent.content.message2')}</p>
              </div>

              <div className="email-sent-info">
                <p>{t('auth.emailsent.content.infotitle')}</p>
                <ul>
                  <li>{t('auth.emailsent.content.infodescription')}</li>
                  <li>{t('auth.emailsent.content.correctemail')}</li>
                </ul>
              </div>

              <SecondaryBtn onClick={() => navigate('/forgot-password')}>
                <CornerDownLeft />
                <span>{t('common.back')}</span>
              </SecondaryBtn>
            </div>

            <div className="auth-form-footer">
              <span>{t('auth.emailsent.footer.question')}</span>
              <a href="mailto:stepify.contact@gmail.com">
                {t('auth.emailsent.footer.button')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSent
