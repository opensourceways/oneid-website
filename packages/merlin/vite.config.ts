import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: './viteEnv',
  base: '/',
  build: {
    outDir: path.resolve(__dirname, '../../dist/merlin'),
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, './src')}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/shared/style/mixin/screen.scss" as *;
        @use "@/shared/style/mixin/font.scss" as *;
        @use "@/shared/style/mixin/common.scss" as *;
        @use "@/shared/style/mixin/repo-tag.scss" as *;
        `,
      },
    },
  },
  plugins: [
    vue(),
    vueJsx({}),
    Icons({
      compiler: 'vue3',
      customCollections: {
        app: FileSystemIconLoader(
          path.resolve(__dirname, '../shared/svg-icons')
        ),
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    proxy: {
      // '^/oneid/': {
      //    target: 'http://127.0.0.1:3060',
      //    secure: false,
      //    changeOrigin: false,
      //    rewrite: path => path.replace(/^\/oneid\//g, '/mock/oneid/')
      // },
      '/oneid/': {
        target: 'https://modelfoundry-oneid.test.osinfra.cn/',
        secure: false,
        changeOrigin: true,
      },
      '/statement/': {
        target: 'https://openmind.test.osinfra.cn/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
