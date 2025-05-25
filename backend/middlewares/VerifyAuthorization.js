const checkAuthorization = (req, res, userIdParam) => {
  if (req.userId !== userIdParam) {
    console.log(req.userId, userIdParam);
    return res.status(403).json({
      success: false,
      error: "Action non autorisée"
    });
  }
  return null;
}

module.exports = { checkAuthorization };