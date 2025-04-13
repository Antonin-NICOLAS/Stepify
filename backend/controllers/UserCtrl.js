const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// SOMMAIRE
//// ACCOUNT MANAGEMENT ////
// - create new account
// - delete account

//// ACCOUNT REQ ////
// - login
// - disconnect
// - get profile

//// UPDATE AN ACCOUNT ////
// - change avatar
// - change username
// - change email
// - change password
// - change status
// - change daily goal

//// ACCOUNT MANAGEMENT ////

// create new account
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body

    // Vérifications
    if (!firstName) {
        return res.json({ error: "Le prénom est requis" });
    }
    if (!lastName) {
        return res.json({ error: "Le nom est requis" });
    }
    if (!email) {
        return res.json({ error: "L'email est requis" });
    }
    if (!username) {
        return res.json({ error: "Le nom d'utilisateur est requis" });
    }
    if (!password || password.length < 6) {
        return res.json({ error: "Un mot de passe est requis, d'une longueur de 6 caractères au moins" });
    }

    // l'adresse mail doit être unique
    const emailexist = await UserModel.findOne({ email });
    if (emailexist) {
        return res.json({ error: "L'email est déjà associé à un compte" });
    }
    // le nom d'utilisateur doit être unique
    const usernameexist = await UserModel.findOne({ username });
    if (usernameexist) {
        return res.json({ error: "Le nom d'utilisateur est déjà associé à un compte" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await UserModel.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role: 'user'
        })
        const options = {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            domain: process.env.NODE_ENV === "production" ? 'stepify.vercel.app' : '', //TODO ajouter le domaine
          }
          const token = jwt.sign({
                id: newUser._id,
                nom: newUser.lastName,
                prenom: newUser.firstName,
                email: newUser.email,
                role: newUser.role
          },
            process.env.JWT_SECRET,
            { expiresIn: '2d' })
      
          return res.status(201).cookie('jwtauth', token, options).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete an account
const deleteUser = async (req, res) => {
    const { userId } = req.params

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId)
        if (!deletedUser) return res.status(404).json({ error: "Utilisateur introuvable" })
        res.status(200).json({ message: "Compte supprimé avec succès" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//// ACCOUNT REQ ////

// login
const loginUser = async (req, res) => {
    const { email, password, stayLoggedIn } = req.body //TODO vérifier le stayloggedin

    try {
        // Trouver l'utilisateur par son email
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(400).json({ error: "L'email n'est associé à aucun compte" })

        // Vérifier si le mot de passe est correct
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' })

        // Générer un token JWT
        const cookieDuration = stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
        const expiration = stayLoggedIn ? '7d' : '2d'
        const options = {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            maxAge: cookieDuration,
            expires: new Date(Date.now() + cookieDuration),
            domain: process.env.NODE_ENV === "production" ? 'stepify.vercel.app' : '', //TODO ajouter le domaine
        }
        jwt.sign({
            id: user._id,
            nom: user.lastName,
            prenom: user.firstName,
            email: user.email,
            role: user.role
        },
            process.env.JWT_SECRET,
            { expiresIn: expiration }, (err, token) => {
                if (err) throw err;
                res.cookie('jwtauth', token, options).json(user)
            })

        res.status(200).json({ message: 'Connexion réussie', token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// disconnect
const logoutUser = async (req, res) => {
    try {
      res.clearCookie("jwtauth", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
        domain: process.env.NODE_ENV === "production" ? 'stepify.vercel.app' : '', //TODO ajouter le domaine
      })
      return res.status(200).json({ message: "Déconnexion réussie" })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

// get profile
const getUserProfile = async (req, res) => {
    const { userId } = req.params

    try {
        const user = await UserModel.findById(userId)
            .populate('rewardsUnlocked.reward')
            .select('-password')

        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//// UPDATE AN ACCOUNT ////

const updateAvatar = async (req, res) => {
    const { userId } = req.params
    const { avatarUrl } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateUsername = async (req, res) => {
    const { userId } = req.params
    const { username } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { username }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateEmail = async (req, res) => {
    const { userId } = req.params
    const { email } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { email }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updatePassword = async (req, res) => {
    const { userId } = req.params
    const { currentPassword, newPassword } = req.body

    try {
        const user = await UserModel.findById(userId)

        // Vérifier si le mot de passe actuel correspond à celui stocké
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return res.status(400).json({ error: 'Mot de passe actuel incorrect' })

        // Hash du nouveau mot de passe et mise à jour
        user.password = newPassword
        await user.save()

        res.status(200).json({ message: 'Mot de passe mis à jour avec succès' })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateStatus = async (req, res) => {
    const { userId } = req.params
    const { status } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateDailyGoal = async (req, res) => {
    const { userId } = req.params
    const { dailyGoal } = req.body

    try {
        const user = await UserModel.findByIdAndUpdate(userId, { dailyGoal }, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createUser,
    deleteUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateAvatar,
    updateUsername,
    updateEmail,
    updatePassword,
    updateStatus,
    updateDailyGoal
}
