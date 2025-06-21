import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
// Components
import PrimaryButton from '../../components/buttons/primaryBtn'
import SecondaryButton from '../../components/buttons/secondaryBtn'
// Icons
import {
  LogIn,
  UserPlus,
  Footprints,
  Trophy,
  Users,
  Award,
  Heart,
  Target,
} from 'lucide-react'
// CSS
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const featureCardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }

  const stepItemVariants = {
    offscreen: {
      x: -100,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }

  const stepItemVariantsRight = {
    offscreen: {
      x: 100,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }
  return (
    <div className="unauth-home-wrapper">
      {/* Hero Section */}
      <div className="unauth-home-container">
        <div className="unauth-home-background-shapes">
          <motion.div
            className="shape"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
          <motion.div
            className="shape"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -360 }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{ background: 'rgba(23, 162, 184, 0.15)' }}
          />
          <motion.div
            className="shape"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{ background: 'rgba(0, 123, 255, 0.1)' }}
          />
        </div>

        <motion.div
          className="unauth-home-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="header-gradient">
            Débloquez Votre Potentiel.
            <br />
            Défiez Vos Limites.
          </motion.h1>
          <motion.p variants={itemVariants}>
            Transformez chaque pas, chaque course, chaque coup de pédale en une
            aventure gamifiée. Gagnez de l'XP, débloquez des récompenses et
            grimpez dans le classement avec Stepify !
          </motion.p>
          <motion.div variants={itemVariants} className="unauth-home-buttons">
            <PrimaryButton
              icon={UserPlus}
              onClick={() => {
                navigate('/login')
              }}
            >
              Rejoignez l'aventure
            </PrimaryButton>
            <SecondaryButton
              icon={LogIn}
              onClick={() => {
                navigate('/login')
              }}
            >
              Connectez-vous
            </SecondaryButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Fonctionnalités Clés
        </motion.h2>
        <div className="features-grid">
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Footprints />
            </div>
            <h3>Suivi d'Activité Précis</h3>
            <p>
              Enregistrez vos pas, distances et calories brûlées avec une
              précision inégalée, que vous marchiez, couriez ou pédaliez.
            </p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Trophy />
            </div>
            <h3>Défis et Récompenses</h3>
            <p>
              Participez à des défis stimulants, gagnez de l'XP, montez en
              niveau et débloquez des récompenses exclusives pour rester motivé.
            </p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Users />
            </div>
            <h3>Classement et Amis</h3>
            <p>
              Comparez vos performances avec vos amis et d'autres utilisateurs,
              grimpez dans le classement et défiez-vous mutuellement.
            </p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Award />
            </div>
            <h3>Gamification Complète</h3>
            <p>
              Transformez votre routine en jeu avec des objectifs personnalisés,
              des badges à collectionner et des niveaux à atteindre.
            </p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Target />
            </div>
            <h3>Tableau de Bord Intuitif</h3>
            <p>
              Visualisez vos progrès avec des graphiques clairs et des
              statistiques détaillées pour une meilleure compréhension de votre
              activité.
            </p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureCardVariants}
          >
            <div className="icon-wrapper">
              <Heart />
            </div>
            <h3>Motivation et Bien-être</h3>
            <p>
              Restez actif et améliorez votre bien-être général grâce à une
              application conçue pour vous inspirer et vous soutenir.
            </p>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Comment Ça Marche ?
        </motion.h2>
        <div className="steps-grid">
          <motion.div
            className="step-item"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={stepItemVariants}
          >
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Créez Votre Compte</h3>
              <p>
                Inscrivez-vous rapidement et personnalisez votre profil pour
                commencer votre aventure Stepify.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="step-item"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={stepItemVariantsRight}
          >
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Suivez Vos Activités</h3>
              <p>
                Connectez votre appareil ou entrez manuellement vos activités
                (marche, course, vélo) pour enregistrer vos progrès.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="step-item"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={stepItemVariants}
          >
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Rejoignez des Défis</h3>
              <p>
                Explorez les défis publics ou créez les vôtres avec vos amis.
                Atteignez des objectifs pour gagner de l'XP.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="step-item"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={stepItemVariantsRight}
          >
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Débloquez des Récompenses</h3>
              <p>
                Chaque effort est récompensé ! Gagnez des badges, des niveaux et
                des récompenses personnalisées.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="step-item"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={stepItemVariants}
          >
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Grimpez dans le Classement</h3>
              <p>
                Mesurez-vous à la communauté et à vos amis. Qui sera le champion
                de Stepify ?
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Prêt à Transformer Votre Activité ?
        </motion.h2>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Rejoignez des milliers d'utilisateurs qui ont déjà fait de Stepify
          leur partenaire de bien-être.
        </motion.p>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/signup" className="action-button primary">
            <UserPlus size={20} />
            <span>Commencez Votre Aventure Stepify</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
