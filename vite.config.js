import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        register: 'register.html',
        'forgot-password': 'forgot-password.html',
        'reset-password': 'reset-password.html',
        dashboard: 'dashboard.html'
      }
    }
  }
})
