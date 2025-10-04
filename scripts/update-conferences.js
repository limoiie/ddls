#!/usr/bin/env node

/**
 * Conference Data Update Script
 *
 * This script updates the ccf-deadlines submodule periodically with configurable
 * intervals and retry logic. It replaces the GitHub Actions workflow for
 * automatic submodule updates.
 */

const { execSync } = require("child_process");
const { join } = require("path");

// Configuration
const DEFAULT_CONFIG = {
  intervalHours: 1, // Update every 24 hours by default
  maxRetries: 3,
  submodulePath: "data/ccf-deadlines",
  commitMessage: "chore: Update ccf-deadlines submodule",
};

class ConferenceUpdater {
  constructor() {
    this.config = this.loadConfig();
    this.isRunning = false;
    this.timeoutId = null;
  }

  loadConfig() {
    // TODO: Load config from .json file
    return DEFAULT_CONFIG;
  }

  saveConfig() {
    // TODO: Save config to .json file
  }

  log(message, level = "INFO") {
    const timestamp = new Date().toISOString().slice(0, 19);
    const logEntry = `[${timestamp}] [${level}] ${message}`;

    console.log(logEntry);
  }

  debug(message) {
    this.log(message, "DEBUG");
  }

  info(message) {
    this.log(message, "INFO");
  }

  error(message) {
    this.log(message, "ERROR");
  }

  warning(message) {
    this.log(message, "WARNING");
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(command, {
          encoding: "utf8",
          stdio: "pipe",
          ...options,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async gitStatusAndConfig() {
    // Check if we're in a git repository
    await this.executeCommand("git status");

    // Configure git user if not set
    try {
      await this.executeCommand('git config user.name "limoiie"');
      await this.executeCommand('git config user.email "limo.iie4@gmail.com"');
    } catch (error) {
      console.error("Error configuring git user:", error.message);
    }
  }

  async showSubmoduleStatus() {
    try {
      this.info("Checking submodule status...");

      // Get current submodule commit
      const currentCommit = await this.executeCommand(`git rev-parse HEAD`, {
        cwd: join(__dirname, "..", this.config.submodulePath),
      });

      // Fetch latest changes from remote
      await this.executeCommand("git fetch origin", {
        cwd: join(__dirname, "..", this.config.submodulePath),
      });

      // Get remote commit
      const remoteCommit = await this.executeCommand(
        "git rev-parse origin/main",
        { cwd: join(__dirname, "..", this.config.submodulePath) }
      );

      const currentCommitShort = currentCommit.trim().substring(0, 8);
      const remoteCommitShort = remoteCommit.trim().substring(0, 8);

      this.debug(`Current submodule commit: ${currentCommitShort}`);
      this.debug(`Remote submodule commit: ${remoteCommitShort}`);

      if (currentCommit.trim() === remoteCommit.trim()) {
        this.info("Submodule is already up to date");
        return false;
      }

      // Show new commits
      const newCommits = await this.executeCommand(
        `git log --oneline ${currentCommit.trim()}..${remoteCommit.trim()}`,
        { cwd: join(__dirname, "..", this.config.submodulePath) }
      );

      if (newCommits.trim()) {
        this.info("New commits available:");
        console.log(newCommits);

        // Show changed files
        const changedFiles = await this.executeCommand(
          `git diff --name-only ${currentCommit.trim()}..${remoteCommit.trim()}`,
          { cwd: join(__dirname, "..", this.config.submodulePath) }
        );

        if (changedFiles.trim()) {
          this.info("Changed files:");
          console.log(changedFiles);
        }
      }

      return true;
    } catch (error) {
      this.error(`Error checking submodule status: ${error.message}`);
      return false;
    }
  }

  async gitSubmoduleUpdateAndCommit(attempt = 1) {
    try {
      this.info(
        `Updating submodule (attempt ${attempt}/${this.config.maxRetries})`
      );

      // Show status before updating
      const hasUpdates = await this.showSubmoduleStatus();
      if (!hasUpdates) {
        this.info("No updates available, skipping update");
        return true;
      }

      // Update the submodule
      await this.executeCommand("git submodule update --remote --rebase", {
        cwd: join(__dirname, ".."),
      });

      // Check for changes
      const status = await this.executeCommand("git status --porcelain");

      if (status.trim()) {
        this.info("Changes detected, committing...");

        // Add and commit changes
        await this.executeCommand(`git add ${this.config.submodulePath}`);
        await this.executeCommand(
          `git commit -m "${this.config.commitMessage}"`
        );

        this.info("Submodule updated and changes committed successfully");
        return true;
      } else {
        this.info("No changes detected in submodule");
        return true;
      }
    } catch (error) {
      this.error(
        `Error updating submodule (attempt ${attempt}): ${error.message}`
      );

      if (attempt < this.config.maxRetries) {
        this.info(
          `Retrying in 30 seconds... (${attempt + 1}/${this.config.maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return this.gitSubmoduleUpdateAndCommit(attempt + 1);
      } else {
        this.error("Max retries reached, giving up");
        throw error;
      }
    }
  }

  async startPeriodicUpdates() {
    if (this.isRunning) {
      this.warning("Updater is already running");
      return;
    }

    await this.gitStatusAndConfig();

    this.isRunning = true;
    this.info(
      `Starting periodic updates every ${this.config.intervalHours} hours`
    );

    const runUpdate = async () => {
      this.info("\n--------------------------------");
      this.info("Running periodic update...");
      this.info("--------------------------------\n");
      try {
        await this.gitSubmoduleUpdateAndCommit();
      } catch (error) {
        this.error(`Periodic update failed: ${error.message}`);
      }

      if (this.isRunning) {
        const intervalMs = this.config.intervalHours * 60 * 60 * 1000;
        this.timeoutId = setTimeout(runUpdate, intervalMs);
        this.info(
          `Next update scheduled in ${this.config.intervalHours} hours`
        );
      }
    };

    // Run first update immediately
    await runUpdate();
  }

  stopPeriodicUpdates() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning = false;
    this.info("Periodic updates stopped");
  }

  async runOnce() {
    this.info("Running one-time update...");
    try {
      await this.gitSubmoduleUpdateAndCommit();
      this.info("One-time update completed successfully");
    } catch (error) {
      this.error(`One-time update failed: ${error.message}`);
      process.exit(1);
    }
  }

  async previewChanges() {
    this.info("Previewing submodule changes...");
    try {
      const hasUpdates = await this.showSubmoduleStatus();
      if (!hasUpdates) {
        this.info("No updates available");
      }
    } catch (error) {
      this.error(`Error previewing changes: ${error.message}`);
      process.exit(1);
    }
  }

  showStatus() {
    console.log("Conference Updater Status:");
    console.log(`- Running: ${this.isRunning}`);
    console.log(`- Interval: ${this.config.intervalHours} hours`);
    console.log(`- Max Retries: ${this.config.maxRetries}`);
    console.log(`- Submodule Path: ${this.config.submodulePath}`);
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.info("Configuration updated");
  }
}

// CLI Interface
async function main() {
  const updater = new ConferenceUpdater();
  const command = process.argv[2];
  const value = process.argv[3];

  switch (command) {
    case "start":
      await updater.startPeriodicUpdates();
      break;

    case "stop":
      updater.stopPeriodicUpdates();
      break;

    case "update":
    case "run":
      await updater.runOnce();
      break;

    case "preview":
      await updater.previewChanges();
      break;

    case "status":
      updater.showStatus();
      break;

    case "config":
      if (value) {
        try {
          const configUpdate = JSON.parse(value);
          updater.updateConfig(configUpdate);
        } catch (error) {
          console.error("Invalid JSON configuration:", error.message);
          process.exit(1);
        }
      } else {
        console.log("Current configuration:");
        console.log(JSON.stringify(updater.config, null, 2));
      }
      break;

    case "set-interval":
      if (!value) {
        console.error("Usage: set-interval <hours>");
        process.exit(1);
      }
      const hours = parseInt(value);
      if (isNaN(hours) || hours < 1) {
        console.error("Interval must be a positive number of hours");
        process.exit(1);
      }
      updater.updateConfig({ intervalHours: hours });
      break;

    case "set-retries":
      if (!value) {
        console.error("Usage: set-retries <number>");
        process.exit(1);
      }
      const retries = parseInt(value);
      if (isNaN(retries) || retries < 1) {
        console.error("Retries must be a positive number");
        process.exit(1);
      }
      updater.updateConfig({ maxRetries: retries });
      break;

    default:
      console.log(`
Conference Data Update Script

Usage: node scripts/update-conferences.js <command> [options]

Commands:
  start                 Start periodic updates
  stop                  Stop periodic updates  
  update, run           Run one-time update
  preview               Preview submodule changes without updating
  status                Show current status
  config [json]         Show or update configuration
  set-interval <hours>  Set update interval in hours
  set-retries <num>     Set maximum retry attempts

Examples:
  node scripts/update-conferences.js start
  node scripts/update-conferences.js preview
  node scripts/update-conferences.js set-interval 12
  node scripts/update-conferences.js set-retries 5
  node scripts/update-conferences.js config '{"intervalHours": 6}'
  node scripts/update-conferences.js update
      `);
      break;
  }
}

// Handle process signals for graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT, stopping updater...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM, stopping updater...");
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
}

module.exports = ConferenceUpdater;
