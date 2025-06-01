# 🏃‍♂️ Stepify — Bouge, Joue, Progresse !

Stepify est une application web de suivi d'activité physique ludique. Marchez, courez ou pédalez pour gagner des XP, débloquez des récompenses, grimpez dans le classement et défiez vos amis. Le tout dans une interface moderne et gamifiée ! 🚀

🌐 [Frontend (Vercel)](https://step-ify.vercel.app)  
🔗 [Backend (Vercel)](https://stepify-backend.vercel.app)

---

## 📌 Fonctionnalités principales

- Suivi des activités physiques (marche, course, vélo)
- Compteur de pas & calcul de distance
- Classement général et entre amis 🏆
- Système d'expérience (XP) & niveaux
- Récompenses personnalisées à débloquer 🎁
- Défis à rejoindre ou créer entre amis 💪
- Tableau de bord interactif avec graphiques
- Authentification sécurisée & gestion de compte
- Notifications : invitations, récompenses, etc.

---

## 🔧 À faire (Roadmap / Summer Contest)

- [ ] 🔒 **Lien de réinitialisation de mot de passe** : afficher qu’il expire dans 1 heure
- [ ] 📊 **Remplacer les graphiques Highcharts** par Chart.js
- [ ] 🧩 **Universaliser tous les icônes** (Design System)
- [ ] 💡 **Ajouter un layout modals** pour sortir en cliquant à l’extérieur :
  - [x] Challenge
  - [x] Rewards
  - [x] Steps
  - [x] Friends
- [ ] 🏅 **Calcul du rang et durée passée à ce rang** (ex: "Tu es resté 1er pendant 24h !")
- [ ] ✅ **Ajout de vérification de mot de passe côté frontend**: — — — — —
- [ ] 📈 **Nouveau record** : informer l'utilisateur quand il bat son record personnel
- [ ] ⏳ **Date réelle d’obtention des récompenses** (pas la date de vérification)
- [x] ⏰ **Support des cron jobs Vercel** (actuellement fonctionne seulement en dev)
- [ ] 🎨 **Mettre en rose les liens de footer de confidentialité**
- [ ] 🎖️ **Gestion des récompenses de classement (1er, 2e, 3e...)**
- [ ] 📊 **Fonction “Comparer” dans la page Récompenses**

---

## 🌱 Idées de fonctionnalités à ajouter

Voici quelques idées pour rendre Stepify encore plus engageant :

### 🎯 Gamification Avancée
- **Quêtes quotidiennes et hebdomadaires**
  - [x] **Badges à collectionner**
- **Système de saisons ou événements à durée limitée**
- **Classement hebdomadaire / mensuel réinitialisé régulièrement**

### 💬 Social & Communauté
- Chat intégré entre amis
- Fil d’actualité avec les derniers exploits des amis
- Système de commentaires sur les défis

### 📱 Notifications & UI
- Notifications push (via service worker ou Firebase)
  - [x] Dark Mode / Thèmes personnalisés
- Animations de progression avec confettis, effets de montée de niveau…

### 📉 Statistiques et Analyse
- Heatmap des jours actifs
  - [x] Graphiques de performance par activité
  - [x] Historique des XP, récompenses et positions dans le classement

### 🛠 Tech Improvements
- PWA (Progressive Web App) pour utilisation hors ligne
- Version mobile optimisée (responsive + gestures)
- Système de feedback in-app pour les utilisateurs

---

## 🧑‍💻 Stack Technique

- **Frontend**: Node.js, React Context, Chart.js, Lucide
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Auth**: JWT, Cookies sécurisés, Email verification
- **Hosting**: Vercel
- **Traduction multilingue**: `google-translate-api-x`

---

## 🧠 Auteur

Développé avec passion par un lycéen français 🧪, passionné par la science, le sport et la programmation, dans le but de **motiver le monde à bouger tout en s’amusant**.