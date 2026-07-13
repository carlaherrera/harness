import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
})

export const roleLogger = {
  start: (role: string) => logger.info({ msg: `[ROLE: ${role.toUpperCase()}] START` }),
  end: (role: string, durationMs: number) =>
    logger.info({ msg: `[ROLE: ${role.toUpperCase()}] END`, durationMs }),
  artifact: (role: string, count: number) =>
    logger.info({ msg: `[ROLE: ${role.toUpperCase()}] artifacts`, count }),
}
