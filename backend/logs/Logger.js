const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logsDir = path.join(process.cwd(), "logs");

    if (process.env.NODE_ENV !== "production" && !fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }
  }

  _getLogFileName() {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.log`;
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : "";
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  async log(level, message, data = null) {
    const formattedMessage = this._formatMessage(level, message, data);

    if (process.env.NODE_ENV === "production") {
      console.log(formattedMessage);
    } else {
      const logFile = path.join(this.logsDir, this._getLogFileName());
      try {
        await fs.promises.appendFile(logFile, formattedMessage + "\n");
      } catch (error) {
        console.error("Erreur lors de l'écriture des logs:", error);
      }
    }
  }

  info(message, data = null) {
    return this.log("INFO", message, data);
  }

  error(message, data = null) {
    return this.log("ERROR", message, data);
  }

  warn(message, data = null) {
    return this.log("WARN", message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV !== "production") {
      return this.log("DEBUG", message, data);
    }
  }
}

module.exports = new Logger();
