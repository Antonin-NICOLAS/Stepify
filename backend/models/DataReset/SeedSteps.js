const mongoose = require("mongoose");
const StepEntry = require("../StepEntry");
//.env
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("[RESET] MongoDB connecté"))
  .catch((err) => console.error("[RESET] Erreur de connexion MongoDB:", err));

async function deleteStepEntries() {
  try {
    await StepEntry.deleteMany();
    console.log("StepEntries successfully deleted!");
  } catch (err) {
    console.error("Error deleting step entries:", err);
  } finally {
    mongoose.connection.close();
  }
}

deleteStepEntries();
