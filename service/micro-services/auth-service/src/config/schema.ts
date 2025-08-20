export const envSchema = {
  type: 'object',
  required: ['PORT'],// 'JWT_SECRET'], // These environment variables are required
  properties: {
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    PORT: {
      type: 'number',
      default: 3001
    },
    JWT_SECRET: {
      type: 'string'
    },
    REDIS_URL: {
      type: 'string',
      default: 'redis://localhost:6379'
    },
    DATABASE_URL: {
      type: 'string',
      default: 'postgresql://user:password@localhost:5432/hela_pay'
    }
  }
} as const;