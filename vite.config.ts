import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from the sitephoto directory
      allow: ['..']
    }
  },
  // Configure static asset handling
  publicDir: 'public',
  // Add custom static file serving for sitephoto directory
  define: {
    // This helps with development
  },
  // Configure how assets are handled
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif'],
  // Add custom middleware to serve sitephoto files
  configureServer(server) {
    server.middlewares.use('/sitephoto', (req, res, next) => {
      // Serve files from the sitephoto directory
      const fs = require('fs')
      const path = require('path')
      
      const filePath = path.join(__dirname, 'sitephoto', req.url)
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.avif': 'image/avif'
        }
        
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
      } else {
        next()
      }
    })
  }
})
