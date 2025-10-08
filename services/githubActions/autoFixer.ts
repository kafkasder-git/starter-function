/**
 * Auto Fixer Service
 *
 * Automatically applies fixes to errors detected in GitHub Actions workflows.
 * Supports various fix types including ESLint, formatting, dependencies, and more.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import {
  type ParsedError,
  type FixSuggestion,
  type FixResult,
  type FixOptions,
  type CommandResult,
} from '@/types/githubActions';

const execAsync = promisify(exec);

/**
 * AutoFixer class
 *
 * Responsible for applying automatic fixes to detected errors.
 * Executes commands, validates results, and tracks changes.
 */
export class AutoFixer {
  /**
   * Command whitelist for security
   * Only these commands are allowed to be executed
   */
  private readonly ALLOWED_COMMANDS = [
    'npm run lint:fix',
    'npm run format',
    'npm run format:check',
    'npm install',
    'npm audit fix',
    'npm audit fix --force',
    'npm run type-check',
    'npm run clean',
    'npm run build',
    'npm test',
    'git add',
    'git commit',
    'git status',
  ];

  /**
   * Maximum command execution timeout (in milliseconds)
   */
  private readonly COMMAND_TIMEOUT = 300000; // 5 minutes

  /**
   * Applies a fix suggestion to an error
   *
   * Executes the fix command or steps and tracks the result.
   * Supports dry-run mode for testing without making changes.
   *
   * @param error - The error to fix
   * @param suggestion - The fix suggestion to apply
   * @param options - Fix options (dry-run, auto-commit, etc.)
   * @returns Result of the fix operation
   *
   * @example
   * ```typescript
   * const fixer = new AutoFixer();
   * const result = await fixer.applyFix(error, suggestion, { dryRun: false });
   * if (result.success) {
   *   console.log('Fix applied successfully');
   * }
   * ```
   */
  async applyFix(
    error: ParsedError,
    suggestion: FixSuggestion,
    options: FixOptions = {},
  ): Promise<FixResult> {
    const { dryRun = false, autoCommit = false, commitMessage } = options;

    // Validate that the suggestion is auto-fixable
    if (!suggestion.autoFixable) {
      return {
        success: false,
        error,
        appliedFix: suggestion,
        message: 'This fix requires manual intervention and cannot be applied automatically',
      };
    }

    // Validate that a command is provided
    if (!suggestion.command) {
      return {
        success: false,
        error,
        appliedFix: suggestion,
        message: 'No command provided for auto-fix',
      };
    }

    // Dry-run mode: just validate without executing
    if (dryRun) {
      const isValid = this.validateCommand(suggestion.command);
      return {
        success: isValid,
        error,
        appliedFix: suggestion,
        message: isValid
          ? `[DRY RUN] Would execute: ${suggestion.command}`
          : `[DRY RUN] Command not allowed: ${suggestion.command}`,
        commandsExecuted: isValid ? [suggestion.command] : [],
      };
    }

    try {
      // Execute the fix command
      const commandResult = await this.executeCommand(suggestion.command);

      // Check if command was successful
      if (commandResult.exitCode !== 0 && commandResult.exitCode !== undefined) {
        return {
          success: false,
          error,
          appliedFix: suggestion,
          message: `Fix command failed: ${commandResult.stderr || 'Unknown error'}`,
          commandsExecuted: [suggestion.command],
        };
      }

      // Determine which files were modified (if any)
      const filesModified = await this.getModifiedFiles();

      // Auto-commit if requested and files were modified
      if (autoCommit && filesModified.length > 0) {
        const message = commitMessage || `fix: ${suggestion.title}`;
        await this.commitChanges(message, filesModified);
      }

      return {
        success: true,
        error,
        appliedFix: suggestion,
        message: `Successfully applied fix: ${suggestion.title}`,
        filesModified,
        commandsExecuted: [suggestion.command],
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        success: false,
        error,
        appliedFix: suggestion,
        message: `Failed to apply fix: ${errorMessage}`,
        commandsExecuted: [suggestion.command],
      };
    }
  }

  /**
   * Validates that a command is in the whitelist
   *
   * Security measure to prevent arbitrary command execution.
   *
   * @param command - Command to validate
   * @returns True if command is allowed
   *
   * @example
   * ```typescript
   * const isValid = fixer.validateCommand('npm run lint:fix');
   * // Returns: true
   * ```
   */
  private validateCommand(command: string): boolean {
    // Check if command starts with any allowed command
    return this.ALLOWED_COMMANDS.some((allowed) => {
      // Exact match
      if (command === allowed) {
        return true;
      }

      // Allow commands with additional safe flags
      if (command.startsWith(allowed + ' ')) {
        const remainder = command.substring(allowed.length + 1);
        // Only allow additional flags that start with -- or are file paths
        return /^(--[\w-]+|\S+\.(ts|tsx|js|jsx|json|md))+$/.test(remainder);
      }

      return false;
    });
  }

  /**
   * Executes a shell command
   *
   * Runs the command with timeout and captures output.
   * Validates command before execution for security.
   *
   * @param command - Command to execute
   * @returns Command execution result
   * @throws Error if command is not allowed or execution fails
   *
   * @example
   * ```typescript
   * const result = await fixer.executeCommand('npm run lint:fix');
   * console.log(result.stdout);
   * ```
   */
  private async executeCommand(command: string): Promise<CommandResult> {
    // Validate command
    if (!this.validateCommand(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.COMMAND_TIMEOUT,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        windowsHide: true,
      });

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
      };
    } catch (err: any) {
      // exec throws on non-zero exit codes
      return {
        stdout: err.stdout?.trim() || '',
        stderr: err.stderr?.trim() || err.message,
        exitCode: err.code || 1,
      };
    }
  }

  /**
   * Gets list of modified files using git
   *
   * @returns Array of modified file paths
   *
   * @example
   * ```typescript
   * const files = await fixer.getModifiedFiles();
   * console.log(`${files.length} files modified`);
   * ```
   */
  private async getModifiedFiles(): Promise<string[]> {
    try {
      const result = await this.executeCommand('git status --porcelain');

      if (!result.stdout) {
        return [];
      }

      // Parse git status output
      // Format: "XY filename" where X and Y are status codes
      const files = result.stdout
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          // Remove status codes and whitespace
          return line.substring(3).trim();
        })
        .filter((file) => file.length > 0);

      return files;
    } catch (err) {
      // If git command fails, return empty array
      console.error('Failed to get modified files:', err);
      return [];
    }
  }

  /**
   * Commits changes to git
   *
   * Stages specified files and creates a commit.
   *
   * @param message - Commit message
   * @param files - Files to commit (optional, commits all if not specified)
   * @throws Error if commit fails
   *
   * @example
   * ```typescript
   * await fixer.commitChanges('fix: resolve ESLint errors', ['src/app.ts']);
   * ```
   */
  private async commitChanges(message: string, files?: string[]): Promise<void> {
    try {
      // Stage files
      if (files && files.length > 0) {
        // Stage specific files
        for (const file of files) {
          await this.executeCommand(`git add ${file}`);
        }
      } else {
        // Stage all changes
        await this.executeCommand('git add .');
      }

      // Create commit
      // Escape quotes in commit message
      const escapedMessage = message.replace(/"/g, '\\"');
      await this.executeCommand(`git commit -m "${escapedMessage}"`);
    } catch (err) {
      throw new Error(
        `Failed to commit changes: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Checks if a fix can be applied automatically
   *
   * Validates that the suggestion is auto-fixable and has a valid command.
   *
   * @param suggestion - Fix suggestion to check
   * @returns True if fix can be applied automatically
   *
   * @example
   * ```typescript
   * if (fixer.canAutoFix(suggestion)) {
   *   await fixer.applyFix(error, suggestion);
   * }
   * ```
   */
  canAutoFix(suggestion: FixSuggestion): boolean {
    return (
      suggestion.autoFixable &&
      suggestion.command !== undefined &&
      suggestion.command.length > 0 &&
      this.validateCommand(suggestion.command)
    );
  }

  /**
   * Gets the list of allowed commands
   *
   * @returns Array of allowed command strings
   *
   * @example
   * ```typescript
   * const allowed = fixer.getAllowedCommands();
   * console.log('Allowed commands:', allowed);
   * ```
   */
  getAllowedCommands(): string[] {
    return [...this.ALLOWED_COMMANDS];
  }
}

/**
 * Create a singleton instance for convenience
 */
export const autoFixer = new AutoFixer();
