import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // ১. প্রজেক্ট রুট থেকে ফাইল লোড হওয়া নিশ্চিত করে
    base: '/',
    
    // ২. নিশ্চিত করে যে 'public' ফোল্ডারের manifest.json সরাসরি 'dist' এ যাবে
    publicDir: 'public',

    plugins: [react()],

    define: {
      'global': 'globalThis',
      // 'process.env' কে সরাসরি JSON.stringify না করে এভাবে দেওয়া নিরাপদ
      'process.env': env,
      // 🚨 ফিক্স: 'process.nextTick' কে সরাসরি স্ট্রিং হিসেবে ডিফাইন না করে গ্লোবাল অবজেক্টে রাখা ভালো। 
      // তবে যদি একান্তই প্রয়োজন হয়, তবে নিচের ফরম্যাটটি ব্যবহার করুন:
      'process.nextTick': JSON.stringify('process.nextTick'),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'util': 'util/', 
        'stream': 'stream-browserify',
        'buffer': 'buffer',
        'events': 'events',
        'process': 'process/browser',
      },
    },

    server: {
      port: 5173,
      host: true, 
      strictPort: true,
      allowedHosts: [
        'onyx-drift.com',
        'www.onyx-drift.com',
        '.onyx-drift.com'
      ],
      hmr: {
        host: mode === 'production' ? 'onyx-drift.com' : 'localhost',
        protocol: mode === 'production' ? 'wss' : 'ws',
        clientPort: mode === 'production' ? 443 : 5173, 
      }
    },

    optimizeDeps: {
      include: [
        'buffer', 
        'stream-browserify', 
        'events',
        'util',
        'process'
      ],
      esbuildOptions: {
        // OptimizeDeps এর ভেতরেও global ডিফাইন করা জরুরি
        define: {
          global: 'globalThis'
        }
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          // ফাইলের নামের শেষে হ্যাশ কোড ক্যাশ সমস্যা সমাধান করে
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
  };
});