import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
// loader
import GlobalLoader from '../../utils/GlobalLoader'
// icons
import {
  Icon,
  Footprints,
  Spline,
  Watch,
  Flame,
  Activity,
  Trophy,
  Calendar,
  Zap,
  Check,
  X,
  Lock,
  Unlock,
  CalendarIcon,
  Users,
  Clock,
  Hash,
  Crown,
  Medal,
  Award,
  Share2,
  UserPlus,
  MessageSquare,
} from 'lucide-react'
import { sneaker, watchActivity } from '@lucide/lab'
import { Line, Pie } from 'react-chartjs-2'

const ChallengeDetailModal = ({
  challenge,
  onClose,
  onDelete,
  onLeave,
  user,
}) => {
  const { sendFriendRequest } = useNotifications(user?._id)
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef(null)

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const computeGlobalProgress = (participants = []) => {
    if (!Array.isArray(participants) || !participants.length) return 0
    const total = participants.reduce((sum, p) => sum + (p.progress || 0), 0)
    return Math.round(total / participants.length)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatgoal = (value, type) => {
    switch (type) {
      case 'steps':
        return `${value} pas`
      case 'steps-time':
        return `${value} pas par jour`
      case 'distance':
        return `${value} km`
      case 'distance-time':
        return `${value} km par jour`
      case 'calories':
        return `${value} kcal`
      case 'calories-time':
        return `${value} kcal par jour`
      case 'xp':
        return `${value} XP`
      default:
        return value
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="status-badge upcoming">
            <Calendar size={12} /> À venir
          </span>
        )
      case 'active':
        return (
          <span className="status-badge active">
            <Zap size={12} /> En cours
          </span>
        )
      case 'completed':
        return (
          <span className="status-badge completed">
            <Check size={12} /> Terminé
          </span>
        )
      default:
        return null
    }
  }

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'xp':
        return <Trophy size={16} />
      case 'xp-time':
        return <Award size={16} />
      case 'steps':
        return <Footprints size={16} />
      case 'steps-time':
        return <Icon iconNode={sneaker} size={16} />
      case 'distance':
        return <Spline size={16} />
      case 'distance-time':
        return <Watch size={16} />
      case 'calories':
        return <Flame size={16} />
      case 'calories-time':
        return <Icon iconNode={watchActivity} size={16} />
      case 'any':
        return <Activity size={16} />
    }
  }

  const getDaysRemaining = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Generate progress chart data
  const generateProgressChartData = (challenge) => {
    const now = new Date()
    const startDate = new Date(challenge.startDate)
    const days = Math.min(
      7,
      Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)),
    )

    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    })

    // Progression linéaire jusqu'à la valeur actuelle
    const progressData = Array.from({ length: days }, (_, i) =>
      Math.round((i / (days - 1)) * challenge.progress),
    )

    return {
      labels,
      datasets: [
        {
          label: 'Progression (%)',
          data: progressData,
          backgroundColor: 'rgba(74, 145, 158, 0.2)',
          borderColor: 'rgba(74, 145, 158, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  // Generate participants distribution chart data
  const generateParticipantsChartData = (challenge) => {
    // Group participants by progress ranges
    const ranges = [
      { label: '0-25%', count: 0 },
      { label: '26-50%', count: 0 },
      { label: '51-75%', count: 0 },
      { label: '76-100%', count: 0 },
    ]

    challenge.participants.forEach((participant) => {
      if (participant.progress <= 25) {
        ranges[0].count++
      } else if (participant.progress <= 50) {
        ranges[1].count++
      } else if (participant.progress <= 75) {
        ranges[2].count++
      } else {
        ranges[3].count++
      }
    })

    return {
      labels: ranges.map((r) => r.label),
      datasets: [
        {
          data: ranges.map((r) => r.count),
          backgroundColor: [
            'rgba(206, 106, 107, 0.7)',
            'rgba(235, 172, 162, 0.7)',
            'rgba(190, 211, 195, 0.7)',
            'rgba(74, 145, 158, 0.7)',
          ],
          borderColor: [
            'rgba(206, 106, 107, 1)',
            'rgba(235, 172, 162, 1)',
            'rgba(190, 211, 195, 1)',
            'rgba(74, 145, 158, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
        },
      },
    },
  }

  // Handle friend request
  const handleFriendRequest = async (participant) => {
    setIsLoading(true)
    try {
      await sendFriendRequest(participant.user._id)
    } catch (error) {
      console.error('Error sending friend request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} ref={modalRef}>
      {isLoading && <GlobalLoader />}
      <div className="modal challenge-detail-modal">
        <div className="modal-header">
          <h3>Détails du défi</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="challenge-detail-content">
          <div className="challenge-detail-header">
            <div className="challenge-detail-title">
              <h2>{challenge.name[user?.languagePreference]}</h2>
              <div className="challenge-detail-badges">
                {getStatusBadge(challenge.status)}
                {challenge.isPrivate ? (
                  <span className="privacy-badge">
                    <Lock size={12} /> Privé
                  </span>
                ) : (
                  <span className="privacy-badge public">
                    <Unlock size={12} /> Public
                  </span>
                )}
              </div>
            </div>

            <p className="challenge-detail-description">
              {challenge.description[user?.languagePreference]}
            </p>
          </div>

          <div className="challenge-detail-info">
            <div className="info-section">
              <h4>Informations générales</h4>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Créé par</span>
                  <div className="creator-info">
                    <img
                      src={challenge.creator?.avatarUrl || '/placeholder.svg'}
                      alt={challenge.creator?.username}
                      className="creator-avatar"
                    />
                    <span className="creator-name">
                      {challenge.creator?.firstName}{' '}
                      {challenge.creator?.lastName}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Dates</span>
                  <span className="info-value">
                    <CalendarIcon size={16} />
                    {formatDate(challenge.startDate)} -{' '}
                    {formatDate(challenge.endDate)}
                  </span>
                </div>
                {challenge.time && (
                  <div className="info-item">
                    <span className="info-label">Durée</span>
                    <span className="info-value">
                      <Clock size={16} />
                      {challenge.time} jours
                    </span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Objectif</span>
                  <span className="info-value">
                    {getActivityTypeIcon(challenge.activityType)}
                    {formatgoal(challenge.goal, challenge.activityType)}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Participants</span>
                  <span className="info-value">
                    <Users size={16} />
                    {challenge.participants.length} participant
                    {challenge.participants.length > 1 ? 's' : ''}
                  </span>
                </div>

                {challenge.status === 'active' && (
                  <div className="info-item">
                    <span className="info-label">Temps restant</span>
                    <span className="info-value">
                      <Clock size={16} />
                      {getDaysRemaining(challenge.endDate) > 0
                        ? `${getDaysRemaining(challenge.endDate)} jours`
                        : 'Dernier jour !'}
                    </span>
                  </div>
                )}

                {challenge.isPrivate && (
                  <div className="info-item">
                    <span className="info-label">Code d'accès</span>
                    <span className="info-value code">
                      <Hash size={16} />
                      {challenge.accessCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h4>Progression du défi</h4>

              <div className="challenge-progress-detail">
                <div className="progress-header">
                  <span>Progression globale</span>
                  <span>{computeGlobalProgress(challenge.participants)}%</span>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${computeGlobalProgress(
                        challenge.participants,
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="challenge-charts">
                <div className="chart-container">
                  <h5>Évolution de la progression</h5>
                  <div className="chart" style={{ height: '200px' }}>
                    <Line
                      data={generateProgressChartData(challenge)}
                      options={lineChartOptions}
                    />
                  </div>
                </div>

                <div className="chart-container">
                  <h5>Répartition des participants</h5>
                  <div className="chart" style={{ height: '200px' }}>
                    <Pie
                      data={generateParticipantsChartData(challenge)}
                      options={pieChartOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
            {challenge.participants.length > 0 && (
              <div className="info-section">
                <h4>Classement des participants</h4>

                <div className="participants-list">
                  {challenge.participants
                    .slice(0, 10)
                    .map((participant, index) => (
                      <div
                        key={participant.userId}
                        className={`participant-item ${
                          participant.userId === user?._id ? 'current-user' : ''
                        }`}
                      >
                        <div className="participant-rank">
                          {index === 0 ? (
                            <Crown size={16} className="rank-icon gold" />
                          ) : index === 1 ? (
                            <Medal size={16} className="rank-icon silver" />
                          ) : index === 2 ? (
                            <Award size={16} className="rank-icon bronze" />
                          ) : (
                            <span className="rank-number">{index + 1}</span>
                          )}
                        </div>

                        <div className="participant-avatar">
                          <img
                            src={
                              participant?.user.avatarUrl || '/placeholder.svg'
                            }
                            alt={participant?.user.username}
                          />
                        </div>

                        <div className="participant-info">
                          <span className="participant-name">
                            {participant.user.firstName}{' '}
                            {participant.user.lastName}
                          </span>
                          <span className="participant-username">
                            @{participant.user.username}
                          </span>
                        </div>

                        <div className="participant-progress-container">
                          <div className="participant-value">
                            {formatgoal(
                              participant.goal,
                              challenge.activityType,
                            )}
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar"
                              style={{ width: `${participant.progress}%` }}
                            ></div>
                            <span className="progress-text">
                              {participant.progress}%
                            </span>
                          </div>
                        </div>

                        {participant.user._id !== user?._id &&
                          user.friends.some((f) => f.userId === user?._id) && (
                            <div className="participant-actions">
                              <button
                                className="action-icon-button"
                                title="Envoyer un message"
                              >
                                <MessageSquare size={16} />
                              </button>
                              <button
                                className="action-icon-button"
                                title="Ajouter en ami"
                                onClick={() => handleFriendRequest(participant)}
                              >
                                <UserPlus size={16} />
                              </button>
                            </div>
                          )}
                      </div>
                    ))}

                  {challenge.participants.length > 10 && (
                    <button className="show-more-button">
                      Voir tous les participants (
                      {challenge.participants.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="challenge-detail-actions">
            {challenge.status !== 'completed' && (
              <>
                <button className="action-button primary">
                  <Share2 size={16} />
                  <span>Partager</span>
                </button>

                {challenge.creator._id === user?._id &&
                  challenge.status !== 'completed' && (
                    <button
                      className="action-button secondary"
                      onClick={onDelete}
                    >
                      <X size={16} />
                      <span>Supprimer ce défi</span>
                    </button>
                  )}
                {challenge.creator._id !== user?._id &&
                  challenge.status !== 'completed' && (
                    <button
                      className="action-button secondary"
                      onClick={onLeave}
                    >
                      <X size={16} />
                      <span>Quitter ce défi</span>
                    </button>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeDetailModal
