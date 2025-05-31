/**
 * Envoie une réponse JSON avec un message localisé
 * @param {Object} res - L'objet response d'Express
 * @param {number} statusCode - Le code de statut HTTP
 * @param {boolean} success - Indique si l'opération est un succès
 * @param {string} messagePath - Le chemin du message dans les fichiers de traduction
 * @param {Object} params - Les paramètres à remplacer dans le message
 * @param {Object} additionalData - Données supplémentaires à inclure dans la réponse
 */
const sendLocalizedResponse = (res, statusCode, success, messagePath, params = {}, additionalData = {}) => {
    const response = {
        success,
        ...additionalData
    };

    if (success === true && messagePath) {
        response.message = res.locals.t(messagePath, params);
    }
    if (success === false && messagePath) {
        response.error = res.locals.t(messagePath, params);
    }

    res.status(statusCode).json(response);
};

/**
 * Envoie une réponse d'erreur avec un message localisé
 * @param {Object} res - L'objet response d'Express
 * @param {number} statusCode - Le code de statut HTTP
 * @param {string} errorPath - Le chemin de l'erreur dans les fichiers de traduction
 * @param {Object} params - Les paramètres à remplacer dans le message
 * @param {Object} additionalData - Données supplémentaires à inclure dans la réponse
 */
const sendLocalizedError = (res, statusCode, errorPath, params = {}, additionalData = {}) => {
    sendLocalizedResponse(res, statusCode, false, errorPath, params, additionalData);
};

/**
 * Envoie une réponse de succès avec un message localisé
 * @param {Object} res - L'objet response d'Express
 * @param {string} successPath - Le chemin du message de succès dans les fichiers de traduction
 * @param {Object} params - Les paramètres à remplacer dans le message
 * @param {Object} additionalData - Données supplémentaires à inclure dans la réponse
 */
const sendLocalizedSuccess = (res, successPath, params = {}, additionalData = {}) => {
    sendLocalizedResponse(res, 200, true, successPath, params, additionalData);
};

module.exports = {
    sendLocalizedResponse,
    sendLocalizedError,
    sendLocalizedSuccess
}; 