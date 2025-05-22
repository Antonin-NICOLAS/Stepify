const StepEntry = require('../models/StepEntry');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const { parseAppleHealthData, parseSamsungHealthData } = require('../utils/ParseHealthData')
const { updateUserStatsAfterImport, updateUserStats } = require('../utils/StepUtils');
const { computeXpForEntry } = require('../utils/CalculateXP');
const { updateUserRewards } = require('../controllers/RewardController');
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
    const { hourlyData, date, day } = entryData;

    // Validate hourlyData exists and has at least one entry
    if (!hourlyData || hourlyData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée horaire fournie'
      });
    }

    // Extract the first hourly entry (assuming one entry per request)
    const [hourlyEntry] = hourlyData;
    const { hour, steps, distance, calories, activeTime, mode } = hourlyEntry;

    // Validate required fields in the hourly entry
    if (hour === undefined) {
      return res.status(400).json({
        success: false,
        error: 'L\'heure est requise'
      });
    }

    const parsedHour = parseInt(hour, 10);
    const parsedSteps = parseFloat(steps);
    const parsedDistance = parseFloat(distance);
    const parsedCalories = parseFloat(calories);
    const parsedActiveTime = parseFloat(activeTime);

    if (isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
      return res.status(400).json({
        success: false,
        error: 'Heure invalide'
      });
    }

    if (isNaN(parsedSteps) || parsedSteps < 0) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de pas invalide'
      });
    }

    if (isNaN(parsedDistance) || parsedDistance < 0) {
      return res.status(400).json({
        success: false,
        error: 'Distance invalide'
      });
    }

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return res.status(400).json({
        success: false,
        error: 'Calories invalides'
      });
    }

    if (isNaN(parsedActiveTime) || parsedActiveTime < 0) {
      return res.status(400).json({
        success: false,
        error: 'Temps actif invalide'
      });
    }

    // Validate other required fields
    if (!mode || !date || !day) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs requis (mode, date) doivent être fournis'
      });
    }

    // Proceed with existing entry check
    const existingEntry = await StepEntry.findOne({ user: userId, day });

    if (existingEntry) {
      const hourExists = existingEntry.hourlyData.some(data => data.hour === hour);
      if (hourExists) {
        return res.status(409).json({
          success: false,
          error: `Données déjà présentes pour ${hour}h`
        });
      }

      // Add the new entry
      existingEntry.hourlyData.push(hourlyEntry);

      // Sort the hourlyData array by hour (0-23)
      existingEntry.hourlyData.sort((a, b) => a.hour - b.hour);

      existingEntry.totalSteps += parsedSteps || 0;
      existingEntry.totalDistance += parsedDistance || 0;
      existingEntry.totalCalories += parsedCalories || 0;
      existingEntry.totalActiveTime += parsedActiveTime || 0;
      existingEntry.xp += computeXpForEntry(hourlyEntry);

      await existingEntry.save();
      await updateUserStats(userId);
      await updateUserRewards(userId);

      return res.status(200).json({
        success: true,
        entry: existingEntry
      });
    } else {
      // For new entries, the array will naturally be sorted since it only has one element
      const newEntry = await StepEntry.create({
        user: userId,
        date: new Date(date),
        day,
        hourlyData: [hourlyEntry],
        totalSteps: parsedSteps || 0,
        totalDistance: parsedDistance || 0,
        totalCalories: parsedCalories || 0,
        totalActiveTime: parsedActiveTime || 0,
        xp: computeXpForEntry(hourlyEntry),
        isVerified: false
      });

      await updateUserStats(userId);
      await updateUserRewards(userId);
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
    await updateUserRewards(userId);

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
    await updateUserRewards(userId);

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
    await updateUserRewards(userId);

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