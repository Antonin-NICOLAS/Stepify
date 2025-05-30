const Logger = require('../logs/Logger');
const loggingConfig = require('../config/logging');

const maskSensitiveData = (obj) => {
    const masked = { ...obj };
    loggingConfig.sensitiveFields.forEach(field => {
        if (masked[field]) masked[field] = '***';
    });
    return masked;
};

const accessLogger = (req, res, next) => {
    // Ne pas logger les routes exclues
    if (loggingConfig.access.exclude.some(path => req.path.includes(path))) {
        return next();
    }

    const startTime = Date.now();

    // Capturer la réponse
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        const responseTime = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            responseTime,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            userId: req.params ? req.params.userId || null : null,
            referer: req.headers.referer || req.headers.referrer,
            contentLength: res.getHeader('content-length'),
        };

        // Masquer les données sensibles
        const sanitizedQuery = maskSensitiveData(req.query);
        const sanitizedBody = maskSensitiveData(req.body);

        // Ajouter les données de requête si nécessaire
        if (Object.keys(sanitizedQuery).length > 0) {
            logData.query = sanitizedQuery;
        }
        if (Object.keys(sanitizedBody).length > 0) {
            logData.body = sanitizedBody;
        }

        // Logger avec le niveau approprié selon le status code
        if (res.statusCode >= 500) {
            Logger.error('Erreur serveur', logData);
        } else if (res.statusCode >= 400) {
            Logger.warn('Erreur client', logData);
        } else {
            Logger.info('Requête traitée', logData);
        }
    };

    next();
};

module.exports = accessLogger; 