import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
//Context
import { useTheme } from '../../context/ThemeContext'
// Components
import PrimaryBtn from '../../components/buttons/primaryBtn'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Play,
  UserPlus,
  Footprints,
  Trophy,
  Users,
  Award,
  Heart,
  Star,
  TrendingUp,
  Smartphone,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Activity,
  BarChart3,
  Gift,
  Crown,
  Gamepad2,
  Download,
  Sun,
  Moon,
} from 'lucide-react'
import './Home.css'

const Home = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Coureuse passionnée',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content:
        "Stepify a complètement transformé ma routine ! J'ai perdu 8kg en 3 mois tout en m'amusant. Les défis avec mes amis me motivent énormément !",
      rating: 5,
      stats: '8kg perdus • 3 mois',
    },
    {
      name: 'Thomas Martin',
      role: 'Cycliste urbain',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content:
        "L'aspect gamification est génial ! Je suis passé de 5000 à 15000 pas par jour. Les récompenses et le classement me poussent à me dépasser.",
      rating: 5,
      stats: '15k pas/jour • Niveau 47',
    },
    {
      name: 'Sophie Laurent',
      role: 'Maman active',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content:
        "Parfait pour concilier vie de famille et sport ! Les mini-défis s'adaptent à mon emploi du temps. Mes enfants adorent voir mes badges !",
      rating: 5,
      stats: '200+ défis • 6 mois',
    },
  ]

  const stats = [
    { number: '50K+', label: 'Utilisateurs actifs', icon: Users },
    { number: '2M+', label: 'Pas enregistrés', icon: Footprints },
    { number: '15K+', label: 'Défis complétés', icon: Trophy },
    { number: '98%', label: 'Satisfaction', icon: Heart },
  ]

  const features = [
    {
      icon: Activity,
      title: 'Suivi Multi-Activités',
      description:
        'Marche, course, vélo, natation - suivez toutes vos activités avec une précision GPS avancée et des métriques détaillées.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Gamepad2,
      title: 'Gamification Avancée',
      description:
        'Système de niveaux, badges rares, quêtes quotidiennes et récompenses personnalisées pour maintenir votre motivation.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Communauté Active',
      description:
        'Rejoignez des groupes, créez des équipes, participez à des ligues et défiez vos amis dans un environnement bienveillant.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Intelligents',
      description:
        "Tableaux de bord personnalisés, prédictions IA et conseils d'entraînement adaptatifs basés sur vos performances.",
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Crown,
      title: 'Classements Dynamiques',
      description:
        'Ligues hebdomadaires, tournois mensuels et championnats saisonniers avec prix réels et reconnaissance communautaire.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Gift,
      title: 'Récompenses Réelles',
      description:
        "Échangez vos points contre des produits sportifs, bons d'achat et expériences uniques avec nos partenaires premium.",
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  const steps = [
    {
      number: 1,
      title: 'Inscription Express',
      description:
        'Créez votre compte en 30 secondes avec votre email ou via Google/Apple. Personnalisez votre avatar et définissez vos objectifs personnalisés.',
      icon: UserPlus,
      details: [
        'Profil personnalisable',
        'Objectifs adaptatifs',
        'Synchronisation cloud',
      ],
    },
    {
      number: 2,
      title: 'Connexion Intelligente',
      description:
        "Connectez vos appareils (smartphone, montre, tracker) ou utilisez notre détection automatique d'activité basée sur l'IA.",
      icon: Smartphone,
      details: [
        'Compatible 50+ appareils',
        'Détection auto',
        'Synchronisation temps réel',
      ],
    },
    {
      number: 3,
      title: 'Activité & Progression',
      description:
        "Chaque mouvement compte ! Gagnez de l'XP, montez en niveau et débloquez de nouvelles fonctionnalités exclusives.",
      icon: TrendingUp,
      details: [
        'XP en temps réel',
        'Niveaux illimités',
        'Bonus multiplicateurs',
      ],
    },
    {
      number: 4,
      title: 'Défis & Communauté',
      description:
        "Rejoignez des défis publics, créez vos propres challenges et invitez vos amis à vous rejoindre dans l'aventure.",
      icon: Trophy,
      details: [
        'Défis quotidiens',
        'Challenges personnalisés',
        'Équipes et ligues',
      ],
    },
    {
      number: 5,
      title: 'Récompenses & Gloire',
      description:
        'Collectionnez badges, trophées et récompenses. Échangez vos points contre des prix réels et montez dans le classement !',
      icon: Award,
      details: ['Badges exclusifs', 'Boutique de récompenses', 'Statut VIP'],
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <div className="stepify-landing">
      {/* Animated Background */}
      <PrimaryBtn
        onClick={toggleTheme}
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </PrimaryBtn>
      <div className="animated-background">
        <motion.div className="background-shapes" style={{ y: backgroundY }}>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </motion.div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <motion.div
            className="floating-icon"
            animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Footprints size={60} />
          </motion.div>
          <motion.div
            className="floating-icon"
            animate={{ y: [-15, 15, -15], rotate: [2, -2, 2] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          >
            <Trophy size={80} />
          </motion.div>
          <motion.div
            className="floating-icon"
            animate={{ y: [-12, 12, -12], rotate: [-3, 3, -3] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
          >
            <Crown size={70} />
          </motion.div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <motion.div
              className="hero-badge"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={20} />
              <span>Nouvelle version 2.0 disponible !</span>
              <ArrowRight size={16} />
            </motion.div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="hero-title">
            <span className="gradient-text">Stepify</span>
          </motion.h1>

          <motion.h2 variants={itemVariants} className="hero-subtitle">
            Votre Aventure Fitness
          </motion.h2>

          <motion.p variants={itemVariants} className="hero-description">
            Transformez chaque pas en victoire, chaque course en quête épique.
            Rejoignez la révolution du fitness gamifié et découvrez le héros qui
            sommeille en vous.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-buttons">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              <UserPlus size={24} />
              Commencer l'Aventure
            </motion.button>

            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play size={24} />
              Voir la Démo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon">
                  <stat.icon size={32} />
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">
              <span className="gradient-text">Fonctionnalités</span>
              <br />
              Révolutionnaires
            </h2>
            <p className="section-subtitle">
              Découvrez un écosystème complet conçu pour transformer votre
              relation au sport
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section section-dark">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">
              Comment
              <br />
              <span className="gradient-text">Ça Marche ?</span>
            </h2>
            <p className="section-subtitle">
              5 étapes simples pour transformer votre routine en aventure épique
            </p>
          </motion.div>

          <div className="steps-grid">
            {/* Connection Line */}
            <div className="steps-line"></div>

            <div className="steps-list">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="step-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  {/* Step Number */}
                  <motion.div
                    className="step-number"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Step Content */}
                  <motion.div
                    className="step-content"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="step-header">
                      <div className="step-icon">
                        <step.icon size={24} />
                      </div>
                      <h3 className="step-title">{step.title}</h3>
                    </div>
                    <p className="step-description">{step.description}</p>

                    <div className="step-details">
                      {step.details.map((detail, detailIndex) => (
                        <span key={detailIndex} className="step-detail">
                          <CheckCircle size={16} />
                          {detail}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">
              <span className="gradient-text">Témoignages</span>
              <br />
              Inspirants
            </h2>
            <p className="section-subtitle">
              Découvrez comment Stepify a transformé la vie de nos utilisateurs
            </p>
          </motion.div>

          <div className="testimonials-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className="testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-content">
                  <motion.img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="testimonial-avatar"
                    whileHover={{ scale: 1.1 }}
                  />

                  <div className="testimonial-text">
                    <div className="testimonial-rating">
                      {[...Array(testimonials[currentTestimonial].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            size={24}
                            fill="currentColor"
                            style={{ color: 'var(--Couleur3)' }}
                          />
                        ),
                      )}
                    </div>

                    <blockquote className="testimonial-quote">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>

                    <div className="testimonial-author">
                      <div className="testimonial-info">
                        <h4>{testimonials[currentTestimonial].name}</h4>
                        <p>{testimonials[currentTestimonial].role}</p>
                      </div>
                      <div className="testimonial-stats">
                        {testimonials[currentTestimonial].stats}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="testimonial-nav">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${
                    index === currentTestimonial ? 'active' : ''
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="cta-title">
              <span className="gradient-text">Prêt pour l'Aventure ?</span>
            </h2>

            <p className="cta-description">
              Rejoignez plus de 50 000 aventuriers qui ont déjà transformé leur
              vie avec Stepify. Votre quête commence maintenant !
            </p>

            <div className="cta-buttons">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
              >
                <UserPlus size={28} />
                S'inscrire
              </motion.button>

              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={28} />
                Télécharger l'App
              </motion.button>
            </div>

            <div className="cta-features">
              <div className="cta-feature">
                <CheckCircle size={20} style={{ color: 'var(--turquoise)' }} />
                Gratuit pendant 30 jours
              </div>
              <div className="cta-feature">
                <CheckCircle size={20} style={{ color: 'var(--turquoise)' }} />
                Aucune carte requise
              </div>
              <div className="cta-feature">
                <CheckCircle size={20} style={{ color: 'var(--turquoise)' }} />
                Annulation à tout moment
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            className="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              className="video-container"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="video-placeholder">
                <Play size={80} />
                <p>Démo vidéo bientôt disponible</p>
              </div>
              <button
                className="close-button"
                onClick={() => setIsVideoPlaying(false)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Home
