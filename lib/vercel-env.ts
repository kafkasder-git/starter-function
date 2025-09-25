/**
 * Vercel Environment Variables Utility
 * Vercel otomatik olarak sağladığı Git bilgilerini kullanma
 */

/**
 * VercelGitInfo Interface
 * 
 * @interface VercelGitInfo
 */
export interface VercelGitInfo {
  provider: string;
  repoSlug: string;
  repoOwner: string;
  repoId: string;
  commitRef: string;
  commitSha: string;
  commitMessage: string;
  commitAuthorLogin: string;
  commitAuthorName: string;
  pullRequestId: string;
}

/**
 * Vercel Git bilgilerini al
 */
/**
 * getVercelGitInfo function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getVercelGitInfo(): VercelGitInfo {
  return {
    provider: process.env.VERCEL_GIT_PROVIDER ?? '',
    repoSlug: process.env.VERCEL_GIT_REPO_SLUG ?? '',
    repoOwner: process.env.VERCEL_GIT_REPO_OWNER ?? '',
    repoId: process.env.VERCEL_GIT_REPO_ID ?? '',
    commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '',
    commitAuthorLogin: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ?? '',
    commitAuthorName: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? '',
    pullRequestId: process.env.VERCEL_GIT_PULL_REQUEST_ID ?? '',
  };
}

/**
 * Production environment kontrolü
 */
/**
 * isProduction function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Preview environment kontrolü
 */
/**
 * isPreview function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}

/**
 * Development environment kontrolü
 */
/**
 * isDevelopment function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function isDevelopment(): boolean {
  return process.env.VERCEL_ENV === 'development' || process.env.NODE_ENV === 'development';
}

/**
 * Vercel URL'ini al
 */
/**
 * getVercelUrl function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getVercelUrl(): string {
  return process.env.VERCEL_URL ?? process.env.VERCEL_BRANCH_URL ?? '';
}

/**
 * Environment-based configuration
 */
/**
 * getEnvironmentConfig function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getEnvironmentConfig() {
  const gitInfo = getVercelGitInfo();

  return {
    environment: process.env.VERCEL_ENV ?? 'development',
    isProduction: isProduction(),
    isPreview: isPreview(),
    isDevelopment: isDevelopment(),
    url: getVercelUrl(),
    branch: gitInfo.commitRef,
    commit: gitInfo.commitSha?.substring(0, 7) || '',
    version: process.env.VITE_APP_VERSION ?? '1.0.0',
    buildTime: new Date().toISOString(),
    git: gitInfo,
  };
}
