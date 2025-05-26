import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { Mail, AlertTriangle, Users, Check, X } from "lucide-react"

const Friends = () => {
    const { user } = useAuth();
    const { notifications, acceptFriendRequest } = useNotifications(user?._id);

        // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    const handleAcceptInvitation = async (requesterId, invitationId) => {
        try {
            await acceptFriendRequest(requesterId, invitationId);
        } catch (error) {
            console.error("Error accepting invitation:", error);
        }
    }

    return (
        <div className="challenges-container">
            <h1>Friends</h1>
            <div className="challenges-invitations-tab">
                {notifications && notifications.length > 0 ? (
                    <div className="invitations-list">
                        {notifications.map((invitation) => (
                            <div key={invitation?._id} className="invitation-card">
                                <div className="invitation-header">
                                    <div className="invitation-title">
                                        <h3>{invitation?.challenge?.name}</h3>
                                        {new Date(invitation?.DeleteAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                                            <span className="expiring-badge">
                                                <AlertTriangle size={12} /> Expire bientôt
                                            </span>
                                        )}
                                    </div>
                                    <p className="invitation-description">{invitation?.content}</p>
                                </div>

                                <div className="invitation-details">
                                    <div className="invitation-sender">
                                        <span className="detail-label">Invité par:</span>
                                        <div className="sender-info">
                                            <img
                                                src={invitation?.sender?.avatarUrl || "/placeholder.svg"}
                                                alt={invitation?.sender?.username}
                                                className="sender-avatar"
                                            />
                                            <span className="sender-name">
                                                {invitation?.sender?.firstName} {invitation?.sender?.lastName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="invitation-meta">
                                        <div className="invitation-date">
                                            <span className="detail-label">Reçu le:</span>
                                            <span className="detail-value">{formatDate(invitation?.createdAt)}</span>
                                        </div>

                                        <div className="invitation-expiry">
                                            <span className="detail-label">Expire le:</span>
                                            <span className="detail-value">{formatDate(invitation?.DeleteAt)}</span>
                                        </div>

                                        <div className="invitation-participants">
                                            <span className="detail-label">Participants:</span>
                                            <span className="detail-value">
                                                <Users size={16} />
                                                {invitation.participants}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="invitation-actions">
                                    <button
                                        className="action-button primary"
                                        onClick={() => handleAcceptInvitation(invitation.sender._id, invitation._id)}
                                    >
                                        <Check size={16} />
                                        <span>Accepter</span>
                                    </button>

                                    <button
                                        className="action-button secondary"
                                        onClick={() => handleDeclineInvitation(invitation._id)}
                                    >
                                        <X size={16} />
                                        <span>Refuser</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-invitations">
                        <div className="no-data-message">
                            <Mail size={48} />
                            <h3>Aucune invitation</h3>
                            <p>Vous n'avez pas d'invitations à des défis pour le moment.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Friends;