const StepEntry = require('../models/StepEntry');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const { parseAppleHealthData, parseSamsungHealthData } = require('../utils/ParseHealthData')
const { updateUserStatsAfterImport, updateUserStats } = require('../utils/StepUtils');
const { computeXpForEntry } = require('../utils/CalculateXP');
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
    const requiredFields = ['date', 'hour', 'steps', 'distance', 'calories', 'activeTime', 'mode', 'day'];
    const missingFields = requiredFields.filter(field => entryData[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Champs manquants: ${missingFields.join(', ')}`
      });
    }

    const { hour, steps, distance, calories, activeTime, mode, date, day } = entryData;

    const hourlyEntry = { hour, steps, distance, calories, activeTime, mode };

    // Search for existing StepEntry for same user and day
    const existingEntry = await StepEntry.findOne({ user: userId, day });

    if (existingEntry) {
      // Check if this hour already exists to avoid duplicates
      const hourExists = existingEntry.hourlyData.some(data => data.hour === hour);

      if (hourExists) {
        return res.status(409).json({
          success: false,
          error: `Données déjà présentes pour ${hour} heure`
        });
      }

      // Push the new hourly entry and update totals
      existingEntry.hourlyData.push(hourlyEntry);
      existingEntry.totalSteps += steps;
      existingEntry.totalDistance += distance;
      existingEntry.totalCalories += calories;
      existingEntry.totalActiveTime += activeTime;
      existingEntry.xp += computeXpForEntry(entryData);

      // Optionally update dominantMode here if needed

      await existingEntry.save();

      await updateUserStats(userId);

      return res.status(200).json({
        success: true,
        entry: existingEntry
      });
    } else {
      // Create a new StepEntry
      const newEntry = await StepEntry.create({
        user: userId,
        date: new Date(date),
        day,
        hourlyData: [hourlyEntry],
        totalSteps: steps,
        totalDistance: distance,
        totalCalories: calories,
        totalActiveTime: activeTime,
        xp: computeXpForEntry(entryData),
        isVerified: false
      });

      await updateUserStats(userId);

      return res.status(201).json({
        success: true,
        entry: newEntry
      });
    }
  } catch (error) {
    console.error('Erreur création entrée:', error);
    return res.status(500).json({
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
    const allowedUpdates = ['totalSteps', 'totalDistance', 'totalCalories', 'totalActiveTime', 'dominantMode'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        entry[field] = updateData[field];
      }
    });
    entry.isVerified = false
    entry.xp = computeXpForEntry(entry)

    await entry.save();
    await updateUserStats(userId);

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

// Rendre une entrée favorite
const FavoriteStepEntry = async (req, res) => {
  const { userId, entryId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const entry = await StepEntry.findOne({ _id: entryId, user: userId });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrée non trouvée'
      });
    }

    entry.isFavorite === false ? entry.isFavorite = true : entry.isFavorite = false
    await entry.save();

    res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error('Erreur favoris entrée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise en favoris de l\'entrée'
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
    await updateUserStats(userId);

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
    await updateUserStatsAfterImport(userId, filteredEntries);

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
  FavoriteStepEntry,
  deleteStepEntry,
  importHealthData
}