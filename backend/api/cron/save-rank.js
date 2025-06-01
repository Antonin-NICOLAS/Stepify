const { recordRankingHistory } = require('../../controllers/RankingController');

const saveRankByVercel = async (req, res) => {
    try {
        await recordRankingHistory();
        console.log('Historique du classement enregistré');
        res.status(200).json({ message: 'Historique du classement enregistré' });
    } catch (error) {
        console.error('[CRON] Erreur enregistrement du classement', error);
        res.status(500).json({ error: 'Erreur enregistrement du classement' });
    }
}

module.exports = {
    saveRankByVercel
};