import fs from "fs";
import path from "path";

// Define the log directory and file path
const logDir = path.join(process.cwd(), "logs");
const logPath = path.join(logDir, "server.log");

// Check if the logs directory exists, if not, create it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream (in append mode) for the logs
const logStream = fs.createWriteStream(logPath, { flags: "a" });

/**
 * Custom logger function to write logs to the console and a file.
 * @param {string} message - The log message to be recorded.
 */
export const logger = (message) => {
  const timestamp = new Date().toISOString();

  // Get the filename from the call stack
  const stack = new Error().stack;
  const callerLine = stack.split("\n")[2]; // Get the line from the stack trace that calls the logger
  const filePathMatch = callerLine.match(/(\/[^/]+\/[^/]+:\d+:\d+)/);
  const fileName = filePathMatch
    ? path.basename(filePathMatch[1].split(":")[0])
    : "unknown";

  const formattedMessage = `[${timestamp}] [${fileName}] ${message}\n`;

  // Print to the console
  console.log(formattedMessage);

  // Write to the file
  logStream.write(formattedMessage);
};
