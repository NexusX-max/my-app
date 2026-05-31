import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // .env ফাইল লোড করা
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    publicDir: 'public',
    plugins: [react()],

    define: {
      'global': 'globalThis',
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // শুধুমাত্র প্রয়োজনীয় পলিফিলগুলো রাখুন
        'buffer': 'buffer',
        'process': 'process/browser',
      },
    },

    server: {
      port: 5173,
      strictPort: true,
      host: true,
    },

    optimizeDeps: {
      // রিয়্যাক্ট এবং রিয়্যাক্ট-ডমকে এখানে অন্তর্ভুক্ত করার প্রয়োজন নেই, Vite নিজেই এগুলো বোঝে
      include: ['buffer', 'process'],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        },
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: false, // প্রোডাকশনে সাইজ কমাতে ফলস রাখুন
      minify: 'esbuild', // এটি দ্রুত এবং নিরাপদ
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          // রিয়্যাক্টকে আলাদা চঙ্কে ভাগ করবেন না, এতে কনটেক্সট এরর হয়
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