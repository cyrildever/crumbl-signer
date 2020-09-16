import log4js from 'log4js'

export const logger = log4js.getLogger()

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: './crumbl-signer.log' }
  },
  categories: {
    default: { appenders: ['out', 'app'], level: 'debug' }
  }
})
