import { useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useNavigate, Link } from "react-router-dom"
//icons
import { RiMailLine } from "react-icons/ri"
import { LuSend } from "react-icons/lu"
//CSS
import "./Pwd-manage.css"

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast("Veuillez entrer votre email")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "production" ? "/api/auth/forgot-password" : "/auth/forgot-password",
        { email },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.error) {
        toast.error(response.data.error)
      } else {
        toast.success("Email envoyé avec succès")
        navigate("/email-sent")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error(error?.response?.data?.error || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-body">
      <div className="auth-container reset-container">
        <div className="auth-col col-form reset-form-col">
          <div className="form-slide">
            <form className="auth-form reset-form" onSubmit={handleSubmit}>
              <h2>Mot de passe oublié? 🔑</h2>
              <p className="subtitle">Entrez votre email pour réinitialiser votre mot de passe</p>

              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <RiMailLine />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"} <LuSend />
              </button>

              <div className="form-footer">
                <span>Vous vous souvenez de votre mot de passe?</span>
                <Link to="/login">Se connecter</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword