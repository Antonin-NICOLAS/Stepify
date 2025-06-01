const { recordRankingHistory } = require('../../controllers/RankingController');

const saveRankByVercel = async (req, res) => {
    try {
        await recordRankingHistory();
        console.log('Historique du classement enregistré');
        res.status(200).json({ message: 'Tâches planifiées exécutées avec succès' });
    } catch (error) {
        console.error('[CRON] Erreur enregistrement du classement', error);
        res.status(500).json({ error: 'Erreur globale dans les tâches planifiées' });
    }
}

module.exports = {
    saveRankByVercel
};