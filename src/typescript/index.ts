import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import config from 'config'
import mongo, { Collection } from 'mongodb'
import cors from 'cors'

import SignerController from './controller/SignerController'
import { SeedPath, INITIAL_PATH, isSeedPath, generateNewSessionSeedPath } from '.'
import { logger } from './utils/logger'
import { DataRequest } from './model/DataRequest'
import { RequestSeed } from './model/RequestSeed'

const main = async (): Promise<void> => {
  logger.info('Starting signer server...')

  const mongoUserName = config.get<string>('mongo.username')
  const mongoPassword = config.get<string>('mongo.password')
  const mongoDomain = config.get<string>('mongo.domain')
  const mongoPort = config.get<number>('mongo.port')
  const mongoDB = config.get<string>('mongo.db')
  const mongoCollection = config.get<string>('mongo.collection')
  const url = `mongodb://${mongoUserName}:${mongoPassword}@${mongoDomain}:${mongoPort}`
  const connection = await mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const collection: Collection<SeedPath | DataRequest | RequestSeed> = connection.db(mongoDB).collection(mongoCollection)

  updateSessionSeed(collection).then(done => {
    if (done) {
      const signerController = SignerController(collection)
      const port = config.get('http.port')
      express()
        .use(helmet(), cors(), compression())
        .use(express.urlencoded({ extended: true }))
        .use(express.json())
        .use((req, _, next) => {
          let url = req.originalUrl
          if (url.length > 128) {
            url = url.substring(0, 128) + '[...]'
          }
          logger.info(`Received ${req.method} request for ${url} with body ${JSON.stringify(req.body)} from ${req.ip}`)
          next()
        })
        .use('/', signerController)
        .listen(port, () =>
          logger.info(`Listening at http://localhost:${port}/`) // eslint-disable-line @typescript-eslint/restrict-template-expressions
        )
    } else {
      throw new Error('unable to update session seed')
    }
  }).catch(err => logger.fatal(err))
}

main().catch(err => logger.fatal(err))

/**
 * Update the session seed with the environment variable if any or generate a new one if need be.
 * 
 * @param collection the `signer` collection to use
 */
const updateSessionSeed = async (collection: mongo.Collection<SeedPath | any>): Promise<boolean> => {
  let seed = process.env.SESSION_SEED
  if (seed === undefined || seed === '') {
    seed = generateNewSessionSeedPath().seed
  }
  let update = false
  const existing = await collection.findOne({ type: 'SeedPath' }) // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  if (existing && isSeedPath(existing)) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
    if (existing.seed !== seed) {
      update = true
    }
  } else {
    update = true
  }
  if (update) {
    logger.info('Updating seed...')
    return await collection.updateOne({ type: 'SeedPath' }, {
      $set: {
        type: 'SeedPath',
        lastPath: INITIAL_PATH,
        seed: seed
      }
    }, { upsert: true })
      .then(r => {
        return r.result.n > 0
      })
      .catch(err => {
        logger.error(err)
        return false
      })
  }
  return Promise.resolve(true)
}

export * from './controller/SignerController'
export * from './model/DataRequest'
export * from './model/RequestSeed'
export * from './model/SeedPath'
