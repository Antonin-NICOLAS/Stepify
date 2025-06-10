const { sendLocalizedError } = require('../utils/ResponseHelper')

const checkAuthorization = (req, res, userIdParam) => {
  if (req.userId !== userIdParam) {
    return sendLocalizedError(res, 403, 'errors.generic.unauthorized')
  }
  return null
}

module.exports = { checkAuthorization }
