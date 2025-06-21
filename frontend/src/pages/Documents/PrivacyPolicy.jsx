import './TermsOfService.css'

function PrivacyPolicy() {
  return (
    <div className="terms-container">
      <h1>Politique de confidentialité de Stepify</h1>
      <p className="last-update">Dernière mise à jour : 21 juin 2025</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Chez Stepify, nous accordons une grande importance à la
          confidentialité de vos données. Cette politique explique comment nous
          collectons, utilisons, partageons et protégeons vos informations
          personnelles lorsque vous utilisez notre application web Stepify
          (ci-après “l’Application”).
        </p>
      </section>

      <section>
        <h2>2. Qui sommes nous ?</h2>
        <p>
          Stepify est une application qui vous permet de suivre vos activités
          physiques (marche, course, vélo), de fixer des objectifs, de
          participer à des défis et de progresser avec vos amis. Notre objectif
          est de vous aider à améliorer votre bien-être physique et de vous
          aider à atteindre vos objectifs de fitness.
        </p>
      </section>

      <section>
        <h2>3. Données collectées</h2>
        <p>
          Nous collectons les données suivantes lors de votre utilisation de
          Stepify :
        </p>
        <ul>
          <li>
            <strong>Données d’identification</strong> :
            <ul>
              <li>Nom</li>
              <li>Prénom</li>
              <li>Nom d’utilisateur</li>
              <li>Adresse e-mail</li>
              <li>Langue préférée</li>
              <li>Photo de profil (facultatif)</li>
            </ul>
          </li>
          <li>
            <strong>Données de santé</strong> :
            <ul>
              <li>Distance parcourue</li>
              <li>Nombre de pas</li>
              <li>Objectif quotidien</li>
              <li>Points d'expérience (XP)</li>
              <li>Défis et réalisations</li>
            </ul>
          </li>
          <li>
            <strong>Données techniques</strong> :
            <ul>
              <li>Adresse IP</li>
              <li>
                Informations sur l’appareil (navigateur, système d’exploitation)
              </li>
              <li>Cookies et jetons de session</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Finalités du traitement</h2>
        <p>
          Vos données sont collectées afin de :
          <ul>
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Suivre vos activités physiques et vos progrès</li>
            <li>Vous proposer des classements, des défis et des récompenses</li>
            <li>Permettre l'interaction sociale</li>
            <li>
              Vous envoyer des emails de vérification, de sécurité ou de
              notification
            </li>
          </ul>
        </p>
      </section>

      <section>
        <h2>5. Base légale du traitement</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD), le traitement de vos données est fondé sur :
          <ul>
            <li>
              Votre consentement explicite lors de la création de votre compte
              et de l’utilisation de l’Application.
            </li>
            <li>
              La nécessité de traiter vos données pour l’exécution du contrat
              entre vous et Stepify (fourniture du service).
            </li>
            <li>
              La loi applicable (par exemple, la loi sur la protection des
              données). Ce sont nos obligaitions légale.
            </li>
          </ul>
        </p>
      </section>

      <section>
        <h2>6. Partage des données</h2>
        <p>Aucune donnée personnelle n'est partagée avec des tiers.</p>
      </section>

      <section>
        <h2>7. Cookies et traceurs</h2>
        <p>
          Stepify utilise des cookies uniquement pour gérer votre session
          utilisateur et mémoriser vos préférences (langue, thème)
        </p>
      </section>

      <section>
        <h2>8. Durée de conservation</h2>
        <p>
          Vos données sont conservées :
          <ul>
            <li>Tant que votre compte est actif</li>
            <li>Jusqu’à 1 an après la dernière activité sur votre compte</li>
            <li>
              Jusqu’à 1 mois après la suppression de votre compte, sauf
              obligation contraire
            </li>
          </ul>
          Vous pouvez supprimer vos données à tout moment en supprimant votre
          compte en bas de la page "Réglages" ou en nous contactant.
        </p>
      </section>

      <section>
        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          pour protéger vos données : chiffrement, mots de passe sécurisés,
          double authentification, pare-feu, etc.
        </p>
      </section>

      <section>
        <h2>10. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez de :
          <ul>
            <li>
              Le droit d'accès et de modification de vos données personnelles
            </li>
            <li>Le droit de suppression de vos données personnelles</li>
            <li>Le droit de retirer votre consentement</li>
            <li>Le droit de limiter le traitement de vos données</li>
            <li>Le droit de vous opposer au traitement de vos données</li>
          </ul>
        </p>
      </section>

      <section>
        <h2>11. Modifications</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout
          moment. Vous serez informé de tout changement majeur via l’application
          ou par email.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Pour toute question, vous pouvez nous écrire à : <br />
          📧{' '}
          <a href="mailto:stepify.contact@gmail.com">
            stepify.contact@gmail.com
          </a>{' '}
          <br />
          🌐 https://step-ify.vercel.app
        </p>
      </section>
    </div>
  )
}

export default PrivacyPolicy
