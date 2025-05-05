const StepEntry = require('../models/StepEntry');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {parseAppleHealthData, parseSamsungHealthData } = require('../utils/ParseHealthData')
const csv = require('csv-parser');

// Récupérer toutes les entrées de l'utilisateur
const getMySteps = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const entries = await StepEntry.find({ user: userId })
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({ 
      success: true,
      steps: entries
    });

  } catch (error) {
    console.error('Erreur récupération données:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des données'
    });
  }
};

// Créer une nouvelle entrée
const createStepEntry = async (req, res) => {
  const { userId } = req.params;
  const entryData = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    // Validation des données
    const requiredFields = ['date', 'steps', 'distance', 'calories', 'activeTime'];
    const missingFields = requiredFields.filter(field => !entryData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Champs manquants: ${missingFields.join(', ')}`
      });
    }

    const newEntry = await StepEntry.create({
      ...entryData,
      user: userId,
      date: new Date(entryData.date),
      day: new Date(entryData.date).toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      entry: newEntry
    });

  } catch (error) {
    console.error('Erreur création entrée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'entrée'
    });
  }
};

// Modifier une entrée existante
const updateStepEntry = async (req, res) => {
  const { userId, entryId } = req.params;
  const updateData = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const entry = await StepEntry.findOne({ _id: entryId, user: userId });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrée non trouvée'
      });
    }

    // Mise à jour des champs autorisés
    const allowedUpdates = ['steps', 'distance', 'calories', 'activeTime', 'mode'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        entry[field] = updateData[field];
      }
    });
    
    entry.isVerified = false

    await entry.save();

    res.status(200).json({
      success: true,
      entry
    });

  } catch (error) {
    console.error('Erreur modification entrée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de l\'entrée'
    });
  }
};

// Supprimer une entrée
const deleteStepEntry = async (req, res) => {
  const { userId, entryId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const entry = await StepEntry.findOneAndDelete({ 
      _id: entryId, 
      user: userId 
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrée non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entrée supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression entrée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'entrée'
    });
  }
};

// Endpoint pour l'importation
const importHealthData = async (req, res) => {
  const { userId } = req.params;
  const file = req.file; // image envoyée via multer

  if (!file) {
    return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
  }

  if (file.size > 100 * 1024 * 1024) { // 100MB
    return res.status(400).json({ success: false, error: 'Fichier trop volumineux (max 100MB)' });
  }

  if (checkAuthorization(req, res, userId)) return;

  try {

    let entries = [];

    if (req.file.mimetype === 'text/xml' || req.file.originalname.endsWith('.xml')) {
      // Utilisez directement le buffer
      const xmlData = req.file.buffer.toString('utf8');
      entries = await parseAppleHealthData(xmlData, userId);
    } else if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      // Pour CSV, utilisez le buffer avec csv-parser
      const csvData = [];
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv())
          .on('data', (row) => csvData.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
      
      entries = parseSamsungHealthData(csvData, userId);
    }

    const filteredEntries = entries.filter(entry => 
      new Date(entry.date) >= new Date('2025-05-01T00:00:00Z')
    );

    // Sauvegarder en base
    await StepEntry.insertMany(filteredEntries);

    res.json({ 
      success: true,
      importedEntries: filteredEntries.length,
      rejectedEntries: entries.length - filteredEntries.length
    });

  } catch (error) {
    console.error('Erreur importation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'importation' });
  }
};

module.exports = {
  getMySteps,
  createStepEntry,
  updateStepEntry,
  deleteStepEntry,
  importHealthData
}