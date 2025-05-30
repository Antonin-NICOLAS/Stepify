module.exports = {
    // Niveaux de log disponibles
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },

    // Niveau de log par défaut selon l'environnement
    defaultLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    // Configuration de la rotation des logs
    rotation: {
        maxFiles: 30, // Nombre de jours de logs à conserver
        maxSize: '10M' // Taille maximale d'un fichier de log
    },

    // Format des logs
    format: {
        timestamp: true,
        includeStack: process.env.NODE_ENV !== 'production',
        prettyPrint: process.env.NODE_ENV !== 'production'
    },

    // Chemins des fichiers de logs
    paths: {
        error: 'logs/error.log',
        combined: 'logs/combined.log',
        access: 'logs/access.log'
    },

    // Configuration des logs d'accès
    access: {
        // Champs à inclure dans les logs d'accès
        fields: [
            'ip',
            'method',
            'url',
            'status',
            'responseTime',
            'userAgent',
            'userId'
        ],
        // Ne pas logger certaines routes (comme les healthchecks)
        exclude: [
            '/health',
            '/favicon.ico'
        ]
    },

    // Masquer les informations sensibles dans les logs
    sensitiveFields: [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization'
    ]
}; 