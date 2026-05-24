import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    publicDir: 'public',
    plugins: [react()],

    define: {
      'global': 'globalThis',
      'process.env': {}, // env এরর এড়াতে এটি ব্যবহার করুন
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Node.js মডিউলের জন্য সঠিক প্যাকেজ ব্যবহার নিশ্চিত করুন
        'util': 'util/',
        'stream': 'stream-browserify',
        'buffer': 'buffer',
        'events': 'events',
        'process': 'process/browser',
      },
    },

    server: {
      port: 5173,
      strictPort: true,
      host: true,
      hmr: {
        protocol: mode === 'production' ? 'wss' : 'ws',
        host: mode === 'production' ? 'onyx-drift.com' : 'localhost',
      }
    },

    optimizeDeps: {
      // 🚨 ফিক্স: এখানে react এবং react-dom যোগ করা জরুরি
      include: [
        'react', 
        'react-dom', 
        'buffer', 
        'stream-browserify', 
        'events',
        'process'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        },
      }
    },

    build: {
      outDir: 'dist',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // React-কে আলাদা ভেন্ডর চঙ্কে রাখা ভালো
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              return 'vendor';
            }
          }
        }
      }
    },
  };
});