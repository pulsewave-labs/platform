import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import rateLimit from 'express-rate-limit'

// Import routes
import healthRoutes from './routes/health'
import signalRoutes from './routes/signals'
import journalRoutes from './routes/journal'
import newsRoutes from './routes/news'
import levelsRoutes from './routes/levels'

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { rateLimitMiddleware } from './middleware/rate-limit'

// Import WebSocket handler
import { initWebSocket } from './ws/handler'

// Import services
import { initRedis } from './services/redis'
import { initSupabase } from './services/supabase'
import { initNewsAggregator } from './services/news-aggregator'
import { initSignalEngine } from './services/signal-engine'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.API_PORT || 3001
const HOST = process.env.HOST || 'localhost'

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Allow WebSocket connections
}))

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://pulsewave.app',
  'https://www.pulsewave.app'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Compression
app.use(compression())

// Request parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
}

// Rate limiting (only in production)
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_RATE_LIMITING === 'true') {
  app.use(rateLimitMiddleware)
}

// Health check endpoint (no auth required)
app.use('/health', healthRoutes)

// API versioning
const apiV1 = express.Router()

// Public routes (no auth required)
apiV1.use('/signals/public', signalRoutes) // Public signal feed
apiV1.use('/news/public', newsRoutes) // Public news feed

// Protected routes (auth required)
apiV1.use('/signals', authMiddleware, signalRoutes)
apiV1.use('/journal', authMiddleware, journalRoutes)
apiV1.use('/news', authMiddleware, newsRoutes)
apiV1.use('/levels', authMiddleware, levelsRoutes)

// Mount API router
app.use('/api/v1', apiV1)

// Webhook endpoints (no auth, but signature verification)
app.use('/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Stripe webhooks and other external services
  // These will be handled in separate route files
  next()
})

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Create HTTP server
const server = createServer(app)

// Initialize WebSocket server
const wsServer = new WebSocketServer({ 
  server,
  path: '/ws',
  perMessageDeflate: process.env.ENABLE_WEBSOCKET_COMPRESSION === 'true',
})

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting PulseWave API Server...')

    // Initialize external services
    console.log('📡 Initializing services...')
    await initRedis()
    await initSupabase()
    
    // Initialize WebSocket handler
    initWebSocket(wsServer)
    console.log('🔄 WebSocket server initialized')

    // Initialize background services
    if (process.env.ENABLE_NEWS_AGGREGATION === 'true') {
      await initNewsAggregator()
      console.log('📰 News aggregator initialized')
    }

    if (process.env.ENABLE_SIGNAL_ENGINE === 'true') {
      await initSignalEngine()
      console.log('🎯 Signal engine initialized')
    }

    // Start HTTP server
    server.listen(PORT, HOST, () => {
      console.log(`
╭─────────────────────────────────────────────╮
│  🌊 PulseWave API Server is running!        │
│                                             │
│  🚀 Environment: ${process.env.NODE_ENV?.padEnd(27) || 'development'.padEnd(27)} │
│  🌍 Server: http://${HOST}:${PORT}${' '.repeat(18)} │
│  📡 WebSocket: ws://${HOST}:${PORT}/ws${' '.repeat(13)} │
│  🏥 Health: http://${HOST}:${PORT}/health${' '.repeat(11)} │
│                                             │
│  📊 Ready to serve trading signals!         │
╰─────────────────────────────────────────────╯
      `)
    })

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`)
      
      server.close(() => {
        console.log('📴 HTTP server closed')
        
        // Close WebSocket connections
        wsServer.clients.forEach((ws) => {
          ws.terminate()
        })
        wsServer.close(() => {
          console.log('📴 WebSocket server closed')
        })
        
        console.log('✅ Server shutdown complete')
        process.exit(0)
      })

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
if (require.main === module) {
  startServer()
}

export { app, server, wsServer }