module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
  
  // Bracket and spacing
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  
  // Language-specific formatting
  embeddedLanguageFormatting: 'auto',
  htmlWhitespaceSensitivity: 'css',
  
  // Plugin-specific options
  plugins: ['prettier-plugin-tailwindcss'],
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
