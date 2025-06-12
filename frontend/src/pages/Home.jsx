import PrimaryBtn from '../components/buttons/primaryBtn'
import SecondaryBtn from '../components/buttons/secondaryBtn'
import DangerBtn from '../components/buttons/dangerBtn'
import BlueBtn from '../components/buttons/blueBtn'
import { Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function Home() {
  const { t } = useTranslation()
  return (
    <>
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
    </>
  )
}

export default Home
