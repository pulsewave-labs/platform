import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'

const router = Router()

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
    redis: 'connected' | 'disconnected' | 'error'
    signalEngine: 'connected' | 'disconnected' | 'error'
  }
  metrics: {
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: number
    activeConnections: number
  }
}

// Simple health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'PulseWave API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Detailed health check with service status
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now()
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'disconnected',
      redis: 'disconnected',
      signalEngine: 'disconnected',
    },
    metrics: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      activeConnections: 0, // This would be populated from WebSocket server
    },
  }

  // Check Supabase connection
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        health.services.database = 'error'
        overallStatus = 'degraded'
      } else {
        health.services.database = 'connected'
      }
    }
  } catch (error) {
    console.error('Health check - Database error:', error)
    health.services.database = 'error'
    overallStatus = 'degraded'
  }

  // Check Redis connection
  try {
    let redis: Redis | null = null
    
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Upstash Redis (production)
      redis = new Redis({
        host: new URL(process.env.UPSTASH_REDIS_REST_URL).hostname,
        port: parseInt(new URL(process.env.UPSTASH_REDIS_REST_URL).port) || 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
      })
    } else if (process.env.REDIS_URL) {
      // Local Redis (development)
      redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
      })
    }

    if (redis) {
      await redis.ping()
      health.services.redis = 'connected'
      await redis.quit()
    }
  } catch (error) {
    console.error('Health check - Redis error:', error)
    health.services.redis = 'error'
    overallStatus = 'degraded'
  }

  // Check Signal Engine connection
  try {
    if (process.env.SIGNAL_ENGINE_URL) {
      const response = await fetch(`${process.env.SIGNAL_ENGINE_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      })

      if (response.ok) {
        health.services.signalEngine = 'connected'
      } else {
        health.services.signalEngine = 'error'
        overallStatus = 'degraded'
      }
    }
  } catch (error) {
    console.error('Health check - Signal Engine error:', error)
    health.services.signalEngine = 'error'
    overallStatus = 'degraded'
  }

  // Determine overall health status
  const criticalServicesDown = 
    health.services.database === 'error' || 
    health.services.redis === 'error'

  if (criticalServicesDown) {
    overallStatus = 'unhealthy'
  }

  health.status = overallStatus

  const responseTime = Date.now() - startTime

  // Return appropriate HTTP status code
  const statusCode = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 207 : 503

  res.status(statusCode).json({
    ...health,
    responseTimeMs: responseTime,
  })
})

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if critical services are available
    let isReady = true
    const checks: Record<string, boolean> = {}

    // Database check
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        const { error } = await supabase.from('users').select('count').limit(1)
        checks.database = !error
        isReady = isReady && !error
      } catch {
        checks.database = false
        isReady = false
      }
    }

    // Redis check (optional for readiness)
    try {
      if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
        const redis = process.env.UPSTASH_REDIS_REST_URL ? 
          new Redis({
            host: new URL(process.env.UPSTASH_REDIS_REST_URL).hostname,
            port: parseInt(new URL(process.env.UPSTASH_REDIS_REST_URL).port) || 6379,
            password: process.env.UPSTASH_REDIS_REST_TOKEN,
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            lazyConnect: true,
          }) :
          new Redis(process.env.REDIS_URL!, {
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            lazyConnect: true,
          })

        await redis.ping()
        checks.redis = true
        await redis.quit()
      }
    } catch {
      checks.redis = false
      // Redis is not critical for readiness, so don't fail the check
    }

    if (isReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks,
      })
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks,
      })
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    })
  }
})

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req: Request, res: Response) => {
  // Simple check to ensure the process is alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  })
})

// Metrics endpoint (Prometheus format)
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  const prometheusMetrics = `
# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${metrics.rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${metrics.heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${metrics.heapUsed}
nodejs_memory_usage_bytes{type="external"} ${metrics.external}

# HELP nodejs_cpu_usage_seconds CPU usage in seconds
# TYPE nodejs_cpu_usage_seconds gauge
nodejs_cpu_usage_seconds{type="user"} ${cpuUsage.user / 1000000}
nodejs_cpu_usage_seconds{type="system"} ${cpuUsage.system / 1000000}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`.trim()

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.send(prometheusMetrics)
})

export default router