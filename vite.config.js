import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    esbuild: {
        // Drop console and debugger in production builds (Vite handles modes)
        drop: ['console', 'debugger'],
        legalComments: 'none',
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    css: {
        postcss: './postcss.config.js',
    },
    plugins: [
        tailwindcss(),
        react({
            // React plugin optimizations with automatic JSX runtime
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
            include: ['**/*.{jsx,tsx}'],
            exclude: [/node_modules/],
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                maximumFileSizeToCacheInBytes: 3000000,
                // NavigateFallback must be null for SPAs
                navigateFallback: null,
                navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
                // Cache API calls
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fra\.cloud\.appwrite\.io\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'appwrite-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24, // 24 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Dernek Yönetim Sistemi',
                short_name: 'DernekYS',
                description: 'Kar amacı gütmeyen dernekler için modern, kapsamlı yönetim sistemi. 11 modül ile tam dernek operasyonlarını yönetin.',
                theme_color: '#1e3a8a',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/',
                lang: 'tr',
                dir: 'ltr',
                categories: ['business', 'productivity', 'social'],
                icons: [
                    {
                        src: '/favicon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'Yardım Başvuruları',
                        url: '/#/yardim/basvurular',
                        description: 'Yardım başvurularını görüntüle ve yönet',
                        icons: [{ src: '/favicon.svg', sizes: 'any' }],
                    },
                    {
                        name: 'Bağış Kaydet',
                        url: '/#/bagis/yeni',
                        description: 'Yeni bağış kaydı oluştur',
                        icons: [{ src: '/favicon.svg', sizes: 'any' }],
                    },
                    {
                        name: 'Üye Listesi',
                        url: '/#/uye/liste',
                        description: 'Üye listesini görüntüle',
                        icons: [{ src: '/favicon.svg', sizes: 'any' }],
                    },
                    {
                        name: 'Dashboard',
                        url: '/#/genel',
                        description: 'Ana dashboard ve istatistikler',
                        icons: [{ src: '/favicon.svg', sizes: 'any' }],
                    },
                ],
                screenshots: [
                    {
                        src: '/screenshots/desktop-dashboard.png',
                        sizes: '1280x720',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Ana dashboard görünümü',
                    },
                    {
                        src: '/screenshots/mobile-navigation.png',
                        sizes: '390x844',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Mobil navigasyon menüsü',
                    },
                ],
                related_applications: [],
                prefer_related_applications: false,
            },
        }),
        visualizer({
            filename: 'dist/bundle-analysis.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            // Comment 5: Explicit aliases matching tsconfig paths
            '@': path.resolve(__dirname, '.'),
            '@components': path.resolve(__dirname, './components'),
            '@lib': path.resolve(__dirname, './lib'),
            '@services': path.resolve(__dirname, './services'),
            '@hooks': path.resolve(__dirname, './hooks'),
            '@stores': path.resolve(__dirname, './stores'),
            '@types': path.resolve(__dirname, './types'),
            '@utils': path.resolve(__dirname, './utils'),
            // React deduplication
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
        dedupe: [
            'react',
            'react-dom',
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
        ],
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        chunkSizeWarningLimit: 1000, // Daha düşük limit
        assetsDir: 'assets',
        // Prevent React duplication
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                // Fix preload warnings
                experimentalMinChunkSize: 1000,
                manualChunks(id) {
                    // Keep React in a single vendor chunk to avoid duplication
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'ui-vendor';
                        }
                        if (id.includes('appwrite')) {
                            return 'appwrite-vendor';
                        }
                        // Recharts optimization - split into separate chunk despite circular deps
                        if (id.includes('recharts')) {
                            return 'recharts-vendor';
                        }
                        if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
                            return 'form-vendor';
                        }
                        if (id.includes('date-fns') ||
                            id.includes('clsx') ||
                            id.includes('tailwind-merge') ||
                            id.includes('class-variance-authority') ||
                            id.includes('crypto-js')) {
                            return 'utils-vendor';
                        }
                        if (id.includes('lucide-react')) {
                            return 'icons-vendor';
                        }
                        if (id.includes('motion')) {
                            return 'motion-vendor';
                        }
                        if (id.includes('sonner') || id.includes('toast')) {
                            return 'toast-vendor';
                        }
                        if (id.includes('@tanstack/react-query')) {
                            return 'query-vendor';
                        }
                    }
                    // Page-level chunk splitting for heavy pages
                    if (id.includes('components/pages/DashboardPage') ||
                        id.includes('components/ui/EnhancedDashboard')) {
                        return 'dashboard-page';
                    }
                    if (id.includes('components/pages/EventsPage') ||
                        id.includes('components/pages/FinanceIncomePage')) {
                        return 'events-finance-page';
                    }
                    if (id.includes('components/pages/BeneficiariesPage') ||
                        id.includes('components/pages/AidApplicationsPage')) {
                        return 'beneficiaries-page';
                    }
                    if (id.includes('components/messaging/') ||
                        id.includes('components/pages/InternalMessagingPage')) {
                        return 'messaging-page';
                    }
                    if (id.includes('components/pages/UserManagementPage') ||
                        id.includes('components/pages/RoleManagementPage')) {
                        return 'user-management-page';
                    }
                },
                // Daha iyi cache stratejisi
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId
                        ? chunkInfo.facadeModuleId.split('/').pop()
                        : 'chunk';
                    return 'assets/js/[name]-[hash:8].js';
                },
                entryFileNames: 'assets/js/[name]-[hash:8].js',
                assetFileNames: (assetInfo) => {
                    const safeName = assetInfo.name || 'asset.bin';
                    const info = safeName.split('.');
                    const ext = info[info.length - 1] || 'bin';
                    if (/\.(css)$/.test(safeName)) {
                        return `assets/css/[name]-[hash:8].${ext}`;
                    }
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(safeName)) {
                        return `assets/img/[name]-[hash:8].${ext}`;
                    }
                    return `assets/[name]-[hash:8].${ext}`;
                },
            },
            external: (id) => {
                // External olarak işaretlenecek modüller
                return ['virtual:pwa-register'].includes(id);
            },
            // React singleton için global variables - rollupOptions altında değil
        },
        sourcemap: false, // Production'da sourcemap kapalı
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 5, // Daha fazla optimizasyon
                unsafe: false,
                // Daha agresif optimizasyonlar
                pure_funcs: [
                    'console.log',
                    'console.info',
                    'console.debug',
                    'console.warn',
                    'console.error',
                ],
                dead_code: true,
                unused: true,
                evaluate: true,
                reduce_vars: true,
                collapse_vars: true,
                hoist_funs: true,
                hoist_vars: true,
                if_return: true,
                join_vars: true,
                side_effects: false,
                // Remove all React DevTools related code
                toplevel: true,
                module: true,
            },
            mangle: {
                safari10: true,
                // Daha iyi mangle stratejisi
                properties: {
                    regex: /^_/,
                },
            },
            format: {
                comments: false,
                // Daha kompakt output
                beautify: false,
                ecma: 2020,
            },
        },
        // Daha hızlı build
        reportCompressedSize: false,
        // CSS optimizasyonu
        cssCodeSplit: true,
        // Chunk size limits
        assetsInlineLimit: 4096, // 4KB limit for inlining assets
    },
    server: {
        port: 5173,
        open: true,
    },
});
