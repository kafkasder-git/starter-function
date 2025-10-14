/**
 * @fileoverview Bundle Size Configuration
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

module.exports = {
  files: [
    {
      path: './dist/assets/*.js',
      maxSize: '500kb',
      compression: 'gzip',
    },
    {
      path: './dist/assets/*.css',
      maxSize: '50kb',
      compression: 'gzip',
    },
    {
      path: './dist/index.html',
      maxSize: '10kb',
    },
  ],
  ci: {
    trackBranches: ['main', 'develop'],
    repoBranchBase: 'main',
    disableGit: false,
  },
};
