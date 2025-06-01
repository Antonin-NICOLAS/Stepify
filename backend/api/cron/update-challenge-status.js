const Challenge = require('../../models/Challenge');

export default async function handler(req, res) {
    try {
        const now = new Date();

        // Mettre à jour les défis qui doivent démarrer
        await Challenge.updateMany(
            {
                status: 'upcoming',
                startDate: { $lte: now }
            },
            { $set: { status: 'active' } }
        );

        // Mettre à jour les défis qui doivent se terminer
        await Challenge.updateMany(
            {
                status: 'active',
                endDate: { $lte: now }
            },
            { $set: { status: 'completed' } }
        );
        res.status(200).json({ message: 'Statuts des défis mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statuts des défis:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
}